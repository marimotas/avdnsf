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

const CICLOS = ['2026.1', '2026.2'] as const;
type Ciclo = (typeof CICLOS)[number];

// ─── Types ────────────────────────────────────────────────────────────────────
type DeclaracaoRow = {
  id: string;
  user_name: string;
  user_email: string;
  declaracao: string | null;
  metas: string | null;
  updated_at: string;
};

type JanelaStatus = {
  tipo: string;
  isOpen: boolean;
  abertura: string | null;
  fechamento: string | null;
};

type Tab = 'declaracoes' | 'metas' | 'avaliacao';

// ─── 9-Box helpers (copied from Resultados) ──────────────────────────────────
const GRID_CELLS = [
  [0, 2, 'Potencial\nrepresado', 2],
  [1, 2, 'Promessa em\ndesenvolvimento', 3],
  [2, 2, 'Top\nperformer', 4],
  [0, 1, 'Em\ndesenvolvimento', 2],
  [1, 1, 'Profissional\nconsistente', 3],
  [2, 1, 'Gerador\nde valor', 4],
  [0, 0, 'Ponto\ncrítico', 1],
  [1, 0, 'Entregador\nestável', 2],
  [2, 0, 'Referência\ntécnica', 3],
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

const NivelBadge = ({ nivel }: { nivel: string }) => {
  const colors =
    nivel === 'Alto'
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

// ─── Aba Declarações ──────────────────────────────────────────────────────────
const TabDeclaracoes = ({ declaracoes, loading }: { declaracoes: DeclaracaoRow[]; loading: boolean }) => {
  const [search, setSearch] = useState('');
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const filtered = declaracoes.filter((d) =>
    !search.trim() || d.user_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Filtrar por nome..." />
      {filtered.length === 0 ? (
        <EmptyState message="Nenhuma declaração encontrada." />
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="border border-border rounded-[4px] p-5 space-y-3"
              style={{ background: '#0A0A0A' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-foreground text-sm">{d.user_name}</p>
                  <p className="text-[11px] text-muted-foreground/50">{d.user_email}</p>
                </div>
                <span className="text-[10px] text-muted-foreground/40 shrink-0">{fmt(d.updated_at)}</span>
              </div>
              {d.declaracao ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                    Declaração de expectativas
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{d.declaracao}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/30 italic">Sem declaração preenchida.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Aba Metas ────────────────────────────────────────────────────────────────
const TabMetas = ({ declaracoes, loading }: { declaracoes: DeclaracaoRow[]; loading: boolean }) => {
  const [search, setSearch] = useState('');
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const filtered = declaracoes.filter((d) =>
    !search.trim() || d.user_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Filtrar por nome..." />
      {filtered.length === 0 ? (
        <EmptyState message="Nenhuma meta encontrada." />
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="border border-border rounded-[4px] p-5 space-y-3"
              style={{ background: '#0A0A0A' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-foreground text-sm">{d.user_name}</p>
                  <p className="text-[11px] text-muted-foreground/50">{d.user_email}</p>
                </div>
                <span className="text-[10px] text-muted-foreground/40 shrink-0">{fmt(d.updated_at)}</span>
              </div>
              {d.metas ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Metas</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{d.metas}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/30 italic">Sem metas preenchidas.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Aba Avaliação de Desempenho ──────────────────────────────────────────────
const NineBoxGridVisual = ({ resultados }: { resultados: ColaboradorResultado[] }) => (
  <div className="space-y-2">
    <div className="flex gap-2 items-start">
      <div className="flex flex-col items-center justify-center w-5 mt-1" style={{ minHeight: '180px' }}>
        <span
          className="text-[9px] font-bold tracking-widest uppercase"
          style={{ color: 'hsl(var(--muted-foreground))', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Potencial ↑
        </span>
      </div>
      <div className="flex-1">
        <div className="grid gap-1" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[2, 1, 0].map((row) =>
            [0, 1, 2].map((col) => {
              const cell = GRID_CELLS.find((c) => c[0] === col && c[1] === row)!;
              const cluster = cell[3];
              const c = CLUSTER_COLORS[cluster];
              const occupants = resultados.filter((r) => {
                const pos = getGridPos(r);
                return pos.col === col && pos.row === row;
              });
              return (
                <div
                  key={`${col}-${row}`}
                  className="rounded-[4px] border p-2 flex flex-col gap-1 min-h-[100px]"
                  style={{ background: c.bg, borderColor: c.border }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[9px] font-bold leading-tight" style={{ color: c.text, whiteSpace: 'pre-line' }}>
                      {cell[2]}
                    </p>
                    {resultados.length > 0 && (
                      <span className="text-[10px] font-black tabular-nums shrink-0" style={{ color: c.badge }}>
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
        <p className="text-center text-[9px] font-bold tracking-widest uppercase mt-1.5 text-muted-foreground">
          Desempenho →
        </p>
      </div>
    </div>
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

const ColaboradorCard = ({ r }: { r: ColaboradorResultado }) => {
  const [open, setOpen] = useState(false);
  const c = CLUSTER_COLORS[r.quadrante.cluster];
  return (
    <div
      className="border rounded-[4px] p-5 space-y-4 transition-colors"
      style={{ background: '#0A0A0A', borderColor: open ? c.border : '#1A1A1A' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base truncate">{r.nome}</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: c.text }}>{r.quadrante.nome}</p>
        </div>
        <div
          className="shrink-0 text-xs font-black px-3 py-1 rounded-full"
          style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
        >
          C{r.quadrante.cluster}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Desempenho</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tabular-nums text-foreground">{r.desempenhoScore.toFixed(1)}</span>
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
      <div
        className="rounded-[4px] px-3 py-2 text-xs leading-relaxed"
        style={{ background: c.bg, borderLeft: `2px solid ${c.border}`, color: c.text }}
      >
        <span className="font-bold">Ação recomendada: </span>
        <span className="text-muted-foreground">{r.quadrante.clusterAcao}</span>
      </div>
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

const TabAvaliacao = ({
  resultados,
  loading,
}: {
  resultados: ColaboradorResultado[];
  loading: boolean;
}) => {
  const [filterType, setFilterType] = useState<'nome' | 'quadrante' | 'cluster'>('nome');
  const [filterQuery, setFilterQuery] = useState('');

  const clusterCounts = [1, 2, 3, 4].map((cl) => ({
    cl,
    count: resultados.filter((r) => r.quadrante.cluster === cl).length,
  }));

  const resultadosFiltrados = resultados.filter((r) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase().trim();
    if (filterType === 'nome') return r.nome.toLowerCase().includes(q);
    if (filterType === 'quadrante') return r.quadrante.nome.toLowerCase().includes(q);
    if (filterType === 'cluster') return (
      String(r.quadrante.cluster).includes(q) || r.quadrante.clusterNome.toLowerCase().includes(q)
    );
    return true;
  });

  if (loading) return <LoadingSpinner />;
  if (resultados.length === 0)
    return <EmptyState message="Nenhuma avaliação encontrada no banco de dados." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left: grid + summary */}
      <div className="lg:col-span-2 space-y-6">
        <div className="border border-border rounded-[4px] p-5 space-y-3" style={{ background: '#0A0A0A' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Matriz 9-Box</p>
          <NineBoxGridVisual resultados={resultados} />
        </div>
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

      {/* Right: filter + cards */}
      <div className="lg:col-span-3 space-y-4">
        <div className="border border-border rounded-[4px] p-3 flex flex-col sm:flex-row gap-2" style={{ background: '#0A0A0A' }}>
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

        {filterQuery && (
          <p className="text-[11px] text-muted-foreground/50">
            {resultadosFiltrados.length} resultado{resultadosFiltrados.length !== 1 ? 's' : ''} encontrado{resultadosFiltrados.length !== 1 ? 's' : ''}
          </p>
        )}

        {resultadosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border border-border rounded-[4px]" style={{ background: '#0A0A0A' }}>
            Nenhum colaborador encontrado para "{filterQuery}".
          </div>
        ) : (
          resultadosFiltrados
            .sort((a, b) => b.quadrante.cluster - a.quadrante.cluster)
            .map((r) => <ColaboradorCard key={r.nome} r={r} />)
        )}
      </div>
    </div>
  );
};

// ─── Shared micro-components ──────────────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-20 text-muted-foreground text-sm">{message}</div>
);

const SearchInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-8 pr-3 py-2 text-xs rounded-[4px] bg-card border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
    />
  </div>
);

// ─── Cycle selector ───────────────────────────────────────────────────────────
const CicloSelector = ({
  activeCiclo,
  onChange,
  janelaStatus,
}: {
  activeCiclo: Ciclo;
  onChange: (c: Ciclo) => void;
  janelaStatus: Record<string, JanelaStatus[]>;
}) => (
  <div className="flex gap-2">
    {CICLOS.map((ciclo) => {
      const statuses = janelaStatus[ciclo] ?? [];
      const anyOpen = statuses.some((s) => s.isOpen);
      const isActive = activeCiclo === ciclo;
      return (
        <button
          key={ciclo}
          onClick={() => onChange(ciclo)}
          className="flex items-center gap-2 px-4 py-2 rounded-[4px] border text-xs font-bold transition-all duration-150"
          style={
            isActive
              ? { background: 'rgba(0,102,255,0.12)', borderColor: 'rgba(0,102,255,0.4)', color: '#4D94FF' }
              : { background: '#0A0A0A', borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }
          }
        >
          Ciclo {ciclo}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={
              anyOpen
                ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
                : { background: 'rgba(100,100,100,0.10)', border: '1px solid rgba(100,100,100,0.2)', color: 'hsl(var(--muted-foreground))' }
            }
          >
            {anyOpen ? '● Aberto' : '○ Fechado'}
          </span>
        </button>
      );
    })}
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const PainelNSF = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('declaracoes');
  const [activeCiclo, setActiveCiclo] = useState<Ciclo>('2026.1');

  // Janela statuses per ciclo
  const [janelaStatus, setJanelaStatus] = useState<Record<string, JanelaStatus[]>>({});

  // Declarações/Metas — keyed by ciclo
  const [declaracoesByCiclo, setDeclaracoesByCiclo] = useState<Record<string, DeclaracaoRow[]>>({});
  const [declaracoesLoading, setDeclaracoesLoading] = useState(false);

  // Avaliação — keyed by ciclo (avaliacoes table has no ciclo, so we use all for 2026.1 only)
  const [resultados, setResultados] = useState<ColaboradorResultado[]>([]);
  const [avaliacaoLoading, setAvaliacaoLoading] = useState(false);

  const [error, setError] = useState('');

  // Auth
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

  // Load janela statuses for all ciclos
  useEffect(() => {
    if (!isAdmin) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('janela_declaracoes')
      .select('ciclo,tipo,data_abertura,data_fechamento')
      .then(({ data }: { data: { ciclo: string; tipo: string; data_abertura: string; data_fechamento: string }[] | null }) => {
        if (!data) return;
        const now = new Date();
        const grouped: Record<string, JanelaStatus[]> = {};
        for (const row of data) {
          if (!grouped[row.ciclo]) grouped[row.ciclo] = [];
          grouped[row.ciclo].push({
            tipo: row.tipo,
            isOpen: now >= new Date(row.data_abertura) && now <= new Date(row.data_fechamento),
            abertura: row.data_abertura,
            fechamento: row.data_fechamento,
          });
        }
        setJanelaStatus(grouped);
      });
  }, [isAdmin]);

  // Load declarações for all ciclos
  useEffect(() => {
    if (!isAdmin) return;
    setDeclaracoesLoading(true);
    Promise.all(
      CICLOS.map((ciclo) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('declaracoes')
          .select('id,user_name,user_email,declaracao,metas,updated_at')
          .eq('ciclo', ciclo)
          .order('user_name', { ascending: true })
          .then(({ data }: { data: DeclaracaoRow[] | null }) => ({ ciclo, data: data ?? [] }))
      )
    ).then((results) => {
      const map: Record<string, DeclaracaoRow[]> = {};
      for (const r of results) map[r.ciclo] = r.data;
      setDeclaracoesByCiclo(map);
      setDeclaracoesLoading(false);
    }).catch(() => {
      setError('Erro ao carregar declarações.');
      setDeclaracoesLoading(false);
    });
  }, [isAdmin]);

  // Load avaliações (no ciclo column — only relevant for 2026.1)
  useEffect(() => {
    if (!isAdmin) return;
    setAvaliacaoLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('avaliacoes')
      .select('colaborador_nome,tipo_avaliador,d1,d2,d3,d4,d5,p1,p2,p3,p4,p5,i1,i2,i3,i4,i5,comentario')
      .then(({ data, error: dbErr }: { data: AvaliacaoRow[] | null; error: unknown }) => {
        if (dbErr) setError('Erro ao carregar avaliações.');
        else setResultados(calcularResultados(data ?? []));
        setAvaliacaoLoading(false);
      });
  }, [isAdmin]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const declaracoes = declaracoesByCiclo[activeCiclo] ?? [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="font-bold text-foreground">Acesso restrito</p>
          <p className="text-muted-foreground text-sm">Você não tem permissão para visualizar este painel.</p>
          <button onClick={() => navigate('/')} className="text-xs font-bold text-primary hover:underline mt-2 block">
            Voltar ao portal
          </button>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'declaracoes', label: 'Declarações de Expectativas', count: declaracoes.filter((d) => d.declaracao).length },
    { id: 'metas', label: 'Metas', count: declaracoes.filter((d) => d.metas).length },
    { id: 'avaliacao', label: 'Avaliação de Desempenho', count: resultados.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoNsf} alt="NSF" className="w-7 h-7" />
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-foreground" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '14px' }}>
                nutrição sem fronteiras
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.03em' }}>
                painel · ciclo {activeCiclo}
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

      <div className="pt-16 max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Painel NSF</h1>
          <p className="text-muted-foreground text-sm">Visão consolidada do ciclo {activeCiclo}</p>
        </div>

        {/* Cycle selector */}
        <CicloSelector
          activeCiclo={activeCiclo}
          onChange={(c) => setActiveCiclo(c)}
          janelaStatus={janelaStatus}
        />

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-border pb-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-150 border-b-2 -mb-px"
              style={
                activeTab === tab.id
                  ? { color: '#4D94FF', borderColor: '#0066FF' }
                  : { color: 'hsl(var(--muted-foreground))', borderColor: 'transparent' }
              }
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-full tabular-nums"
                  style={
                    activeTab === tab.id
                      ? { background: 'rgba(0,102,255,0.15)', color: '#4D94FF' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--muted-foreground))' }
                  }
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'declaracoes' && (
            <TabDeclaracoes declaracoes={declaracoes} loading={declaracoesLoading} />
          )}
          {activeTab === 'metas' && (
            <TabMetas declaracoes={declaracoes} loading={declaracoesLoading} />
          )}
          {activeTab === 'avaliacao' && (
            <TabAvaliacao
              resultados={activeCiclo === '2026.1' ? resultados : []}
              loading={avaliacaoLoading && activeCiclo === '2026.1'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PainelNSF;
