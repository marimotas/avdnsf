import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { emptyState, type EvaluationState } from './types';
import SelectionScreen from './SelectionScreen';
import QuestionsScreen from './QuestionsScreen';
import ConfirmationScreen from './ConfirmationScreen';
import logoNsf from '@/assets/logo_nsfs.png';
import { useCicloAtivo } from '@/hooks/useCicloAtivo';
import { useJanelaAtiva } from '@/hooks/useJanelaAtiva';

type Screen = 'selection' | 'questions' | 'confirmation';

const NineBoxApp = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('selection');
  const [state, setState] = useState<EvaluationState>(emptyState());
  const [avaliadorNome, setAvaliadorNome] = useState('');

  const { ciclo, loading: cicloLoading } = useCicloAtivo();
  const { aberta: janelaAberta, loading: janelaLoading } = useJanelaAtiva('avaliacao_desempenho', ciclo);

  const janelaAtiva = !cicloLoading && !janelaLoading && !!ciclo && janelaAberta;
  const carregando = cicloLoading || janelaLoading;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user;
      const name = u?.user_metadata?.full_name || u?.user_metadata?.name || u?.email?.split('@')[0] || 'Usuário Demo';
      setAvaliadorNome(name);
      setState(prev => ({ ...prev, avaliadorNome: name }));
    });
  }, [navigate]);

  const handleStart = (data: EvaluationState) => {
    setState(data);
    setScreen('questions');
  };

  const handleSubmitted = () => setScreen('confirmation');

  const handleRestart = () => {
    setState({ ...emptyState(), avaliadorNome });
    setScreen('selection');
  };

  // Tela de bloqueio quando a janela está fechada
  if (!carregando && !janelaAtiva) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={logoNsf} alt="NSF Logo" className="w-7 h-7" />
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-foreground" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '14px' }}>
                  nutrição sem fronteiras
                </span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.03em' }}>
                  avaliação de desempenho
                </span>
              </div>
            </div>
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Portal
            </button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center pt-16 px-6">
          <div className="text-center max-w-sm space-y-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(100,100,100,0.08)', border: '1px solid rgba(100,100,100,0.15)' }}>
              <svg className="w-6 h-6 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight">Avaliação encerrada</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {!ciclo
                  ? 'Nenhum ciclo ativo no momento. Aguardando abertura pelo RH.'
                  : 'A janela de avaliação de desempenho está fechada. Aguardando abertura pelo RH.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              style={{ background: '#0A0A0A' }}
            >
              Voltar ao Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoNsf} alt="NSF Logo" className="w-7 h-7" />
            <div className="flex flex-col leading-none gap-0.5">
              <span
                className="text-foreground"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '14px', letterSpacing: '0.01em' }}
              >
                nutrição sem fronteiras
              </span>
              <span
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', color: 'hsl(var(--text-dim))', letterSpacing: '0.03em' }}
              >
                avaliação de desempenho · ciclo 2026.1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {avaliadorNome && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {avaliadorNome}
              </span>
            )}
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
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Portal
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16">
        {screen === 'selection' && (
          <SelectionScreen initial={state} avaliadorNome={avaliadorNome} onContinue={handleStart} />
        )}
        {screen === 'questions' && (
          <QuestionsScreen state={state} onChange={setState} onSubmitted={handleSubmitted} />
        )}
        {screen === 'confirmation' && (
          <ConfirmationScreen colaboradorNome={state.colaboradorNome} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
};

export default NineBoxApp;
