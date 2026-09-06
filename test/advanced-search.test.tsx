// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ConsultantShowcase } from '../src/components/showcase/ConsultantShowcase';
import { INITIAL_CONSULTANTS } from '../src/data/mockData';
import { Consultant } from '../src/types';

// Mock minimal ConsultantCard for fast DOM assertions
vi.mock('../src/components/ConsultantCard', () => ({
  ConsultantCard: ({ consultant }: { consultant: Consultant }) => (
    <div
      data-testid={`consultant-card-${consultant.id}`}
      data-name={consultant.name}
      data-price={consultant.pricePerMinute}
      data-rating={consultant.rating}
      data-experience={consultant.experienceYears}
      data-status={consultant.status}
    >
      <span className="card-name">{consultant.name}</span>
      <span className="card-price">R$ {consultant.pricePerMinute.toFixed(2)}</span>
      <span className="card-rating">★ {consultant.rating}</span>
    </div>
  ),
}));

// Mock Auth and Consultation Contexts
const mockUser = {
  id: 'user-1',
  name: 'Consulente Teste',
  email: 'teste@oraculos.ts',
  favorites: ['c1'], // Helena da Luz favorited
};

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
  }),
}));

vi.mock('../src/context/ConsultationContext', () => ({
  useConsultation: () => ({
    consultants: INITIAL_CONSULTANTS,
    isRechargeModalOpen: false,
    setIsRechargeModalOpen: vi.fn(),
    startConsultation: vi.fn(),
  }),
}));

describe('TESTE AVANÇADO DE USUÁRIO: BUSCA AVANÇADA, FILTROS E ORDENAÇÃO NO SITE', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('1. Usuário busca por texto: digita nome e filtra corretamente a lista', () => {
    render(
      <ConsultantShowcase
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    // Initial state: shows all consultants
    const initialCards = screen.getAllByTestId(/^consultant-card-/);
    expect(initialCards.length).toBe(INITIAL_CONSULTANTS.length);

    // User types "Helena" into the search input
    const searchInput = screen.getByPlaceholderText(/Buscar por oraculista/i);
    fireEvent.change(searchInput, { target: { value: 'Helena' } });

    // Should only show Helena da Luz
    const filteredCards = screen.getAllByTestId(/^consultant-card-/);
    expect(filteredCards.length).toBe(1);
    expect(screen.getByText('Helena da Luz')).toBeTruthy();

    // User clears search by clicking the clear 'X' button
    const clearBtn = screen.getByTitle(/Limpar busca/i);
    fireEvent.click(clearBtn);

    // List resets to all consultants
    expect(screen.getAllByTestId(/^consultant-card-/).length).toBe(INITIAL_CONSULTANTS.length);
  });

  it('2. Usuário filtra por status "Online Agora" e "Favoritos"', () => {
    render(
      <ConsultantShowcase
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    // Click "Online Agora"
    const onlineBtn = screen.getByRole('button', { name: /Online Agora/i });
    fireEvent.click(onlineBtn);

    const onlineCards = screen.getAllByTestId(/^consultant-card-/);
    // All displayed cards must have status 'online' or 'busy'
    onlineCards.forEach((card) => {
      const status = card.getAttribute('data-status');
      expect(['online', 'busy']).toContain(status);
    });

    // Click "Favoritos"
    const favoritesBtn = screen.getByRole('button', { name: /Favoritos/i });
    fireEvent.click(favoritesBtn);

    const favoriteCards = screen.getAllByTestId(/^consultant-card-/);
    expect(favoriteCards.length).toBe(1);
    expect(screen.getByText('Helena da Luz')).toBeTruthy();
  });

  it('3. Usuário seleciona categoria de oráculo (ex: Astrologia)', () => {
    const onSelectOracleCategory = vi.fn();
    render(
      <ConsultantShowcase
        onSelectOracleCategory={onSelectOracleCategory}
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    // Click on Astrologia chip
    const astrologiaBtn = screen.getByRole('button', { name: /Astrologia/i });
    fireEvent.click(astrologiaBtn);

    expect(onSelectOracleCategory).toHaveBeenCalledWith('astrologia');

    // Mestre Gabriel Astros is an astrologer
    expect(screen.getByText('Mestre Gabriel Astros')).toBeTruthy();
  });

  it('4. Usuário abre filtros avançados e filtra por faixa de preço por minuto', () => {
    render(
      <ConsultantShowcase
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    // Toggle advanced filter drawer
    const toggleBtn = screen.getByRole('button', { name: /Filtros Avançados/i });
    fireEvent.click(toggleBtn);

    // Drawer should be rendered
    const priceSelect = screen.getByLabelText(/Valor por Minuto/i);
    expect(priceSelect).toBeTruthy();

    // Select "Até R$ 3,50/min"
    fireEvent.change(priceSelect, { target: { value: 'under_35' } });

    // Verify all rendered consultants cost <= 3.50
    const filteredCards = screen.getAllByTestId(/^consultant-card-/);
    expect(filteredCards.length).toBeGreaterThan(0);
    filteredCards.forEach((card) => {
      const price = Number(card.getAttribute('data-price'));
      expect(price).toBeLessThanOrEqual(3.50);
    });
  });

  it('5. Usuário filtra por avaliação mínima (★ 4.8+) nos filtros avançados', () => {
    render(
      <ConsultantShowcase
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    // Open advanced drawer
    const toggleBtn = screen.getByRole('button', { name: /Filtros Avançados/i });
    fireEvent.click(toggleBtn);

    // Select rating >= 4.8
    const ratingSelect = screen.getByLabelText(/Avaliação Mínima/i);
    fireEvent.change(ratingSelect, { target: { value: '4.8' } });

    const filteredCards = screen.getAllByTestId(/^consultant-card-/);
    expect(filteredCards.length).toBeGreaterThan(0);
    filteredCards.forEach((card) => {
      const rating = Number(card.getAttribute('data-rating'));
      expect(rating).toBeGreaterThanOrEqual(4.8);
    });
  });

  it('6. Usuário filtra por experiência de prática (10+ anos)', () => {
    render(
      <ConsultantShowcase
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    // Open advanced drawer
    fireEvent.click(screen.getByRole('button', { name: /Filtros Avançados/i }));

    // Select 10+ years
    const expSelect = screen.getByLabelText(/Tempo de Prática/i);
    fireEvent.change(expSelect, { target: { value: '10' } });

    const filteredCards = screen.getAllByTestId(/^consultant-card-/);
    expect(filteredCards.length).toBeGreaterThan(0);
    filteredCards.forEach((card) => {
      const exp = Number(card.getAttribute('data-experience'));
      expect(exp).toBeGreaterThanOrEqual(10);
    });
  });

  it('7. Usuário filtra por tema de consulta (ex: Amor & Relacionamentos)', () => {
    render(
      <ConsultantShowcase
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    // Open advanced drawer
    fireEvent.click(screen.getByRole('button', { name: /Filtros Avançados/i }));

    // Select theme: amor
    const themeSelect = screen.getByLabelText(/Tema da Consulta/i);
    fireEvent.change(themeSelect, { target: { value: 'amor' } });

    const filteredCards = screen.getAllByTestId(/^consultant-card-/);
    expect(filteredCards.length).toBeGreaterThan(0);
  });

  it('8. Usuário ordena a lista: Menor Preço e Maior Avaliação', () => {
    render(
      <ConsultantShowcase
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    // Sort by price_asc
    const sortSelect = document.getElementById('sort-consultants-select') as HTMLSelectElement;
    fireEvent.change(sortSelect, { target: { value: 'price_asc' } });

    const priceSortedCards = screen.getAllByTestId(/^consultant-card-/);
    const prices = priceSortedCards.map((c) => Number(c.getAttribute('data-price')));
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }

    // Sort by rating desc
    fireEvent.change(sortSelect, { target: { value: 'rating' } });
    const ratingSortedCards = screen.getAllByTestId(/^consultant-card-/);
    const ratings = ratingSortedCards.map((c) => Number(c.getAttribute('data-rating')));
    for (let i = 0; i < ratings.length - 1; i++) {
      expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i + 1]);
    }
  });

  it('9. Usuário vê as tags de filtros ativos e remove filtros individualmente ou todos de uma vez', () => {
    render(
      <ConsultantShowcase
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    // Apply a search term
    const searchInput = screen.getByPlaceholderText(/Buscar por oraculista/i);
    fireEvent.change(searchInput, { target: { value: 'Cigano' } });

    // Badge for search should appear in the summary bar
    expect(screen.getByText(/Busca: "Cigano"/i)).toBeTruthy();

    // Click "Limpar todos"
    const clearAllBtn = screen.getByText(/Limpar todos/i);
    fireEvent.click(clearAllBtn);

    // Search input should be cleared
    expect((searchInput as HTMLInputElement).value).toBe('');
    expect(screen.getAllByTestId(/^consultant-card-/).length).toBe(INITIAL_CONSULTANTS.length);
  });

  it('10. Usuário faz busca que não retorna nenhum resultado: exibe empty state com botão para redefinir', () => {
    render(
      <ConsultantShowcase
        onSelectConsultant={vi.fn()}
        onStartConsultation={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Buscar por oraculista/i);
    fireEvent.change(searchInput, { target: { value: 'TextoInexistenteXYZ123' } });

    // Empty state is rendered
    expect(screen.getByText(/Nenhum oraculista atende aos critérios selecionados/i)).toBeTruthy();
    expect(screen.queryByTestId(/^consultant-card-/)).toBeNull();

    // Click "Limpar Todos os Filtros" button in empty state
    const clearBtn = screen.getByRole('button', { name: /Limpar Todos os Filtros/i });
    fireEvent.click(clearBtn);

    // Full list is restored
    expect(screen.getAllByTestId(/^consultant-card-/).length).toBe(INITIAL_CONSULTANTS.length);
  });
});
