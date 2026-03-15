import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  calcularResultados,
  getGridPos,
  CLUSTER_COLORS,
  type ColaboradorResultado,
  type AvaliacaoRow,
} from '@/lib/ninebox-calc';
import logoNsf from '@/assets/logo_nsfs.png';
import { useCicloAtivo } from '@/hooks/useCicloAtivo';

// ─── Grid label config ────────────────────────────────────────────────────────
const GRID_CELLS = [
  // [col, row, nome, cluster]
  [0, 2, 'Potencial\nrepresado',      2],
  [1, 2, 'Promessa em\ndesenvolvimento', 3],
  [2, 2, 'Top\nperformer',            4],
  [0, 1, 'Em\ndesenvolvimento',       2],
  [1, 1, 'Profissional\nconsistente', 3],
  [2, 1, 'Gerador\nde valor',         4],
  [0, 0, 'Ponto\ncrítico',            1],
  [1, 0, 'Entregador\nestável',       2],
  [2, 0, 'Referência\ntécnica',       3],
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

const NivelBadge = ({ nivel }: { nivel: string }) => {
  const colors = nivel === 'Alto'
    ? { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' }
    : nivel === 'Médio'
    ? { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' }
    : { bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.3)', text: '#f87171' };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
    >
      {nivel}
    </span>
  );
};

const ScoreBar = ({ score, color }: { score: number; color: string }) => (
  <div className="h-1 rounded-full" style={{ background: '#1A1A1A' }}>
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: `${((score - 5) / 20) * 100}%`, background: color }}
    />
  </div>
);

// ─── 9-Box Grid visual ────────────────────────────────────────────────────────

const NineBoxGridVisual = ({ resultados }: { resultados: ColaboradorResultado[] }) => {
  return (
    <div className="space-y-2">
      {/* Y label */}
      <div className="flex gap-2 items-start">
        <div className="flex flex-col items-center justify-center w-5 mt-1" style={{ minHeight: '180px' }}>
          <span
            className="text-[9px] font-bold tracking-widest uppercase"
            style={{
              color: 'hsl(var(--text-dim))',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
          >
            Potencial ↑
          </span>
        </div>

        <div className="flex-1">
          {/* Grid 3×3 */}
          <div className="grid gap-1" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[2, 1, 0].map((row) =>
              [0, 1, 2].map((col) => {
                const cell = GRID_CELLS.find((c) => c[0] === col && c[1] === row)!;
                const cellNome = cell[2];
                const cluster = cell[3];
                const c = CLUSTER_COLORS[cluster];
                const occupants = resultados.filter((r) => {
                  const pos = getGridPos(r);
                  return pos.col === col && pos.row === row;
                });
                return (
                  <div
                    key={`${col}-${row}`}
                    className="rounded-[4px] border p-2 flex flex-col gap-1 min-h-[120px]"
                    style={{ background: c.bg, borderColor: c.border }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className="text-[9px] font-bold leading-tight"
                        style={{ color: c.text, whiteSpace: 'pre-line' }}
                      >
                        {cellNome}
                      </p>
                      {resultados.length > 0 && (
                        <span
                          className="text-[10px] font-black tabular-nums shrink-0"
                          style={{ color: c.badge }}
                        >
                          {Math.round((occupants.length / resultados.length) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {occupants.map((r) => (
                        <span
                          key={r.nome}
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-foreground"
                          style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                          {r.nome.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* X label */}
          <p className="text-center text-[9px] font-bold tracking-widest uppercase mt-1.5" style={{ color: 'hsl(var(--text-dim))' }}>
            Desempenho →
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {[1, 2, 3, 4].map((cl) => {
          const labels = ['Abaixo do esperado', 'Precisa melhorar', 'Mandou bem', 'Além do esperado'];
          const c = CLUSTER_COLORS[cl];
          return (
            <div key={cl} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.badge }} />
              <span className="text-[9px] text-muted-foreground">
                <span className="font-bold" style={{ color: c.text }}>C{cl}</span> {labels[cl - 1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Collaborator card ────────────────────────────────────────────────────────

const ColaboradorCard = ({ r }: { r: ColaboradorResultado }) => {
  const [open, setOpen] = useState(false);
  const c = CLUSTER_COLORS[r.quadrante.cluster];

  return (
    <div
      className="border rounded-[4px] p-5 space-y-4 transition-colors"
      style={{ background: '#0A0A0A', borderColor: open ? c.border : '#1A1A1A' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base truncate">{r.nome}</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: c.text }}>
            {r.quadrante.nome}
          </p>
        </div>
        <div
          className="shrink-0 text-xs font-black px-3 py-1 rounded-full"
          style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
        >
          C{r.quadrante.cluster}
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Desempenho</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tabular-nums text-foreground">
                {r.desempenhoScore.toFixed(1)}
              </span>
              <NivelBadge nivel={r.desempenhoNivel} />
            </div>
          </div>
          <ScoreBar score={r.desempenhoScore} color="#0066FF" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Potencial</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tabular-nums text-foreground">
                {r.potencialScore > 0 ? r.potencialScore.toFixed(1) : '—'}
              </span>
              {r.potencialScore > 0 && <NivelBadge nivel={r.potencialNivel} />}
            </div>
          </div>
          <ScoreBar score={r.potencialScore} color="hsl(0 0% 80%)" />
        </div>
      </div>

      {/* Cluster action */}
      <div
        className="rounded-[4px] px-3 py-2 text-xs leading-relaxed"
        style={{ background: c.bg, borderLeft: `2px solid ${c.border}`, color: c.text }}
      >
        <span className="font-bold">Ação recomendada: </span>
        <span style={{ color: 'hsl(var(--muted-foreground))' }}>{r.quadrante.clusterAcao}</span>
      </div>

      {/* Comments toggle */}
      {r.comentarios.length > 0 && (
        <div>
          <button
            onClick={() => setOpen(!open)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <span>{open ? '▲' : '▼'}</span>
            {r.comentarios.length} comentário{r.comentarios.length > 1 ? 's' : ''} recebido{r.comentarios.length > 1 ? 's' : ''}
          </button>
          {open && (
            <div className="mt-3 space-y-2">
              {r.comentarios.map((cmt, i) => (
                <div
                  key={i}
                  className="border border-border rounded-[4px] px-3 py-2 text-xs text-muted-foreground leading-relaxed italic"
                  style={{ background: '#050505' }}
                >
                  "{cmt}"
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const Resultados = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [resultados, setResultados] = useState<ColaboradorResultado[]>([]);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'nome' | 'quadrante' | 'cluster'>('nome');
  const [filterQuery, setFilterQuery] = useState('');




  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', u.id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsAdmin(!!data);
      }
      setAuthLoading(false);
    });
  }, []);

  // Load data when confirmed admin
  useEffect(() => {
    if (!isAdmin) return;
    setDataLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('avaliacoes')
      .select('colaborador_nome,tipo_avaliador,d1,d2,d3,d4,d5,p1,p2,p3,p4,p5,i1,i2,i3,i4,i5,comentario')
      .then(({ data, error: dbErr }: { data: AvaliacaoRow[] | null; error: unknown }) => {
        if (dbErr) { setError('Erro ao carregar dados.'); }
        else { setResultados(calcularResultados(data ?? [])); }
        setDataLoading(false);
      });

  }, [isAdmin]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">Você precisa estar logado para acessar esta página.</p>
          <button onClick={() => navigate('/')} className="text-xs font-bold text-primary hover:underline">
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="text-center space-y-2">
          <p className="font-bold text-foreground">Acesso restrito</p>
          <p className="text-muted-foreground text-sm">Você não tem permissão para visualizar os resultados.</p>
          <button onClick={() => navigate('/')} className="text-xs font-bold text-primary hover:underline mt-2 block">
            Voltar ao formulário
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const resultadosFiltrados = resultados.filter((r) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase().trim();
    if (filterType === 'nome') return r.nome.toLowerCase().includes(q);
    if (filterType === 'quadrante') return r.quadrante.nome.toLowerCase().includes(q);
    if (filterType === 'cluster') return (
      String(r.quadrante.cluster).includes(q) ||
      r.quadrante.clusterNome.toLowerCase().includes(q)
    );
    return true;
  });

  const clusterCounts = [1, 2, 3, 4].map((cl) => ({
    cl,
    count: resultados.filter((r) => r.quadrante.cluster === cl).length,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoNsf} alt="NSF" className="w-7 h-7" />
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-foreground" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '14px' }}>
                nutrição sem fronteiras
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', color: 'hsl(var(--text-dim))', letterSpacing: '0.03em' }}>
                resultados · ciclo 2026.1
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Portal
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16 max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Resultados</h1>
          <p className="text-muted-foreground text-sm">{resultados.length} colaboradores avaliados</p>
        </div>


        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}


        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : resultados.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            Nenhuma avaliação encontrada no banco de dados.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: grid + summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* 9-Box visual */}
              <div className="border border-border rounded-[4px] p-5 space-y-3" style={{ background: '#0A0A0A' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Matriz 9-Box</p>
                <NineBoxGridVisual resultados={resultados} />
              </div>

              {/* Cluster summary */}
              <div className="border border-border rounded-[4px] p-4 space-y-3" style={{ background: '#0A0A0A' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Clusters</p>
                <div className="space-y-2">
                  {clusterCounts.map(({ cl, count }) => {
                    const labels = ['Abaixo do esperado', 'Precisa melhorar', 'Mandou bem', 'Além do esperado'];
                    const c = CLUSTER_COLORS[cl];
                    return (
                      <div key={cl} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: c.badge }} />
                          <span className="text-xs text-muted-foreground">
                            <span className="font-bold" style={{ color: c.text }}>C{cl}</span> {labels[cl - 1]}
                          </span>
                        </div>
                        <span className="text-xs font-bold tabular-nums text-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: filter + collaborator cards */}
            <div className="lg:col-span-3 space-y-4">
              {/* Filter bar */}
              <div className="border border-border rounded-[4px] p-3 flex flex-col sm:flex-row gap-2" style={{ background: '#0A0A0A' }}>
                {/* Filter type buttons */}
                <div className="flex gap-1 flex-shrink-0">
                  {(['nome', 'quadrante', 'cluster'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setFilterType(type); setFilterQuery(''); }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-[4px] capitalize transition-all duration-150"
                      style={
                        filterType === type
                          ? { background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.4)', color: '#4D94FF' }
                          : { background: 'transparent', border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }
                      }
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                {/* Text input */}
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                  </svg>
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder={`Filtrar por ${filterType}...`}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] bg-transparent border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                  />
                  {filterQuery && (
                    <button
                      onClick={() => setFilterQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Count */}
              {filterQuery && (
                <p className="text-[11px] text-muted-foreground/50">
                  {resultadosFiltrados.length} resultado{resultadosFiltrados.length !== 1 ? 's' : ''} encontrado{resultadosFiltrados.length !== 1 ? 's' : ''}
                </p>
              )}

              {/* Cards */}
              {resultadosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm border border-border rounded-[4px]" style={{ background: '#0A0A0A' }}>
                  Nenhum colaborador encontrado para "{filterQuery}".
                </div>
              ) : (
                resultadosFiltrados
                  .sort((a, b) => b.quadrante.cluster - a.quadrante.cluster)
                  .map((r) => (
                    <ColaboradorCard key={r.nome} r={r} />
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resultados;

