import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { emptyState, type EvaluationState } from './types';
import SelectionScreen from './SelectionScreen';
import QuestionsScreen from './QuestionsScreen';
import ConfirmationScreen from './ConfirmationScreen';
import LoginScreen from './LoginScreen';
import logoNsf from '@/assets/logo_nsfs.png';

type Screen = 'selection' | 'questions' | 'confirmation';

const ALLOWED_DOMAIN = 'semfronteiras.app';

const NineBoxApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [domainError, setDomainError] = useState(false);

  const [screen, setScreen] = useState<Screen>('selection');
  const [state, setState] = useState<EvaluationState>(emptyState());

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      if (u) {
        const email = u.email ?? '';
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          setDomainError(true);
          supabase.auth.signOut();
          setUser(null);
        } else {
          setDomainError(false);
          setUser(u);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      if (u) {
        const email = u.email ?? '';
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          setDomainError(true);
          supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(u);
        }
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pre-fill avaliador from Google profile
  useEffect(() => {
    if (user) {
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        '';
      setState((prev) => ({ ...prev, avaliadorNome: displayName }));
    }
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setState(emptyState());
    setScreen('selection');
  };

  const handleStart = (data: EvaluationState) => {
    setState(data);
    setScreen('questions');
  };

  const handleSubmitted = () => {
    setScreen('confirmation');
  };

  const handleRestart = () => {
    const displayName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      '';
    setState({ ...emptyState(), avaliadorNome: displayName });
    setScreen('selection');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {domainError && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg border text-sm font-medium"
            style={{ background: '#1A0A0A', borderColor: 'hsl(0 72% 40%)', color: 'hsl(0 72% 70%)' }}>
            Acesso permitido apenas para contas <strong>@semfronteiras.app</strong>.
          </div>
        )}
        <LoginScreen />
      </>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    '';

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

          {/* Right: user + cycle badge + logout */}
          <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={displayName}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <button
                onClick={handleSignOut}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Sair"
              >
                Sair
              </button>
            </div>
          </div>
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
