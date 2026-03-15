import { useState } from 'react';
import { emptyState, type EvaluationState } from './types';
import SelectionScreen from './SelectionScreen';
import QuestionsScreen from './QuestionsScreen';
import ConfirmationScreen from './ConfirmationScreen';
import logoNsf from '@/assets/logo_nsfs.png';

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
          <div className="flex items-center gap-2.5">
            <img src={logoNsf} alt="NSF Logo" className="w-7 h-7" />
            <div className="flex flex-col leading-none gap-0.5">
              <span
                className="text-foreground"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 500,
                  fontSize: '14px',
                  letterSpacing: '0.01em',
                }}
              >
                nutrição sem fronteiras
              </span>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 300,
                  fontSize: '10px',
                  color: 'hsl(var(--text-dim))',
                  letterSpacing: '0.03em',
                }}
              >
                avaliação de desempenho
              </span>
            </div>
          </div>
          {/* Cycle badge */}
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
              fontSize: '10px',
              letterSpacing: '0.08em',
              background: 'rgba(0,102,255,0.12)',
              border: '1px solid rgba(0,102,255,0.3)',
              color: '#4D94FF',
              padding: '3px 10px',
              borderRadius: '999px',
            }}
          >
            CICLO 2026.1
          </span>
        </div>
      </header>

      {/* Page content – padded for fixed header */}
      <div className="pt-16">
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
