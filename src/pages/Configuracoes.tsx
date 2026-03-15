import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoNsf from '@/assets/logo_nsfs.png';

const CICLO = '2026.1';

type AdminUser = {
  id: string;
  user_id: string;
  email: string;
};

type Janela = {
  id: string | null;
  abertura: string;
  fechamento: string;
};

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

  // Janela declarações
  const [janela, setJanela] = useState<Janela>({ id: null, abertura: '', fechamento: '' });
  const [janelaSaving, setJanelaSaving] = useState(false);
  const [janelaSaved, setJanelaSaved] = useState(false);

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

  const loadJanela = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('janela_declaracoes')
      .select('id,data_abertura,data_fechamento')
      .eq('ciclo', CICLO)
      .maybeSingle();
    if (data) {
      setJanela({ id: data.id, abertura: data.data_abertura.slice(0, 16), fechamento: data.data_fechamento.slice(0, 16) });
    }
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
    if (isAdmin) { loadAdmins(); loadJanela(); }
  }, [isAdmin, loadAdmins, loadJanela]);

  const handleAddAdmin = async () => {
    setAdminError('');
    setAdminSuccess('');
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
    setAdminError('');
    setAdminSuccess('');
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

  const handleSaveJanela = async () => {
    if (!janela.abertura || !janela.fechamento) return;
    setJanelaSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    if (janela.id) {
      await client.from('janela_declaracoes').update({ data_abertura: janela.abertura, data_fechamento: janela.fechamento }).eq('id', janela.id);
    } else {
      const { data } = await client.from('janela_declaracoes').insert({ ciclo: CICLO, data_abertura: janela.abertura, data_fechamento: janela.fechamento }).select('id').single();
      if (data) setJanela(prev => ({ ...prev, id: data.id }));
    }
    setJanelaSaving(false);
    setJanelaSaved(true);
    setTimeout(() => setJanelaSaved(false), 3000);
  };

  const isOpen = janela.abertura && janela.fechamento
    ? new Date() >= new Date(janela.abertura) && new Date() <= new Date(janela.fechamento)
    : null;

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

        {/* ── Janela de declarações ─────────────────────────────────────── */}
        <div className="border border-border rounded-[6px] p-6 space-y-5 bg-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Janelas de preenchimento</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Defina o período em que cada campo ficará aberto para os colaboradores preencherem.
              </p>
            </div>
          </div>

          {/* Declaração de expectativas */}
          <div className="border border-border rounded-[4px] p-4 space-y-4 bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[4px] flex items-center justify-center bg-primary/10 border border-primary/20">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Declaração de Expectativas</p>
                  <p className="text-[10px] text-muted-foreground/60">Ciclo {CICLO}</p>
                </div>
              </div>
              {isOpen !== null && (
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
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Abertura
                </label>
                <input
                  type="datetime-local"
                  value={janela.abertura}
                  onChange={e => setJanela(prev => ({ ...prev, abertura: e.target.value }))}
                  className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Fechamento
                </label>
                <input
                  type="datetime-local"
                  value={janela.fechamento}
                  onChange={e => setJanela(prev => ({ ...prev, fechamento: e.target.value }))}
                  className="w-full bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {janelaSaved ? (
                <p className="text-xs text-green-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Período salvo com sucesso
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground/40">
                  {janela.abertura && janela.fechamento
                    ? `De ${new Date(janela.abertura).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} até ${new Date(janela.fechamento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`
                    : 'Nenhum período definido'}
                </p>
              )}
              <button
                onClick={handleSaveJanela}
                disabled={janelaSaving || !janela.abertura || !janela.fechamento}
                className="px-4 py-2 rounded-[4px] text-sm font-bold transition-all duration-150 disabled:opacity-40 text-primary-foreground bg-primary hover:opacity-90"
              >
                {janelaSaving ? 'Salvando...' : 'Salvar período'}
              </button>
            </div>
          </div>
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

          {/* Add */}
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
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : 'Adicionar'}
            </button>
          </div>

          {/* List */}
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
                    {removing === admin.id ? (
                      <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
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


  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (isAdmin) loadAdmins();
  }, [isAdmin, loadAdmins]);

  const handleAddAdmin = async () => {
    setError('');
    setSuccess('');
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
      if (!res.ok) setError(json.error || 'Erro ao adicionar admin.');
      else { setSuccess(`${email} agora tem acesso de administrador.`); setNewEmail(''); loadAdmins(); }
    } finally { setLoading(false); }
  };

  const handleRemoveAdmin = async (adminId: string, userId: string) => {
    setError('');
    setSuccess('');
    if (userId === currentUserId) { setError('Você não pode remover seu próprio acesso de administrador.'); return; }
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
      if (!res.ok) setError(json.error || 'Erro ao remover admin.');
      else { setSuccess('Acesso removido com sucesso.'); loadAdmins(); }
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

        {/* Alerts */}
        {error && (
          <div className="border border-destructive/30 bg-destructive/10 rounded-[6px] px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="border border-green-500/30 bg-green-500/10 rounded-[6px] px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* Gerenciar administradores */}
        <div className="border border-border rounded-[6px] p-6 space-y-5 bg-card">
          <div>
            <h2 className="text-sm font-bold text-foreground">Administradores</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Administradores têm acesso ao dashboard de resultados, janela de declarações e configurações.
              O colaborador precisa ter feito login ao menos uma vez para ser adicionado.
            </p>
          </div>

          {/* Add */}
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
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : 'Adicionar'}
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {admins.length === 0 ? (
              <p className="text-xs text-muted-foreground/40 text-center py-4">Nenhum administrador encontrado.</p>
            ) : admins.map(admin => (
              <div
                key={admin.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-[4px] border border-border bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <span className="text-xs text-foreground">{admin.email || admin.user_id}</span>
                  {admin.user_id === currentUserId && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      você
                    </span>
                  )}
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    admin
                  </span>
                </div>
                {admin.user_id !== currentUserId && (
                  <button
                    onClick={() => handleRemoveAdmin(admin.id, admin.user_id)}
                    disabled={removing === admin.id}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors disabled:opacity-40"
                  >
                    {removing === admin.id ? (
                      <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
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
