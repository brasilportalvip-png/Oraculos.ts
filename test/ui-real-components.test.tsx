// @vitest-environment jsdom
import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { ConsultantProfileModal } from '../src/components/ConsultantProfileModal';
import { OraclesDirectory } from '../src/components/OraclesDirectory';
import { INITIAL_CONSULTANTS } from '../src/data/mockData';
import { Consultant, OracleType } from '../src/types';

describe('TESTES DA INTERFACE REAL: ConsultantProfileModal E OraclesDirectory', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  const consultantHelena: Consultant = INITIAL_CONSULTANTS.find((c) => c.id === 'c1')!;
  const consultantGabriel: Consultant = INITIAL_CONSULTANTS.find((c) => c.id === 'c2')!;

  it('1. Deve renderizar ConsultantProfileModal com initialOracle autorizado e exibi-lo visualmente selecionado no DOM', () => {
    const handleClose = vi.fn();
    const handleStart = vi.fn();

    // Helena tem especialidades: ['tarot', 'cigano', 'mesaradionica']
    const { getByText } = render(
      <ConsultantProfileModal
        consultant={consultantHelena}
        initialOracle="cigano"
        onClose={handleClose}
        onStartConsultation={handleStart}
      />
    );

    // Confirma que o botão do Baralho Cigano está no DOM e ativo (com a classe de destaque bg-amber-500)
    const ciganoButton = getByText('Baralho Cigano').closest('button');
    expect(ciganoButton).toBeTruthy();
    expect(ciganoButton?.className).toContain('bg-amber-500');

    // O botão de Tarot não deve ter a classe ativa
    const tarotButton = getByText('Tarot').closest('button');
    expect(tarotButton).toBeTruthy();
    expect(tarotButton?.className).not.toContain('bg-amber-500');
  });

  it('2. Deve disparar onStartConsultation com o oráculo correto ao clicar em "Iniciar Chat Agora"', () => {
    const handleClose = vi.fn();
    const handleStart = vi.fn();

    const { getByText } = render(
      <ConsultantProfileModal
        consultant={consultantHelena}
        initialOracle="mesaradionica"
        onClose={handleClose}
        onStartConsultation={handleStart}
      />
    );

    // Clica no botão "Iniciar Chat Agora"
    const startButton = getByText('Iniciar Chat Agora');
    fireEvent.click(startButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleStart).toHaveBeenCalledTimes(1);
    expect(handleStart).toHaveBeenCalledWith(consultantHelena, 'mesaradionica', 'chat');
  });

  it('3. Deve permitir selecionar outro oráculo interativamente no modal e disparar consulta', () => {
    const handleClose = vi.fn();
    const handleStart = vi.fn();

    const { getByText } = render(
      <ConsultantProfileModal
        consultant={consultantHelena}
        initialOracle="tarot"
        onClose={handleClose}
        onStartConsultation={handleStart}
      />
    );

    // Clica em Baralho Cigano no modal
    const ciganoBtn = getByText('Baralho Cigano');
    fireEvent.click(ciganoBtn);

    // Inicia a consulta
    const startButton = getByText('Iniciar Chat Agora');
    fireEvent.click(startButton);

    expect(handleStart).toHaveBeenCalledWith(consultantHelena, 'cigano', 'chat');
  });

  it('4. Deve sincronizar e atualizar o oráculo selecionado quando o consultor ou initialOracle for alterado', () => {
    const handleClose = vi.fn();
    const handleStart = vi.fn();

    // Inicia com Helena e initialOracle = tarot
    const { rerender, getByText } = render(
      <ConsultantProfileModal
        consultant={consultantHelena}
        initialOracle="tarot"
        onClose={handleClose}
        onStartConsultation={handleStart}
      />
    );

    expect(getByText('Tarot').closest('button')?.className).toContain('bg-amber-500');

    // Rerender com Gabriel (especialidades: ['astrologia', 'numerologia', 'iching']) e initialOracle = 'numerologia'
    rerender(
      <ConsultantProfileModal
        consultant={consultantGabriel}
        initialOracle="numerologia"
        onClose={handleClose}
        onStartConsultation={handleStart}
      />
    );

    const numerologiaButton = getByText('Numerologia').closest('button');
    expect(numerologiaButton).toBeTruthy();
    expect(numerologiaButton?.className).toContain('bg-amber-500');

    // Clica em Iniciar Chat Agora com Gabriel
    fireEvent.click(getByText('Iniciar Chat Agora'));
    expect(handleStart).toHaveBeenCalledWith(consultantGabriel, 'numerologia', 'chat');
  });

  it('5. Deve aplicar fallback para a primeira especialidade permitida quando initialOracle for não-autorizado para o consultor', () => {
    const handleClose = vi.fn();
    const handleStart = vi.fn();

    // Helena NÃO tem 'runas' (suas especialidades são ['tarot', 'cigano', 'mesaradionica'])
    const { getByText } = render(
      <ConsultantProfileModal
        consultant={consultantHelena}
        initialOracle="runas"
        onClose={handleClose}
        onStartConsultation={handleStart}
      />
    );

    // Deve aplicar fallback na primeira especialidade de Helena ('tarot')
    const tarotButton = getByText('Tarot').closest('button');
    expect(tarotButton?.className).toContain('bg-amber-500');

    fireEvent.click(getByText('Iniciar Chat Agora'));
    expect(handleStart).toHaveBeenCalledWith(consultantHelena, 'tarot', 'chat');
  });

  it('6. Deve testar o fluxo real completo em viewport desktop (1280px) e mobile (375px)', () => {
    const handleStartFinal = vi.fn();

    const AppIntegrationFlow: React.FC = () => {
      const [selectedCategory, setSelectedCategory] = useState<OracleType | null>(null);
      const [activeConsultant, setActiveConsultant] = useState<Consultant | null>(null);

      return (
        <div>
          <OraclesDirectory
            onSelectOracleCategory={(oracle) => {
              setSelectedCategory(oracle);
              const matched = INITIAL_CONSULTANTS.find(
                (c) => !c.isAI && (c.specialties || []).includes(oracle)
              );
              if (matched) setActiveConsultant(matched);
            }}
          />

          {activeConsultant && (
            <ConsultantProfileModal
              consultant={activeConsultant}
              initialOracle={selectedCategory}
              onClose={() => setActiveConsultant(null)}
              onStartConsultation={(cons, oracle, mode) => {
                handleStartFinal(cons.id, oracle, mode);
              }}
            />
          )}
        </div>
      );
    };

    // 1. Simula Desktop (1280x800)
    act(() => {
      window.innerWidth = 1280;
      window.innerHeight = 800;
      window.dispatchEvent(new Event('resize'));
    });

    const { getByText, getAllByText, queryByText } = render(<AppIntegrationFlow />);

    // Clica no card de Astrologia & Mapa Astral no Diretório
    const astroCards = getAllByText('Astrologia & Mapa Astral');
    fireEvent.click(astroCards[0]);

    // O modal deve ter aberto com Mestre Gabriel Astros
    expect(getByText('Mestre Gabriel Astros')).toBeTruthy();

    // Inicia a consulta por vídeo
    fireEvent.click(getByText('Chamada de Vídeo'));

    expect(handleStartFinal).toHaveBeenCalledTimes(1);
    expect(handleStartFinal).toHaveBeenCalledWith('c2', 'astrologia', 'video');

    // 2. Simula Mobile (375x667)
    act(() => {
      window.innerWidth = 375;
      window.innerHeight = 667;
      window.dispatchEvent(new Event('resize'));
    });

    // Reabre o modal pelo diretório mobile
    fireEvent.click(astroCards[0]);
    expect(getByText('Mestre Gabriel Astros')).toBeTruthy();

    // Fecha o modal via botão de fechar
    const closeBtn = screen.getByLabelText('Fechar modal');
    fireEvent.click(closeBtn);

    // Confirma que o modal fechou
    expect(queryByText('Mestre Gabriel Astros')).toBeNull();
  });
});
