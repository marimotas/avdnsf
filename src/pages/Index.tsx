import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import type { User } from '@supabase/supabase-js';
import logoNsf from '@/assets/logo_nsfs.png';

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({
  icon,
  title,
  description,
  onClick,
  disabled,
  badge,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
  accent?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full text-left group relative border rounded-lg p-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    style={{
      background: accent ? 'rgba(0,102,255,0.06)' : '#0A0A0A',
      borderColor: accent ? 'rgba(0,102,255,0.25)' : 'hsl(var(--border))',
    }}
    onMouseEnter={e => {
      if (!disabled) (e.currentTarget as HTMLElement).style.borderColor = accent ? 'rgba(0,102,255,0.5)' : 'rgba(0,102,255,0.3)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.borderColor = accent ? 'rgba(0,102,255,0.25)' : 'hsl(var(--border))';
    }}
  >
    <div className="flex items-start gap-4">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-[6px] flex items-center justify-center"
        style={{
          background: accent ? 'rgba(0,102,255,0.15)' : 'rgba(0,102,255,0.1)',
          border: accent ? '1px solid rgba(0,102,255,0.35)' : '1px solid rgba(0,102,255,0.2)',
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-foreground">
            {title}
          </p>
          {badge && (
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(100,100,100,0.15)',
                border: '1px solid rgba(100,100,100,0.2)',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {!disabled && (
        <svg
          className="flex-shrink-0 w-4 h-4 text-muted-foreground/30 mt-0.5"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  </button>
);

// ─── Login screen ─────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin, loading }: { onLogin: () => void; loading: boolean }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#000' }}>
    <div className="w-full max-w-sm space-y-8">
      <div className="flex flex-col items-center gap-4">
        <img src={logoNsf} alt="NSF" className="w-14 h-14" />
        <div className="text-center space-y-2">
          <h1 className="text-foreground font-black text-2xl tracking-tight">Portal do Colaborador</h1>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Acesse avaliações, expectativas e seus resultados com sua conta{' '}
            <span className="text-foreground font-medium">@semfronteiras.app</span>.
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg p-8" style={{ background: '#0A0A0A' }}>
        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[4px] border border-border text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-white/5 disabled:opacity-50"
          style={{ background: '#111' }}
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {loading ? 'Entrando...' : 'Continuar com Google'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Portal ───────────────────────────────────────────────────────────────────
const Portal = ({
  user,
  isAdmin,
  onSignOut,
}: {
  user: User;
  isAdmin: boolean;
  onSignOut: () => void;
}) => {
  const navigate = useNavigate();

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    '';
  const firstName = displayName.split(' ')[0];
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoNsf} alt="NSF" className="w-7 h-7" />
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-foreground" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '14px' }}>
                nutrição sem fronteiras
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', color: 'hsl(var(--text-dim))', letterSpacing: '0.03em' }}>
                portal do colaborador · ciclo 2026.1
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {avatar && <img src={avatar} alt={displayName} className="w-6 h-6 rounded-full" />}
            <button onClick={onSignOut} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16 max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Greeting */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bem-vindo(a)</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">{firstName}</h1>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <FeatureCard
            icon={
              <svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            }
            title="Avaliação de Desempenho"
            description="Responda às avaliações dos seus colegas e liderados para o ciclo 2026.1."
            onClick={() => navigate('/avaliacao')}
          />

          <FeatureCard
            icon={
              <svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            }
            title="Declaração de Expectativas"
            description="Registre e acompanhe suas metas e expectativas para o ciclo atual."
            onClick={() => {}}
            disabled
            badge="Em breve"
          />

          <FeatureCard
            icon={
              <svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            }
            title="Meus Resultados"
            description="Veja seu relatório de desempenho com feedbacks e pontuações do ciclo."
            onClick={() => navigate('/meu-resultado')}
          />

          {/* Admin-only card */}
          {isAdmin && (
            <FeatureCard
              accent
              icon={
                <svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              }
              title="Resultados NSF"
              description="Acompanhe o desempenho de toda a equipe na matriz 9-Box e por cluster."
              onClick={() => navigate('/resultados')}
            />
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/30 pb-4">
          ciclo 2026.1 · nutrição sem fronteiras
        </p>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) checkAdmin(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/`,
        extraParams: { hd: 'semfronteiras.app', prompt: 'select_account' },
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} loading={loginLoading} />;

  return <Portal user={user} isAdmin={isAdmin} onSignOut={handleSignOut} />;
};

export default Index;
