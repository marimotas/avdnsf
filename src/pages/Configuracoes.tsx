import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoNsf from '@/assets/logo_nsfs.png';
import { useCicloAtivo } from '@/hooks/useCicloAtivo';

type CicloRow = { id: string; nome: string; ativo: boolean; created_at: string };
type JanelaRow = { id: string | null; abertura: string; fechamento: string };

const JANELAS_CONFIG = [
  {
    tipo: 'declaracao_expectativas',
    label: 'Declaração de Expectativas',
    desc: 'Período em que os colaboradores podem preencher a declaração.',
    requiresCicloAtivo: false,
    icon: (
      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    tipo: 'metas',
    label: 'Metas',
    desc: 'Período em que os colaboradores podem preencher suas metas.',
    requiresCicloAtivo: false,
    icon: (
      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  {
    tipo: 'avaliacao_desempenho',
    label: 'Avaliação de Desempenho',
    desc: 'Período em que as avaliações ficam abertas para preenchimento.',
    requiresCicloAtivo: false,
    icon: (
      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    tipo: 'meus_resultados',
    label: 'Meus Resultados',
    desc: 'Período em que os colaboradores podem visualizar seus resultados.',
    requiresCicloAtivo: false,
    icon: (
      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

// ── Janela Card ────────────────────────────────────────────────────────────────
const JanelaCard = ({
  label, desc, icon, ciclo, cicloAtivo, requiresCicloAtivo,
  janela, onAtivar, onInativar, toggling,
}: {
  label: string; desc: string; icon: React.ReactNode;
  ciclo: string | null; cicloAtivo: boolean; requiresCicloAtivo: boolean;
  janela: JanelaRow; onAtivar: () => void; onInativar: () => void; toggling: boolean;
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const isOpen = !!(janela.abertura && janela.fechamento && today >= janela.abertura && today <= janela.fechamento);
  const canToggle = !requiresCicloAtivo || cicloAtivo;
  const fmt = (dt: string) =>
    dt ? new Date(dt + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="border border-border rounded-[4px] p-4 bg-background">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 rounded-[4px] flex items-center justify-center bg-primary/10 border border-primary/20">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">{desc}</p>
            {isOpen && janela.abertura && janela.fechamento && (
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(74,222,128,0.8)' }}>
                Ativo desde {fmt(janela.abertura)} · até {fmt(janela.fechamento)}
              </p>
            )}
            {requiresCicloAtivo && !cicloAtivo && (
              <p className="text-[10px] mt-1 text-muted-foreground/40 italic">Ative um ciclo para habilitar.</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={isOpen
              ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
              : { background: 'rgba(100,100,100,0.1)', border: '1px solid rgba(100,100,100,0.2)', color: 'hsl(var(--muted-foreground))' }}
          >
            {isOpen ? '● Ativo' : '○ Inativo'}
          </span>
          {canToggle && (
            <button
              onClick={isOpen ? onInativar : onAtivar}
              disabled={toggling || !ciclo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all duration-150 disabled:opacity-40 whitespace-nowrap min-h-[32px]"
              style={isOpen
                ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
                : { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
            >
              {toggling ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" /> : isOpen ? 'Inativar' : 'Ativar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const Configuracoes = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { ciclo, loading: cicloLoading } = useCicloAtivo();
  const cicloAtivo = !cicloLoading && !!ciclo;

  // Janelas
  const [janelas, setJanelas] = useState<Record<string, JanelaRow>>(
    Object.fromEntries(JANELAS_CONFIG.map(j => [j.tipo, { id: null, abertura: '', fechamento: '' }]))
  );
  const [janelaToggling, setJanelaToggling] = useState<Record<string, boolean>>({});

  // Ciclos
  const [ciclos, setCiclos] = useState<CicloRow[]>([]);
  const [cicloOpening, setCicloOpening] = useState(false);
  const [cicloSuccess, setCicloSuccess] = useState('');
  const [cicloToggling, setCicloToggling] = useState<string | null>(null);

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  const loadJanelas = useCallback(async (cicloNome: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('janela_declaracoes')
      .select('id,tipo,data_abertura,data_fechamento')
      .eq('ciclo', cicloNome);
    if (data && Array.isArray(data)) {
      const updates: Record<string, JanelaRow> = {};
      for (const row of data) {
        updates[row.tipo] = { id: row.id, abertura: row.data_abertura?.slice(0, 10) ?? '', fechamento: row.data_fechamento?.slice(0, 10) ?? '' };
      }
      setJanelas(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const loadCiclos = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from('ciclos').select('id,nome,ativo,created_at').order('nome', { ascending: true });
    if (data) setCiclos(data);
  }, []);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session) { navigate('/'); return; }
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).eq('role', 'admin').maybeSingle();
      if (!data) { navigate('/'); return; }
      setIsAdmin(true);
    })();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) loadCiclos();
  }, [isAdmin, loadCiclos]);

  useEffect(() => {
    if (isAdmin && ciclo) loadJanelas(ciclo);
  }, [isAdmin, ciclo, loadJanelas]);

  const handleAtivarJanela = async (tipo: string) => {
    if (!ciclo) return;
    setJanelaToggling(prev => ({ ...prev, [tipo]: true }));
    const hoje = new Date().toISOString().slice(0, 10);
    const futuro = '2099-12-31';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const j = janelas[tipo];
    if (j.id) {
      await client.from('janela_declaracoes').update({ data_abertura: hoje, data_fechamento: futuro }).eq('id', j.id);
    } else {
      const { data } = await client.from('janela_declaracoes').insert({ ciclo, tipo, data_abertura: hoje, data_fechamento: futuro }).select('id').maybeSingle();
      if (data) setJanelas(prev => ({ ...prev, [tipo]: { ...prev[tipo], id: data.id } }));
    }
    setJanelas(prev => ({ ...prev, [tipo]: { ...prev[tipo], abertura: hoje, fechamento: futuro } }));
    setJanelaToggling(prev => ({ ...prev, [tipo]: false }));
  };

  const handleInativarJanela = async (tipo: string) => {
    const j = janelas[tipo];
    if (!j.id) return;
    setJanelaToggling(prev => ({ ...prev, [tipo]: true }));
    const ontem = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('janela_declaracoes').update({ data_fechamento: ontem }).eq('id', j.id);
    setJanelas(prev => ({ ...prev, [tipo]: { ...prev[tipo], fechamento: ontem } }));
    setJanelaToggling(prev => ({ ...prev, [tipo]: false }));
  };

  const handleAbrirCiclo = async (nome: string) => {
    setCicloOpening(true); setCicloSuccess('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const session = await getSession();
    if (!session) { setCicloOpening(false); return; }
    await client.from('ciclos').insert({ nome, ativo: true, criado_por: session.user.id });
    await loadCiclos();
    setCicloOpening(false);
    setCicloSuccess(`Ciclo ${nome} aberto com sucesso!`);
    setTimeout(() => setCicloSuccess(''), 6000);
  };

  const handleToggleCiclo = async (cicloId: string, currentAtivo: boolean) => {
    setCicloToggling(cicloId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('ciclos').update({ ativo: !currentAtivo }).eq('id', cicloId);
    await loadCiclos();
    setCicloToggling(null);
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
        <div className="w-full px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img src={logoNsf} alt="NSF" className="w-7 h-7" />
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-foreground" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '14px' }}>
              nutrição sem fronteiras
            </span>
            <span className="text-muted-foreground" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', letterSpacing: '0.03em' }}>
              configurações
            </span>
          </div>
        </div>
      </header>

      <div className="pt-20 w-full max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* Title */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Administração</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">Configurações</h1>
        </div>

        {/* ── Gestão de Acessos (link card) ─────────────────────────── */}
        <button
          onClick={() => navigate('/gestao-acessos')}
          className="w-full text-left border border-border rounded-[6px] p-5 bg-card hover:border-primary/40 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-[6px] flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0">
                <svg className="w-4.5 h-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Gestão de Acessos</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Administradores, líderes e composição das equipes por ciclo.</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* ── Janelas de preenchimento ──────────────────────────────── */}
        <div className="border border-border rounded-[6px] p-6 space-y-3 bg-card">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-foreground">Janelas de preenchimento</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Ative ou inative cada módulo para liberar ou bloquear o acesso dos colaboradores.{' '}
              {ciclo
                ? <span className="text-primary/70 font-medium">Ciclo ativo: {ciclo}.</span>
                : <span className="text-muted-foreground/50">Nenhum ciclo ativo.</span>
              }
            </p>
          </div>
          {JANELAS_CONFIG.map(cfg => (
            <JanelaCard
              key={cfg.tipo}
              label={cfg.label}
              desc={cfg.desc}
              icon={cfg.icon}
              ciclo={ciclo}
              cicloAtivo={cicloAtivo}
              requiresCicloAtivo={cfg.requiresCicloAtivo}
              janela={janelas[cfg.tipo]}
              onAtivar={() => handleAtivarJanela(cfg.tipo)}
              onInativar={() => handleInativarJanela(cfg.tipo)}
              toggling={!!janelaToggling[cfg.tipo]}
            />
          ))}
        </div>

        {/* ── Ciclos ────────────────────────────────────────────────── */}
        <div className="border border-border rounded-[6px] p-6 space-y-5 bg-card">
          <div>
            <h2 className="text-sm font-bold text-foreground">Ciclos de avaliação</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Ao abrir um novo ciclo, uma base de dados independente é criada para avaliações, declarações e metas.
            </p>
          </div>

          {cicloSuccess && (
            <div className="border border-green-500/30 bg-green-500/10 rounded-[4px] px-3 py-2 text-xs text-green-400">
              {cicloSuccess}
            </div>
          )}

          <div className="space-y-2">
            {ciclos.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-[4px] border border-border bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-[4px] flex items-center justify-center bg-primary/10 border border-primary/20">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Ciclo {c.nome}</p>
                    <p className="text-[10px] text-muted-foreground/50">
                      Criado em {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={c.ativo
                      ? { background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
                      : { background: 'rgba(100,100,100,0.10)', border: '1px solid rgba(100,100,100,0.25)', color: 'hsl(var(--muted-foreground))' }}
                  >
                    {c.ativo ? '● Ativo' : '○ Inativo'}
                  </span>
                  <button
                    onClick={() => handleToggleCiclo(c.id, c.ativo)}
                    disabled={cicloToggling === c.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all duration-150 disabled:opacity-40 min-h-[32px]"
                    style={c.ativo
                      ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
                      : { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
                  >
                    {cicloToggling === c.id
                      ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                      : c.ativo ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!ciclos.some(c => c.nome === '2026.2') && (
            <div className="rounded-[4px] border border-dashed p-4 flex items-center justify-between gap-4" style={{ borderColor: 'hsl(var(--border))' }}>
              <div>
                <p className="text-sm font-bold text-foreground">Ciclo 2026.2</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Criar base de dados para avaliações, declarações e metas do segundo ciclo de 2026.
                </p>
              </div>
              <button
                onClick={() => handleAbrirCiclo('2026.2')}
                disabled={cicloOpening}
                className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-bold transition-all disabled:opacity-40 whitespace-nowrap"
                style={{ background: 'rgba(0,102,255,0.12)', border: '1px solid rgba(0,102,255,0.3)', color: '#4D94FF' }}
              >
                {cicloOpening
                  ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Abrindo...</>
                  : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> Abrir Ciclo 2026.2</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
