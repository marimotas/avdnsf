import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  calcularResultados,
  getGridPos,
  CLUSTER_COLORS,
  type ColaboradorResultado,
  type AvaliacaoRow,
} from '@/lib/ninebox-calc';
import { useCicloAtivo } from '@/hooks/useCicloAtivo';
import logoNsf from '@/assets/logo_nsfs.png';

type EquipeRow = { colaborador_nome: string; colaborador_email: string };
type DeclaracaoRow = { id: string; user_name: string; user_email: string; declaracao: string | null; metas: string | null; updated_at: string };

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

// ─── Mini 9-box ────────────────────────────────────────────────────────────────
const NineBoxMini = ({ resultados }: { resultados: ColaboradorResultado[] }) => (
  <div className="space-y-1.5">
    <div className="flex gap-1.5 items-start">
      <div className="flex flex-col items-center justify-center w-4" style={{ minHeight: '160px' }}>
        <span className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          Potencial ↑
        </span>
      </div>
      <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {[2, 1, 0].map((row) =>
          [0, 1, 2].map((col) => {
            const cell = GRID_CELLS.find((c) => c[0] === col && c[1] === row)!;
            const cluster = cell[3];
            const c = CLUSTER_COLORS[cluster];
            const occupants = resultados.filter((r) => { const pos = getGridPos(r); return pos.col === col && pos.row === row; });
            return (
              <div key={`${col}-${row}`} className="rounded-[3px] border p-1.5 flex flex-col gap-1 min-h-[80px]" style={{ background: c.bg, borderColor: c.border }}>
                <div className="flex items-start justify-between gap-1">
                  <p className="text-[8px] font-bold leading-tight" style={{ color: c.text, whiteSpace: 'pre-line' }}>{cell[2]}</p>
                  {resultados.length > 0 && (
                    <span className="text-[10px] font-black tabular-nums shrink-0" style={{ color: c.badge }}>
                      {Math.round((occupants.length / resultados.length) * 100)}%
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {occupants.map((r) => (
                    <span key={r.nome} className="text-[8px] font-semibold px-1 py-0.5 rounded-full text-foreground" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      {r.nome.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    <p className="text-center text-[8px] font-bold tracking-widest uppercase text-muted-foreground">Desempenho →</p>
  </div>
);

// ─── Colaborador Card ──────────────────────────────────────────────────────────
const ColabCard = ({ r }: { r: ColaboradorResultado }) => {
  const [open, setOpen] = useState(false);
  const c = CLUSTER_COLORS[r.quadrante.cluster];
  return (
    <div
      className="border pl-4 pr-3 py-3 space-y-1.5 transition-colors"
      style={{ background: '#0A0A0A', borderColor: open ? c.border : '#1A1A1A', borderLeft: `4px solid ${c.badge}`, borderRadius: '0 6px 6px 0' }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-sm truncate">{r.nome}</p>
          <p className="text-[10px] font-medium" style={{ color: c.text }}>{r.quadrante.nome}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold tabular-nums" style={{ color: '#4D94FF' }}>D {r.desempenhoScore.toFixed(1)}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color: 'hsl(0 0% 60%)' }}>P {r.potencialScore > 0 ? r.potencialScore.toFixed(1) : '—'}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>C{r.quadrante.cluster}</span>
      </div>
      {r.comentarios.length > 0 && (
        <div>
          <button onClick={() => setOpen(!open)} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <span>{open ? '▲' : '▼'}</span> {r.comentarios.length} comentário{r.comentarios.length > 1 ? 's' : ''}
          </button>
          {open && (
            <div className="mt-2 space-y-1.5">
              {r.comentarios.map((cmt, i) => (
                <div key={i} className="border border-border rounded-[4px] px-3 py-2 text-xs text-muted-foreground leading-relaxed italic" style={{ background: '#050505' }}>
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

// ─── Tab buttons ───────────────────────────────────────────────────────────────
type Tab = 'avaliacao' | 'declaracoes' | 'metas';
const TabBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 text-xs font-bold rounded-[4px] transition-all"
    style={active
      ? { background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.4)', color: '#4D94FF' }
      : { background: 'transparent', border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
  >
    {children}
  </button>
);

// ─── Main page ─────────────────────────────────────────────────────────────────
const DashboardLider = () => {
  const navigate = useNavigate();
  const { ciclo, loading: cicloLoading } = useCicloAtivo();
  const [authLoading, setAuthLoading] = useState(true);
  const [isLider, setIsLider] = useState<boolean | null>(null);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [tab, setTab] = useState<Tab>('avaliacao');

  // team
  const [equipe, setEquipe] = useState<EquipeRow[]>([]);
  const [equipeLoading, setEquipeLoading] = useState(false);

  // avaliacao
  const [resultados, setResultados] = useState<ColaboradorResultado[]>([]);
  const [avaliacaoLoading, setAvaliacaoLoading] = useState(false);

  // declaracoes
  const [declaracoes, setDeclaracoes] = useState<DeclaracaoRow[]>([]);
  const [declLoading, setDeclLoading] = useState(false);

  const [search, setSearch] = useState('');

  // Auth check
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/'); return; }
      setUserId(session.user.id);
      setUserName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).rpc('has_role', { _user_id: session.user.id, _role: 'lideranca' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: isAdmin } = await (supabase as any).rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
      if (!data && !isAdmin) { navigate('/'); return; }
      setIsLider(true);
      setAuthLoading(false);
    })();
  }, [navigate]);

  // Load team
  useEffect(() => {
    if (!isLider || !userId || !ciclo) return;
    setEquipeLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('equipes')
      .select('colaborador_nome,colaborador_email')
      .eq('lider_user_id', userId)
      .eq('ciclo', ciclo)
      .then(({ data }: { data: EquipeRow[] | null }) => {
        setEquipe(data ?? []);
        setEquipeLoading(false);
      });
  }, [isLider, userId, ciclo]);

  // Load evaluations filtered by team
  useEffect(() => {
    if (!isLider || !ciclo || equipeLoading) return;
    if (equipe.length === 0) { setResultados([]); return; }
    setAvaliacaoLoading(true);
    const nomes = equipe.map(e => e.colaborador_nome);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('avaliacoes')
      .select('*')
      .eq('ciclo', ciclo)
      .in('colaborador_nome', nomes)
      .then(({ data }: { data: AvaliacaoRow[] | null }) => {
        setResultados(calcularResultados(data ?? []));
        setAvaliacaoLoading(false);
      });
  }, [isLider, ciclo, equipe, equipeLoading]);

  // Load declarations filtered by team
  useEffect(() => {
    if (!isLider || !ciclo || equipeLoading) return;
    if (equipe.length === 0) { setDeclaracoes([]); return; }
    setDeclLoading(true);
    const emails = equipe.map(e => e.colaborador_email).filter(Boolean);
    const nomes = equipe.map(e => e.colaborador_nome);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('declaracoes')
      .select('id,user_name,user_email,declaracao,metas,updated_at')
      .eq('ciclo', ciclo)
      .then(({ data }: { data: DeclaracaoRow[] | null }) => {
        // Filter by name or email matching team
        const filtered = (data ?? []).filter(d =>
          emails.includes(d.user_email) || nomes.some(n => n.toLowerCase() === d.user_name.toLowerCase())
        );
        setDeclaracoes(filtered);
        setDeclLoading(false);
      });
  }, [isLider, ciclo, equipe, equipeLoading]);

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const filteredResultados = resultados.filter(r =>
    !search.trim() || r.nome.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDeclaracoes = declaracoes.filter(d =>
    !search.trim() || d.user_name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || cicloLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const firstName = userName.split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
        <div className="w-full px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img src={logoNsf} alt="NSF" className="w-7 h-7" />
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-foreground" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '14px' }}>
              nutrição sem fronteiras
            </span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.03em' }}>
              dashboard do líder
            </span>
          </div>
          {ciclo && (
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,102,255,0.12)', border: '1px solid rgba(0,102,255,0.3)', color: '#4D94FF' }}>
              Ciclo {ciclo}
            </span>
          )}
        </div>
      </header>

      <div className="pt-16 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Greeting */}
        <div>
          <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest mb-0.5">Dashboard do Líder</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-none">{firstName}</h1>
          <p className="text-xs text-muted-foreground/40 mt-1.5">
            {equipe.length > 0 ? `${equipe.length} colaborador${equipe.length > 1 ? 'es' : ''} no seu time` : 'Nenhum colaborador mapeado no seu time ainda.'}
          </p>
        </div>

        {/* Empty team state */}
        {!equipeLoading && equipe.length === 0 && (
          <div className="border border-border rounded-[6px] p-8 text-center" style={{ background: '#0A0A0A' }}>
            <svg className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <p className="text-sm font-bold text-foreground mb-1">Nenhum time configurado</p>
            <p className="text-xs text-muted-foreground/50 max-w-sm mx-auto">
              Um administrador precisa mapear os colaboradores do seu time em Configurações para que os dados apareçam aqui.
            </p>
          </div>
        )}

        {equipe.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              <TabBtn active={tab === 'avaliacao'} onClick={() => { setTab('avaliacao'); setSearch(''); }}>
                Avaliação 9-Box
                <span className="ml-1.5 text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full"
                  style={tab === 'avaliacao'
                    ? { background: 'rgba(0,102,255,0.15)', color: '#4D94FF' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--muted-foreground))' }}>
                  {resultados.length}
                </span>
              </TabBtn>
              <TabBtn active={tab === 'declaracoes'} onClick={() => { setTab('declaracoes'); setSearch(''); }}>
                Declarações
                <span className="ml-1.5 text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full"
                  style={tab === 'declaracoes'
                    ? { background: 'rgba(0,102,255,0.15)', color: '#4D94FF' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--muted-foreground))' }}>
                  {declaracoes.filter(d => d.declaracao).length}
                </span>
              </TabBtn>
              <TabBtn active={tab === 'metas'} onClick={() => { setTab('metas'); setSearch(''); }}>
                Metas
                <span className="ml-1.5 text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full"
                  style={tab === 'metas'
                    ? { background: 'rgba(0,102,255,0.15)', color: '#4D94FF' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--muted-foreground))' }}>
                  {declaracoes.filter(d => d.metas).length}
                </span>
              </TabBtn>
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por nome..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-[4px] border border-border bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            {/* ── Tab: Avaliação ────────────────────────────────────────────── */}
            {tab === 'avaliacao' && (
              avaliacaoLoading ? (
                <div className="flex justify-center py-12"><div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
              ) : resultados.length === 0 ? (
                <div className="border border-border rounded-[6px] p-8 text-center bg-card">
                  <p className="text-sm text-muted-foreground/50">Nenhuma avaliação encontrada para este ciclo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left: 9-box */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="border border-border rounded-[4px] p-4 space-y-3" style={{ background: '#0A0A0A' }}>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Matriz 9-Box · Time</p>
                      <NineBoxMini resultados={resultados} />
                    </div>
                    <div className="border border-border rounded-[4px] p-4 space-y-2" style={{ background: '#0A0A0A' }}>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Clusters</p>
                      {[1,2,3,4].map(cl => {
                        const labels = ['Abaixo do esperado','Precisa melhorar','Mandou bem','Além do esperado'];
                        const c = CLUSTER_COLORS[cl];
                        const count = resultados.filter(r => r.quadrante.cluster === cl).length;
                        return (
                          <div key={cl} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: c.badge }} />
                              <span className="text-xs text-muted-foreground"><span className="font-bold" style={{ color: c.text }}>C{cl}</span> {labels[cl-1]}</span>
                            </div>
                            <span className="text-xs font-bold tabular-nums text-foreground">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Right: cards */}
                  <div className="lg:col-span-3 space-y-2">
                    {filteredResultados.length === 0 ? (
                      <p className="text-xs text-muted-foreground/40 text-center py-6">Nenhum resultado para "{search}"</p>
                    ) : filteredResultados.map(r => <ColabCard key={r.nome} r={r} />)}
                  </div>
                </div>
              )
            )}

            {/* ── Tab: Declarações ──────────────────────────────────────────── */}
            {tab === 'declaracoes' && (
              declLoading ? (
                <div className="flex justify-center py-12"><div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
              ) : (
                <div className="space-y-3">
                  {filteredDeclaracoes.length === 0 ? (
                    <div className="border border-border rounded-[6px] p-8 text-center bg-card">
                      <p className="text-sm text-muted-foreground/50">Nenhuma declaração encontrada.</p>
                    </div>
                  ) : filteredDeclaracoes.map(d => (
                    <div key={d.id} className="border border-border rounded-[4px] p-5 space-y-3" style={{ background: '#0A0A0A' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-foreground text-sm">{d.user_name}</p>
                          <p className="text-[11px] text-muted-foreground/50">{d.user_email}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 shrink-0">{fmt(d.updated_at)}</span>
                      </div>
                      {d.declaracao ? (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Declaração de expectativas</p>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{d.declaracao}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/30 italic">Sem declaração preenchida.</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── Tab: Metas ───────────────────────────────────────────────── */}
            {tab === 'metas' && (
              declLoading ? (
                <div className="flex justify-center py-12"><div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
              ) : (
                <div className="space-y-3">
                  {filteredDeclaracoes.length === 0 ? (
                    <div className="border border-border rounded-[6px] p-8 text-center bg-card">
                      <p className="text-sm text-muted-foreground/50">Nenhuma meta encontrada.</p>
                    </div>
                  ) : filteredDeclaracoes.map(d => (
                    <div key={d.id} className="border border-border rounded-[4px] p-5 space-y-3" style={{ background: '#0A0A0A' }}>
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
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardLider;
