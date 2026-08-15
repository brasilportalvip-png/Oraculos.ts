// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SpecialistDetailPage } from '../src/components/SpecialistDetailPage';
import { ArticleDetailPage } from '../src/components/blog/ArticleDetailPage';
import { OracleDetailPage } from '../src/components/OracleDetailPage';
import { NotFoundPage } from '../src/components/NotFoundPage';
import { INITIAL_CONSULTANTS } from '../src/data/mockData';
import { AuthProvider } from '../src/context/AuthContext';

describe('TESTES DE ROTAS INDIVIDUAIS: Especialistas, Artigos, Oráculos e 404', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('1. SpecialistDetailPage deve renderizar perfil do especialista correto', () => {
    const handleBack = vi.fn();
    const handleStart = vi.fn();

    render(
      <AuthProvider>
        <SpecialistDetailPage
          consultantId="c1"
          consultants={INITIAL_CONSULTANTS}
          onBack={handleBack}
          onStartConsultation={handleStart}
        />
      </AuthProvider>
    );

    expect(screen.getByText('Helena da Luz')).toBeTruthy();
    expect(screen.getByText(/Taróloga e Mestra em Baralho Cigano/)).toBeTruthy();
    expect(screen.getByText('R$ 3.50')).toBeTruthy();
  });

  it('2. SpecialistDetailPage deve renderizar 404 se o ID do especialista for inexistente', () => {
    const handleBack = vi.fn();
    const handleStart = vi.fn();

    render(
      <AuthProvider>
        <SpecialistDetailPage
          consultantId="especialista-falso-999"
          consultants={INITIAL_CONSULTANTS}
          onBack={handleBack}
          onStartConsultation={handleStart}
        />
      </AuthProvider>
    );

    expect(screen.getByText(/Erro 404/)).toBeTruthy();
    expect(screen.getByText('Caminho Não Encontrado')).toBeTruthy();
  });

  it('3. ArticleDetailPage deve renderizar artigo pelo slug', () => {
    const handleBack = vi.fn();
    const handleSelect = vi.fn();

    render(
      <AuthProvider>
        <ArticleDetailPage
          slug="portal-do-tarot-2026"
          onBack={handleBack}
          onSelectArticle={handleSelect}
        />
      </AuthProvider>
    );

    expect(screen.getAllByText(/O Portal do Tarot em 2026/)[0]).toBeTruthy();
    expect(screen.getByText('Helena da Luz')).toBeTruthy();
  });

  it('4. ArticleDetailPage deve renderizar 404 se o slug do artigo não existir', () => {
    const handleBack = vi.fn();
    const handleSelect = vi.fn();

    render(
      <AuthProvider>
        <ArticleDetailPage
          slug="artigo-inexistente-xyz"
          onBack={handleBack}
          onSelectArticle={handleSelect}
        />
      </AuthProvider>
    );

    expect(screen.getByText(/Erro 404/)).toBeTruthy();
    expect(screen.getByText('Caminho Não Encontrado')).toBeTruthy();
  });

  it('5. OracleDetailPage deve renderizar 404 para oráculo inválido sem fallback silencioso para tarot', () => {
    const handleBack = vi.fn();
    const handleSelect = vi.fn();
    const handleStart = vi.fn();

    render(
      <AuthProvider>
        <OracleDetailPage
          oracleId="oraculo-inexistente"
          consultants={INITIAL_CONSULTANTS}
          onBack={handleBack}
          onSelectConsultant={handleSelect}
          onStartConsultation={handleStart}
        />
      </AuthProvider>
    );

    expect(screen.getByText(/Erro 404/)).toBeTruthy();
    expect(screen.getByText('Caminho Não Encontrado')).toBeTruthy();
  });

  it('6. OracleDetailPage deve renderizar corretamente baralho-cigano e sinônimo cigano', () => {
    const handleBack = vi.fn();
    const handleSelect = vi.fn();
    const handleStart = vi.fn();

    const { unmount } = render(
      <AuthProvider>
        <OracleDetailPage
          oracleId="baralho-cigano"
          consultants={INITIAL_CONSULTANTS}
          onBack={handleBack}
          onSelectConsultant={handleSelect}
          onStartConsultation={handleStart}
        />
      </AuthProvider>
    );

    expect(screen.getByText('Baralho Cigano Lenormand: Clareza Prática e Objetiva')).toBeTruthy();
    unmount();

    render(
      <AuthProvider>
        <OracleDetailPage
          oracleId="cigano"
          consultants={INITIAL_CONSULTANTS}
          onBack={handleBack}
          onSelectConsultant={handleSelect}
          onStartConsultation={handleStart}
        />
      </AuthProvider>
    );

    expect(screen.getByText('Baralho Cigano Lenormand: Clareza Prática e Objetiva')).toBeTruthy();
  });
});
