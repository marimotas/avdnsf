import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  calcularResultados,
  CLUSTER_COLORS,
  type ColaboradorResultado,
  type AvaliacaoRow,
} from '@/lib/ninebox-calc';
import logoNsf from '@/assets/logo_nsfs.png';

// ─── Mini 9-Box ───────────────────────────────────────────────────────────────
const Mini9Box = ({ resultado }: { resultado: ColaboradorResultado }) => {
  const desMap = { Baixo: 0, Médio: 1, Alto: 2 };
  const potMap = { Baixo: 0, Médio: 1, Alto: 2 };
  const myCol = desMap[resultado.desempenhoNivel];
  const myRow = potMap[resultado.potencialNivel];

  return (
    <div className="space-y-1">
      {[2, 1, 0].map((row) => (
        <div key={row} className="flex gap-1">
          {[0, 1, 2].map((col) => {
            const isMe = col === myCol && row === myRow;
            const c = CLUSTER_COLORS[resultado.quadrante.cluster];
            return (
              <div
                key={col}
                className="w-10 h-10 rounded-[3px] flex items-center justify-center transition-all"
                style={
                  isMe
                    ? { background: c.bg, border: `2px solid ${c.border}` }
                    : { background: '#111', border: '1px solid #222' }
                }
              >
                {isMe && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.badge }} />
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div className="flex justify-between text-[8px] text-muted-foreground/50 pt-0.5 px-0.5">
        <span>Baixo</span>
        <span>Desempenho →</span>
        <span>Alto</span>
      </div>
    </div>
  );
};

// ─── Score bar ────────────────────────────────────────────────────────────────
const ScoreRow = ({
  label,
  score,
  nivel,
  color,
}: {
  label: string;
  score: number;
  nivel: string;
  color: string;
}) => {
  const nivelColor =
    nivel === 'Alto'
      ? { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' }
      : nivel === 'Médio'
      ? { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' }
      : { bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.3)', text: '#f87171' };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tabular-nums text-foreground">{score.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">/25</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: nivelColor.bg, border: `1px solid ${nivelColor.border}`, color: nivelColor.text }}
          >
            {nivel}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full" style={{ background: '#1A1A1A' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${((score - 5) / 20) * 100}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Login screen ─────────────────────────────────────────────────────────────
const LoginPrompt = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#000' }}>
    <div className="w-full max-w-sm space-y-8">
      <div className="flex flex-col items-center gap-4">
        <img src={logoNsf} alt="NSF" className="w-12 h-12" />
        <div className="text-center space-y-1">
          <h1 className="text-foreground font-bold text-xl">Meu Resultado</h1>
          <p className="text-xs text-muted-foreground">
            Entre com sua conta <span className="text-foreground font-medium">@semfronteiras.app</span> para ver seu relatório de desempenho.
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg p-8" style={{ background: '#0A0A0A' }}>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[4px] border border-border text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-white/5"
          style={{ background: '#111' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>
      </div>
    </div>
  </div>
);

// ─── Not found screen ─────────────────────────────────────────────────────────
const NaoEncontrado = ({ nome, onSignOut }: { nome: string; onSignOut: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4" style={{ background: '#000' }}>
    <p className="font-bold text-foreground">Nenhuma avaliação encontrada</p>
    <p className="text-sm text-muted-foreground max-w-xs">
      Não encontramos avaliações para <strong className="text-foreground">{nome}</strong>. Verifique com a equipe de RH se o ciclo foi concluído.
    </p>
    <button onClick={onSignOut} className="text-xs font-bold text-primary hover:underline mt-2">
      Sair
    </button>
  </div>
);

const MOCK_USER = { id: 'demo-user-id', email: 'demo@semfronteiras.app', user_metadata: { full_name: 'Usuário Demo' } } as unknown as User;

// ─── Main page ────────────────────────────────────────────────────────────────
const MeuResultado = () => {
  const navigate = useNavigate();
  const [user] = useState<User | null>(MOCK_USER);
  const [dataLoading, setDataLoading] = useState(false);
  const [resultado, setResultado] = useState<ColaboradorResultado | null>(null);
  const [notFound, setNotFound] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';

  useEffect(() => {
    if (!displayName) return;
    setDataLoading(true);
    setNotFound(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('avaliacoes')
      .select('colaborador_nome,tipo_avaliador,d1,d2,d3,d4,d5,p1,p2,p3,p4,p5,i1,i2,i3,i4,i5,comentario')
      .then(({ data }: { data: AvaliacaoRow[] | null }) => {
        const todos = calcularResultados(data ?? []);
        const meu = todos.find(
          (r) => r.nome.toLowerCase().trim() === displayName.toLowerCase().trim()
        );
        if (meu) setResultado(meu);
        else setNotFound(true);
        setDataLoading(false);
      });
  }, [displayName]);

  const handleSignOut = () => navigate('/');

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound) return <NaoEncontrado nome={displayName} onSignOut={handleSignOut} />;
  if (!resultado) return null;

  const c = CLUSTER_COLORS[resultado.quadrante.cluster];
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
                meu resultado · ciclo 2026.1
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Portal
            </button>
            {avatar && <img src={avatar} alt={displayName} className="w-6 h-6 rounded-full" />}
            <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Greeting */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Seu relatório</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">{resultado.nome}</h1>
        </div>

        {/* Cluster hero card */}
        <div
          className="border rounded-lg p-6 space-y-3"
          style={{ background: c.bg, borderColor: c.border }}
        >
          <div
            className="text-xs font-black px-3 py-1 rounded-full inline-block"
            style={{ background: 'rgba(0,0,0,0.4)', color: c.text, border: `1px solid ${c.border}` }}
          >
            CLUSTER {resultado.quadrante.cluster} — {resultado.quadrante.clusterNome.toUpperCase()}
          </div>
          <h2 className="text-2xl font-black text-foreground leading-tight">
            {resultado.quadrante.clusterNome}
          </h2>
        </div>

        {/* Scores */}
        <div className="border border-border rounded-[4px] p-5 space-y-5" style={{ background: '#0A0A0A' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pontuações</p>
          <ScoreRow
            label="Desempenho"
            score={resultado.desempenhoScore}
            nivel={resultado.desempenhoNivel}
            color="#0066FF"
          />
          {resultado.potencialScore > 0 && (
            <ScoreRow
              label="Potencial"
              score={resultado.potencialScore}
              nivel={resultado.potencialNivel}
              color="hsl(0 0% 75%)"
            />
          )}

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="space-y-0.5">
              <p className="font-bold uppercase tracking-widest text-[10px]">Avaliações recebidas</p>
              <p className="text-foreground font-semibold">
                {resultado.temLider ? '1 líder' : 'sem líder'}
                {resultado.temInteracao ? ' + avaliações de interação' : ''}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="font-bold uppercase tracking-widest text-[10px]">Escala</p>
              <p>5 a 25 pontos por dimensão</p>
            </div>
          </div>
        </div>

        {/* Comments */}
        {resultado.comentarios.length > 0 && (
          <div className="border border-border rounded-[4px] p-5 space-y-4" style={{ background: '#0A0A0A' }}>
            <div className="space-y-0.5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Feedbacks recebidos
              </p>
              <p className="text-[10px] text-muted-foreground/50">
                Comentários são anônimos — os avaliadores não são identificados.
              </p>
            </div>
            <div className="space-y-3">
              {resultado.comentarios.map((cmt, i) => (
                <div
                  key={i}
                  className="border-l-2 pl-4 py-1"
                  style={{ borderColor: c.border }}
                >
                  <p className="text-sm text-foreground leading-relaxed italic">"{cmt}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/40 pb-6">
        Este relatório é confidencial e destinado exclusivamente a você.
        </p>
      </div>
    </div>
  );
};

export default MeuResultado;
