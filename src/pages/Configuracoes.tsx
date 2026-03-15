import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoNsf from '@/assets/logo_nsfs.png';

const CICLO = '2026.1';

type CicloRow = {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
};

type AdminUser = {
  id: string;
  user_id: string;
  email: string;
};

type JanelaRow = {
  id: string | null;
  abertura: string;
  fechamento: string;
};

const JANELAS_CONFIG = [
  {
    tipo: 'declaracao_expectativas',
    label: 'Declaração de Expectativas',
    desc: 'Período em que os colaboradores podem preencher a declaração.',
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
    icon: (
      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  {
    tipo: 'avaliacao_desempenho',
    label: 'Avaliação de Desempenho',
    desc: 'Período em que as avaliações de desempenho ficam abertas.',
    icon: (
      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    tipo: 'meus_resultados',
    label: 'Meus Resultados',
    desc: 'Período em que os colaboradores podem visualizar seus resultados.',
    icon: (
      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

// ── Janela Card ────────────────────────────────────────────────────────────────
const JanelaCard = ({
  tipo, label, desc, icon,
  janela, onChange, onSave, onEncerrar, saving, saved, encerrating,
}: {
  tipo: string; label: string; desc: string; icon: React.ReactNode;
  janela: JanelaRow; onChange: (field: 'abertura' | 'fechamento', val: string) => void;
  onSave: () => void; onEncerrar: () => void;
  saving: boolean; saved: boolean; encerrating: boolean;
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const isOpen = !!(janela.abertura && janela.fechamento
    && today >= janela.abertura && today <= janela.fechamento);

  const fmt = (dt: string) =>
    dt ? new Date(dt + 'T00:00:00').toLocaleDateString('pt-BR', { dateStyle: 'short' }) : '';

  return (
    <div className="border border-border rounded-[4px] p-4 space-y-4 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[4px] flex items-center justify-center bg-primary/10 border border-primary/20">
            {icon}
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground/60">Ciclo {CICLO}</p>
          </div>
        </div>
        <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={
              isOpen
                ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
                : { background: 'rgba(100,100,100,0.1)', border: '1px solid rgba(100,100,100,0.2)', color: 'hsl(var(--muted-foreground))' }
            }
          >
            {isOpen ? '● Aberto agora' : '○ Fechado'}
          </span>
      </div>

      <p className="text-[11px] text-muted-foreground/60">{desc}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Abertura</label>
          <input
            type="date"
            value={janela.abertura}
            onChange={e => onChange('abertura', e.target.value)}
            className="w-full bg-card border border-border rounded-[4px] px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Fechamento</label>
          <input
            type="date"
            value={janela.fechamento}
            onChange={e => onChange('fechamento', e.target.value)}
            className="w-full bg-card border border-border rounded-[4px] px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        {saved ? (
          <p className="text-xs text-green-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Período salvo
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground/40">
            {janela.abertura && janela.fechamento
              ? `De ${fmt(janela.abertura)} até ${fmt(janela.fechamento)}`
              : 'Nenhum período definido'}
          </p>
        )}
        <div className="flex items-center gap-2">
          {/* Encerrar — shown whenever a janela record exists */}
          {janela.id && (
            <button
              onClick={onEncerrar}
              disabled={encerrating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[4px] text-xs font-bold transition-all duration-150 disabled:opacity-40 bg-red-600 hover:opacity-90 text-white"
            >
              {encerrating ? 'Encerrando...' : 'Encerrar'}
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving || !janela.abertura || !janela.fechamento}
            className="px-4 py-2 rounded-[4px] text-sm font-bold transition-all duration-150 disabled:opacity-40 bg-primary text-primary-foreground hover:opacity-90"
          >
            {saving ? 'Salvando...' : 'Salvar período'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const Configuracoes = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Admins
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  // Janelas — one state entry per tipo
  const [janelas, setJanelas] = useState<Record<string, JanelaRow>>(
    Object.fromEntries(JANELAS_CONFIG.map(j => [j.tipo, { id: null, abertura: '', fechamento: '' }]))
  );
  const [janelaSaving, setJanelaSaving] = useState<Record<string, boolean>>({});
  const [janelaSaved, setJanelaSaved] = useState<Record<string, boolean>>({});
  const [janelaEncerrating, setJanelaEncerrating] = useState<Record<string, boolean>>({});

  // Ciclos
  const [ciclos, setCiclos] = useState<CicloRow[]>([]);
  const [cicloOpening, setCicloOpening] = useState(false);
  const [cicloSuccess, setCicloSuccess] = useState('');

  const edgeFn = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-roles`;

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  const loadAdmins = useCallback(async () => {
    const session = await getSession();
    if (!session) return;
    const res = await fetch(edgeFn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'list' }),
    });
    if (res.ok) {
      const json = await res.json();
      setAdmins(json.admins ?? []);
    }
  }, [edgeFn]);

  const loadJanelas = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('janela_declaracoes')
      .select('id,tipo,data_abertura,data_fechamento')
      .eq('ciclo', CICLO);

    if (data && Array.isArray(data)) {
      const updates: Record<string, JanelaRow> = {};
      for (const row of data) {
        updates[row.tipo] = {
          id: row.id,
          abertura: row.data_abertura?.slice(0, 10) ?? '',
          fechamento: row.data_fechamento?.slice(0, 10) ?? '',
        };
      }
      setJanelas(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const loadCiclos = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('ciclos')
      .select('id,nome,ativo,created_at')
      .order('nome', { ascending: true });
    if (data) setCiclos(data);
  }, []);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session) { navigate('/'); return; }
      setCurrentUserId(session.user.id);
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).eq('role', 'admin').maybeSingle();
      if (!data) { navigate('/'); return; }
      setIsAdmin(true);
    })();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) { loadAdmins(); loadJanelas(); loadCiclos(); }
  }, [isAdmin, loadAdmins, loadJanelas, loadCiclos]);

  const handleJanelaChange = (tipo: string, field: 'abertura' | 'fechamento', val: string) => {
    setJanelas(prev => ({ ...prev, [tipo]: { ...prev[tipo], [field]: val } }));
  };

  const handleSaveJanela = async (tipo: string) => {
    const j = janelas[tipo];
    if (!j.abertura || !j.fechamento) return;
    setJanelaSaving(prev => ({ ...prev, [tipo]: true }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    if (j.id) {
      await client.from('janela_declaracoes').update({ data_abertura: j.abertura, data_fechamento: j.fechamento }).eq('id', j.id);
    } else {
      const { data } = await client.from('janela_declaracoes')
        .insert({ ciclo: CICLO, tipo, data_abertura: j.abertura, data_fechamento: j.fechamento })
        .select('id').single();
      if (data) setJanelas(prev => ({ ...prev, [tipo]: { ...prev[tipo], id: data.id } }));
    }
    setJanelaSaving(prev => ({ ...prev, [tipo]: false }));
    setJanelaSaved(prev => ({ ...prev, [tipo]: true }));
    setTimeout(() => setJanelaSaved(prev => ({ ...prev, [tipo]: false })), 3000);
  };

  const handleEncerrarJanela = async (tipo: string) => {
    const j = janelas[tipo];
    if (!j.id) return;
    setJanelaEncerrating(prev => ({ ...prev, [tipo]: true }));
    // Set fechamento to now (minus 1 minute to be safe with timezone rounding)
    const ontem = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('janela_declaracoes')
      .update({ data_fechamento: ontem })
      .eq('id', j.id);
    setJanelas(prev => ({
      ...prev,
      [tipo]: { ...prev[tipo], fechamento: ontem },
    }));
    setJanelaEncerrating(prev => ({ ...prev, [tipo]: false }));
  };

  const handleAbrirCiclo = async (nome: string) => {
    setCicloOpening(true);
    setCicloSuccess('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const session = await getSession();
    if (!session) { setCicloOpening(false); return; }
    await client.from('ciclos').insert({ nome, ativo: true, criado_por: session.user.id });
    await loadCiclos();
    setCicloOpening(false);
    setCicloSuccess(`Ciclo ${nome} aberto com sucesso! A base de dados está pronta para receber avaliações, declarações e metas.`);
    setTimeout(() => setCicloSuccess(''), 6000);
  };

  const handleAddAdmin = async () => {
    setAdminError(''); setAdminSuccess('');
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setLoading(true);
    try {
      const session = await getSession();
      if (!session) return;
      const res = await fetch(edgeFn, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'add', email }),
      });
      const json = await res.json();
      if (!res.ok) setAdminError(json.error || 'Erro ao adicionar admin.');
      else { setAdminSuccess(`${email} agora tem acesso de administrador.`); setNewEmail(''); loadAdmins(); }
    } finally { setLoading(false); }
  };

  const handleRemoveAdmin = async (adminId: string, userId: string) => {
    setAdminError(''); setAdminSuccess('');
    if (userId === currentUserId) { setAdminError('Você não pode remover seu próprio acesso de administrador.'); return; }
    setRemoving(adminId);
    try {
      const session = await getSession();
      if (!session) return;
      const res = await fetch(edgeFn, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'remove', user_id: userId }),
      });
      const json = await res.json();
      if (!res.ok) setAdminError(json.error || 'Erro ao remover admin.');
      else { setAdminSuccess('Acesso removido com sucesso.'); loadAdmins(); }
    } finally { setRemoving(null); }
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

        {/* ── Janelas de preenchimento ──────────────────────────────────── */}
        <div className="border border-border rounded-[6px] p-6 space-y-5 bg-card">
          <div>
            <h2 className="text-sm font-bold text-foreground">Janelas de preenchimento</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Defina o período em que cada campo fica aberto para os colaboradores.
            </p>
          </div>
          {JANELAS_CONFIG.map(cfg => (
            <JanelaCard
              key={cfg.tipo}
              tipo={cfg.tipo}
              label={cfg.label}
              desc={cfg.desc}
              icon={cfg.icon}
              janela={janelas[cfg.tipo]}
              onChange={(field, val) => handleJanelaChange(cfg.tipo, field, val)}
              onSave={() => handleSaveJanela(cfg.tipo)}
              onEncerrar={() => handleEncerrarJanela(cfg.tipo)}
              saving={!!janelaSaving[cfg.tipo]}
              saved={!!janelaSaved[cfg.tipo]}
              encerrating={!!janelaEncerrating[cfg.tipo]}
            />
          ))}
        </div>

        {/* ── Ciclos ────────────────────────────────────────────────────── */}
        <div className="border border-border rounded-[6px] p-6 space-y-5 bg-card">
          <div>
            <h2 className="text-sm font-bold text-foreground">Ciclos de avaliação</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Ao abrir um novo ciclo, uma base de dados independente é criada para avaliações de desempenho, declarações de expectativas e metas.
            </p>
          </div>

          {cicloSuccess && (
            <div className="border border-green-500/30 bg-green-500/10 rounded-[4px] px-3 py-2 text-xs text-green-400 leading-relaxed">
              {cicloSuccess}
            </div>
          )}

          {/* Existing cycles */}
          <div className="space-y-2">
            {ciclos.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between px-4 py-3 rounded-[4px] border border-border bg-background"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-[4px] flex items-center justify-center bg-primary/10 border border-primary/20">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Ciclo {c.nome}</p>
                    <p className="text-[10px] text-muted-foreground/50">
                      Aberto em {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
                >
                  ● Ativo
                </span>
              </div>
            ))}
          </div>

          {/* Open new cycle button — only show if 2026.2 not yet created */}
          {!ciclos.some(c => c.nome === '2026.2') && (
            <div
              className="rounded-[4px] border border-dashed p-4 flex items-center justify-between gap-4"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
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

        {/* ── Administradores ───────────────────────────────────────────── */}
        <div className="border border-border rounded-[6px] p-6 space-y-5 bg-card">
          <div>
            <h2 className="text-sm font-bold text-foreground">Administradores</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Administradores têm acesso ao dashboard de resultados e a estas configurações.
              O colaborador precisa ter feito login ao menos uma vez para ser adicionado.
            </p>
          </div>

          {adminError && (
            <div className="border border-destructive/30 bg-destructive/10 rounded-[4px] px-3 py-2 text-xs text-destructive">
              {adminError}
            </div>
          )}
          {adminSuccess && (
            <div className="border border-green-500/30 bg-green-500/10 rounded-[4px] px-3 py-2 text-xs text-green-400">
              {adminSuccess}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
              placeholder="email@semfronteiras.app"
              className="flex-1 bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={handleAddAdmin}
              disabled={loading || !newEmail.trim()}
              className="px-4 py-2 rounded-[4px] text-sm font-semibold transition-all disabled:opacity-40 text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20"
            >
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : 'Adicionar'}
            </button>
          </div>

          <div className="space-y-2">
            {admins.length === 0 ? (
              <p className="text-xs text-muted-foreground/40 text-center py-4">Nenhum administrador encontrado.</p>
            ) : admins.map(admin => (
              <div key={admin.id} className="flex items-center justify-between px-3 py-2.5 rounded-[4px] border border-border bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <span className="text-xs text-foreground">{admin.email || admin.user_id}</span>
                  {admin.user_id === currentUserId && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">você</span>
                  )}
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">admin</span>
                </div>
                {admin.user_id !== currentUserId && (
                  <button
                    onClick={() => handleRemoveAdmin(admin.id, admin.user_id)}
                    disabled={removing === admin.id}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors disabled:opacity-40"
                  >
                    {removing === admin.id
                      ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    }
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
