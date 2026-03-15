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
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-0.5">
          <span className="text-sm font-bold tracking-widest text-primary-foreground uppercase">
            avaliação de desempenho NSF
          </span>
          <span className="text-xs text-white/70">
            9-Box Grid · Ciclo 2025
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
