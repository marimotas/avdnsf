import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import logoNsf from '@/assets/logo_nsfs.png';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
          queryParams: {
            hd: 'semfronteiras.app',
            prompt: 'select_account',
          },
        },
      });

      if (oauthError) throw oauthError;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Erro ao entrar com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#000' }}>
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4">
          <img src={logoNsf} alt="NSF" className="w-12 h-12" />
          <div className="text-center space-y-1">
            <h1
              className="text-foreground"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                fontSize: '20px',
                letterSpacing: '0.01em',
              }}
            >
              nutrição sem fronteiras
            </h1>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 300,
                fontSize: '12px',
                color: 'hsl(var(--text-dim))',
                letterSpacing: '0.05em',
              }}
            >
              avaliação de desempenho · ciclo 2026.1
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="border border-border rounded-lg p-8 space-y-6"
          style={{ background: '#0A0A0A' }}
        >
          <div className="space-y-1">
            <h2 className="text-foreground font-bold text-lg">Entrar</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use sua conta <span className="text-foreground font-medium">@semfronteiras.app</span> para acessar o formulário.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[4px] border border-border text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#111' }}
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Redirecionando...' : 'Continuar com Google'}
          </button>

          {error && (
            <p className="text-xs font-medium text-center" style={{ color: 'hsl(0 72% 51%)' }}>
              {error}
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/50">
          Acesso restrito à equipe NSF
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
