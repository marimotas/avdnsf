import { useState } from 'react';
import { emptyState, type EvaluationState } from './types';
import SelectionScreen from './SelectionScreen';
import QuestionsScreen from './QuestionsScreen';
import ConfirmationScreen from './ConfirmationScreen';
import logoNsf from '@/assets/logo_nsf.webp';

type Screen = 'selection' | 'questions' | 'confirmation';

const NineBoxApp = () => {
  const [screen, setScreen] = useState<Screen>('selection');
  const [state, setState] = useState<EvaluationState>(emptyState());

  const handleStart = (data: EvaluationState) => {
    setState(data);
    setScreen('questions');
  };

  const handleSubmitted = () => {
    setScreen('confirmation');
  };

  const handleRestart = () => {
    setState(emptyState());
    setScreen('selection');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <img src={logoNsf} alt="NSF Logo" className="w-8 h-8 rounded-md" />
            <div className="flex flex-col leading-none">
              <span className="text-xs font-black tracking-widest text-foreground uppercase" style={{ letterSpacing: '0.12em' }}>
                Nutrição sem Fronteiras
              </span>
              <span className="text-[10px] font-medium" style={{ color: 'hsl(var(--text-dim))' }}>
                Avaliação de Desempenho
              </span>
            </div>
          </div>
          {/* Cycle badge */}
          <span
            className="text-[10px] font-bold tracking-widest px-3 py-1 rounded-full"
            style={{
              background: 'rgba(0,102,255,0.12)',
              border: '1px solid rgba(0,102,255,0.3)',
              color: '#4D94FF',
              letterSpacing: '0.08em',
            }}
          >
            CICLO 2026.1
          </span>
        </div>
      </header>

      {/* Page content – padded for fixed header */}
      <div className="pt-20">
        {screen === 'selection' && (
          <SelectionScreen
            initial={state}
            onContinue={handleStart}
          />
        )}
        {screen === 'questions' && (
          <QuestionsScreen
            state={state}
            onChange={setState}
            onSubmitted={handleSubmitted}
          />
        )}
        {screen === 'confirmation' && (
          <ConfirmationScreen
            colaboradorNome={state.colaboradorNome}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
};

export default NineBoxApp;
