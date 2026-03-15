import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import logoNsf from '@/assets/logo_nsfs.png';
import { useCicloAtivo } from '@/hooks/useCicloAtivo';
import { useJanelaAtiva } from '@/hooks/useJanelaAtiva';

type DeclaracaoData = {
  declaracao: string | null;
  metas: string | null;
};

// ─── Feature Button ────────────────────────────────────────────────────────────
const FeatureBtn = ({
  icon, title, description, onClick, disabled, badge, accent, primary, janelaAberta,
}: {
  icon: React.ReactNode; title: string; description: string;
  onClick: () => void; disabled?: boolean; badge?: string; accent?: boolean;
  primary?: boolean; janelaAberta?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full text-left border rounded-[6px] p-4 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 min-h-[52px]"
    style={{
      background: primary
        ? 'rgba(0,102,255,0.10)'
        : accent
        ? 'rgba(0,102,255,0.06)'
        : '#0A0A0A',
      borderColor: primary
        ? 'rgba(0,102,255,0.35)'
        : accent
        ? 'rgba(0,102,255,0.25)'
        : 'hsl(var(--border))',
      borderWidth: primary ? '1px' : undefined,
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-[6px] flex items-center justify-center"
        style={{
          background: primary
            ? 'rgba(0,102,255,0.20)'
            : accent
            ? 'rgba(0,102,255,0.15)'
            : 'rgba(0,102,255,0.08)',
          border: primary
            ? '1px solid rgba(0,102,255,0.4)'
            : accent
            ? '1px solid rgba(0,102,255,0.3)'
            : '1px solid rgba(0,102,255,0.15)',
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground">{title}</span>
          {badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(100,100,100,0.2)', color: 'hsl(var(--muted-foreground))' }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{description}</p>
        {janelaAberta && (
          <span
            className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{
              color: '#4ade80',
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.3)',
              animation: 'janela-pulse 2s ease-in-out infinite',
            }}
          >
            ● janela aberta
          </span>
        )}
      </div>
      {!disabled && (
        <svg className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

// ─── Status Pill ───────────────────────────────────────────────────────────────
const StatusPill = ({ filled }: { filled: boolean }) => (
  <span
    className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full"
    style={
      filled
        ? { color: '#4ade80', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }
        : { color: 'hsl(var(--muted-foreground))', background: 'rgba(100,100,100,0.10)', border: '1px solid rgba(100,100,100,0.18)' }
    }
  >
    {filled ? '● preenchido' : '○ pendente'}
  </span>
);

// ─── Portal ───────────────────────────────────────────────────────────────────
const Portal = ({ user, isAdmin, onSignOut }: { user: User; isAdmin: boolean; onSignOut: () => void }) => {
  const navigate = useNavigate();
  const [declaracao, setDeclaracaoData] = useState<DeclaracaoData | null>(null);
  const { ciclo, loading: cicloLoading } = useCicloAtivo();
  const { aberta: janelaAvaliacaoAberta, loading: janelaAvaliacaoLoading } = useJanelaAtiva('avaliacao_desempenho', ciclo);
  const avaliacaoAtiva = !cicloLoading && !janelaAvaliacaoLoading && !!ciclo && janelaAvaliacaoAberta;

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
  const firstName = displayName.split(' ')[0];
  const avatar = user.user_metadata?.avatar_url;

  const loadDeclaracao = useCallback(async () => {
    if (!ciclo) {
      setDeclaracaoData({ declaracao: null, metas: null });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('declaracoes')
      .select('declaracao,metas')
      .eq('user_id', user.id)
      .eq('ciclo', ciclo)
      .maybeSingle();
    setDeclaracaoData(data ?? { declaracao: null, metas: null });
  }, [user.id, ciclo]);

  useEffect(() => {
    if (!cicloLoading) loadDeclaracao();
  }, [cicloLoading, loadDeclaracao]);

  const declaracaoPreenchida = !!declaracao?.declaracao;
  const metasPreenchidas = !!declaracao?.metas;

  return (
    <div className="min-h-screen bg-background">
      {/* Keyframes for pulsing badge */}
      <style>{`
        @keyframes janela-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
        <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoNsf} alt="NSF" className="w-7 h-7" />
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-foreground hidden sm:block" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '14px' }}>
                nutrição sem fronteiras
              </span>
              <span className="text-foreground sm:hidden" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '13px' }}>
                nsf
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.03em' }}>
                portal do colaborador
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {avatar && <img src={avatar} alt={displayName} className="w-7 h-7 rounded-full" />}
            <div className="flex flex-col leading-none hidden sm:flex">
              <span className="text-xs font-semibold text-foreground">{firstName}</span>
              <span className="text-[10px] text-muted-foreground/60">{user.email}</span>
            </div>
            <button onClick={onSignOut} className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-0 sm:min-w-0">
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Full-width content */}
      <div className="pt-16 w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Greeting */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs text-muted-foreground">Olá,</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{firstName}</h1>
          {ciclo && (
            <p className="text-xs text-muted-foreground/50 mt-0.5">
              Ciclo {ciclo} · avaliação de desempenho
            </p>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Buttons */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Acesso rápido</p>

            <FeatureBtn
              primary
              janelaAberta={avaliacaoAtiva}
              icon={<svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>}
              title="Avaliação de Desempenho"
              description={
                cicloLoading || janelaAvaliacaoLoading
                  ? 'Verificando disponibilidade...'
                  : avaliacaoAtiva
                  ? `Avalie seus colegas e liderados — Ciclo ${ciclo}.`
                  : !ciclo
                  ? 'Nenhum ciclo ativo. Aguardando abertura pelo RH.'
                  : 'Janela de avaliação encerrada. Aguardando abertura pelo RH.'
              }
              onClick={() => navigate('/avaliacao')}
              disabled={!avaliacaoAtiva}
              badge={avaliacaoAtiva ? undefined : 'Indisponível'}
            />

            <FeatureBtn
              icon={<svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
              title="Declaração de Expectativas"
              description="Registre e acompanhe suas metas e expectativas."
              onClick={() => navigate('/declaracoes')}
            />

            <FeatureBtn
              icon={<svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="Calibração"
              description="Participe do processo de calibração do ciclo."
              onClick={() => {}}
              disabled
              badge="Em breve"
            />

            <FeatureBtn
              icon={<svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
              title="Meus Resultados"
              description="Veja seu relatório de desempenho e feedbacks."
              onClick={() => navigate('/meu-resultado')}
            />

            <FeatureBtn
              icon={<svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>}
              title="Feedback"
              description="Envie e receba feedbacks da equipe."
              onClick={() => navigate('/feedback')}
            />

            {isAdmin && (
              <>
                <FeatureBtn
                  accent
                  icon={<svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
                  title="Painel NSF"
                  description="Declarações, metas e avaliações de desempenho da equipe."
                  onClick={() => navigate('/painel')}
                />
                <FeatureBtn
                  accent
                  icon={<svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  title="Configurações"
                  description="Gerencie acessos e permissões da plataforma."
                  onClick={() => navigate('/configuracoes')}
                />
              </>
            )}
          </div>

          {/* MIDDLE + RIGHT: Declaration + Metas */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Declaração */}
            <div className="border border-border rounded-[6px] p-5 flex flex-col" style={{ background: '#0A0A0A', minHeight: '260px' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Declaração de Expectativas</p>
                  {declaracao !== null && <StatusPill filled={declaracaoPreenchida} />}
                </div>
                <button
                  onClick={() => navigate('/declaracoes')}
                  className="text-[10px] text-primary hover:underline font-semibold flex-shrink-0 ml-2"
                >
                  {declaracaoPreenchida ? 'Editar' : 'Preencher'}
                </button>
              </div>
              <div className="flex-1">
                {declaracao === null ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary/60 animate-spin" />
                  </div>
                ) : declaracao.declaracao ? (
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-[10]">
                    {declaracao.declaracao}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                    <svg className="w-8 h-8 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                    <p className="text-xs text-muted-foreground/40">Nenhuma declaração preenchida ainda.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metas */}
            <div className="border border-border rounded-[6px] p-5 flex flex-col" style={{ background: '#0A0A0A', minHeight: '260px' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Metas</p>
                  {declaracao !== null && <StatusPill filled={metasPreenchidas} />}
                </div>
                <button
                  onClick={() => navigate('/declaracoes')}
                  className="text-[10px] text-primary hover:underline font-semibold flex-shrink-0 ml-2"
                >
                  {metasPreenchidas ? 'Editar' : 'Preencher'}
                </button>
              </div>
              <div className="flex-1">
                {declaracao === null ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary/60 animate-spin" />
                  </div>
                ) : declaracao.metas ? (
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-[10]">
                    {declaracao.metas}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                    <svg className="w-8 h-8 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                    </svg>
                    <p className="text-xs text-muted-foreground/40">Nenhuma meta preenchida ainda.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/20 mt-10">
          nutrição sem fronteiras
        </p>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const upsertProfile = (u: User) => {
      const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('profiles').upsert(
        { user_id: u.id, name, email: u.email ?? '' },
        { onConflict: 'user_id' }
      );
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) upsertProfile(u);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) upsertProfile(u);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data }: { data: boolean }) => setIsAdmin(!!data));
  }, [user]);

  const handleLogin = async () => {
    setLoginLoading(true);
    const { lovable } = await import('@/integrations/lovable/index');
    await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
      extraParams: { hd: 'semfronteiras.app', prompt: 'select_account' },
    });
    setLoginLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} loading={loginLoading} />;
  }

  return <Portal user={user} isAdmin={isAdmin} onSignOut={handleSignOut} />;
};

export default Index;
