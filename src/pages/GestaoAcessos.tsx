import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoNsf from '@/assets/logo_nsfs.png';
import { useCicloAtivo } from '@/hooks/useCicloAtivo';

type AdminUser = { id: string; user_id: string; email: string };
type LiderUser = { id: string; user_id: string; email: string };
type EquipeMembro = { id: string; colaborador_nome: string; colaborador_email: string; lider_user_id: string };

// ── small reusable chip ────────────────────────────────────────────────────────
const RoleBadge = ({ role }: { role: 'admin' | 'lideranca' }) =>
  role === 'admin' ? (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">admin</span>
  ) : (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
      style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
      liderança
    </span>
  );

// ── section wrapper ────────────────────────────────────────────────────────────
const Section = ({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) => (
  <div className="border border-border rounded-[6px] p-6 space-y-5 bg-card">
    <div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </div>
    {children}
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────────
const GestaoAcessos = () => {
  const navigate = useNavigate();
  const { ciclo } = useCicloAtivo();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');

  // Admins
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [removingAdmin, setRemovingAdmin] = useState<string | null>(null);
  const [adminMsg, setAdminMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Líderes
  const [lideres, setLideres] = useState<LiderUser[]>([]);
  const [newLiderEmail, setNewLiderEmail] = useState('');
  const [liderLoading, setLiderLoading] = useState(false);
  const [removingLider, setRemovingLider] = useState<string | null>(null);
  const [liderMsg, setLiderMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Criar usuário
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserLoading, setNewUserLoading] = useState(false);
  const [newUserMsg, setNewUserMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Equipe do líder selecionado
  const [selectedLider, setSelectedLider] = useState<LiderUser | null>(null);
  const [equipe, setEquipe] = useState<EquipeMembro[]>([]);
  const [equipeLoading, setEquipeLoading] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [equipeError, setEquipeError] = useState('');
  const [liderSearch, setLiderSearch] = useState('');

  const edgeFn = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-roles`;
  const liderFn = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-lideranca`;

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  const flash = (setter: (v: { ok: boolean; text: string } | null) => void, ok: boolean, text: string) => {
    setter({ ok, text });
    setTimeout(() => setter(null), 5000);
  };

  const loadAdmins = useCallback(async () => {
    const session = await getSession();
    if (!session) return;
    const res = await fetch(edgeFn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'list' }),
    });
    if (res.ok) { const j = await res.json(); setAdmins(j.admins ?? []); }
  }, [edgeFn]);

  const loadLideres = useCallback(async () => {
    const session = await getSession();
    if (!session) return;
    const res = await fetch(liderFn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'list' }),
    });
    if (res.ok) { const j = await res.json(); setLideres(j.lideres ?? []); }
  }, [liderFn]);

  const loadEquipe = useCallback(async (liderUserId: string) => {
    if (!ciclo) return;
    setEquipeLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('equipes')
      .select('id,colaborador_nome,colaborador_email,lider_user_id')
      .eq('lider_user_id', liderUserId)
      .eq('ciclo', ciclo);
    setEquipe(data ?? []);
    setEquipeLoading(false);
  }, [ciclo]);

  // Auth check
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
    if (isAdmin) { loadAdmins(); loadLideres(); }
  }, [isAdmin, loadAdmins, loadLideres]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleCreateUser = async () => {
    const email = newUserEmail.trim().toLowerCase();
    const name = newUserName.trim();
    const password = newUserPassword;
    if (!email || !name || !password) return;
    setNewUserLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setNewUserLoading(false);
    if (err) {
      flash(setNewUserMsg, false, err.message);
    } else {
      flash(setNewUserMsg, true, `Conta criada para ${email}. O usuário receberá um e-mail de confirmação.`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    }
  };

  const handleAddAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;
    setAdminLoading(true);
    const session = await getSession();
    if (!session) { setAdminLoading(false); return; }
    const res = await fetch(edgeFn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'add', email }),
    });
    const j = await res.json();
    if (!res.ok) flash(setAdminMsg, false, j.error || 'Erro ao adicionar.');
    else { flash(setAdminMsg, true, `${email} agora é administrador.`); setNewAdminEmail(''); loadAdmins(); }
    setAdminLoading(false);
  };

  const handleRemoveAdmin = async (id: string, userId: string) => {
    if (userId === currentUserId) { flash(setAdminMsg, false, 'Você não pode remover seu próprio acesso.'); return; }
    setRemovingAdmin(id);
    const session = await getSession();
    if (!session) { setRemovingAdmin(null); return; }
    const res = await fetch(edgeFn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'remove', user_id: userId }),
    });
    const j = await res.json();
    if (!res.ok) flash(setAdminMsg, false, j.error || 'Erro ao remover.');
    else { flash(setAdminMsg, true, 'Acesso removido.'); loadAdmins(); }
    setRemovingAdmin(null);
  };

  const handleAddLider = async () => {
    const email = newLiderEmail.trim().toLowerCase();
    if (!email) return;
    setLiderLoading(true);
    const session = await getSession();
    if (!session) { setLiderLoading(false); return; }
    const res = await fetch(liderFn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'add', email }),
    });
    const j = await res.json();
    if (!res.ok) flash(setLiderMsg, false, j.error || 'Erro ao adicionar.');
    else { flash(setLiderMsg, true, `${email} agora tem acesso de liderança.`); setNewLiderEmail(''); loadLideres(); }
    setLiderLoading(false);
  };

  const handleRemoveLider = async (id: string, userId: string) => {
    setRemovingLider(id);
    const session = await getSession();
    if (!session) { setRemovingLider(null); return; }
    const res = await fetch(liderFn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'remove', user_id: userId }),
    });
    const j = await res.json();
    if (!res.ok) flash(setLiderMsg, false, j.error || 'Erro ao remover.');
    else { flash(setLiderMsg, true, 'Acesso removido.'); loadLideres(); if (selectedLider?.user_id === userId) setSelectedLider(null); }
    setRemovingLider(null);
  };

  const handleAddMembro = async () => {
    if (!selectedLider || !ciclo || !newNome.trim()) return;
    setEquipeError('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('equipes').insert({
      lider_user_id: selectedLider.user_id,
      lider_nome: selectedLider.email.split('@')[0],
      lider_email: selectedLider.email,
      colaborador_nome: newNome.trim(),
      colaborador_email: newEmail.trim(),
      ciclo,
    });
    if (error) { setEquipeError(error.message); return; }
    setNewNome(''); setNewEmail('');
    loadEquipe(selectedLider.user_id);
  };

  const handleRemoveMembro = async (membroId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('equipes').delete().eq('id', membroId);
    if (selectedLider) loadEquipe(selectedLider.user_id);
  };

  const selectLider = (lider: LiderUser) => {
    if (selectedLider?.user_id === lider.user_id) {
      setSelectedLider(null);
    } else {
      setSelectedLider(lider);
      setNewNome(''); setNewEmail(''); setEquipeError('');
      loadEquipe(lider.user_id);
    }
  };

  const filteredLideres = lideres.filter(l =>
    !liderSearch.trim() || l.email.toLowerCase().includes(liderSearch.toLowerCase())
  );

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
          <button onClick={() => navigate('/configuracoes')} className="text-muted-foreground hover:text-foreground transition-colors">
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
              gestão de acessos
            </span>
          </div>
        </div>
      </header>

      {/* Two-column layout on wide screens */}
      <div className="pt-20 w-full max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Administração</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">Gestão de Acessos</h1>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Gerencie administradores e líderes. Colaboradores precisam ter feito login ao menos uma vez para serem adicionados.
          </p>
        </div>

        {/* ── Criar Usuário ─────────────────────────────────────────────── */}
        <div className="mb-6">
          <Section
            title="Criar Usuário"
            desc="Crie contas de acesso para novos colaboradores. O usuário receberá um e-mail para confirmar o cadastro."
          >
            {newUserMsg && (
              <div className={`rounded-[4px] px-3 py-2 text-xs border ${newUserMsg.ok ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                {newUserMsg.text}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                placeholder="Nome completo"
                className="bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
              />
              <input
                type="email"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                placeholder="email@semfronteiras.app"
                className="bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
              />
              <input
                type="password"
                value={newUserPassword}
                onChange={e => setNewUserPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateUser()}
                placeholder="Senha temporária"
                minLength={6}
                className="bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
              />
            </div>
            <button
              onClick={handleCreateUser}
              disabled={newUserLoading || !newUserName.trim() || !newUserEmail.trim() || newUserPassword.length < 6}
              className="px-4 py-2 rounded-[4px] text-sm font-semibold transition-all disabled:opacity-40 text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20"
            >
              {newUserLoading ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : '+ Criar conta'}
            </button>
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── Administradores ───────────────────────────────────────── */}
          <Section
            title="Administradores"
            desc="Acesso ao Painel NSF e a todas as configurações."
          >
            {adminMsg && (
              <div className={`rounded-[4px] px-3 py-2 text-xs border ${adminMsg.ok ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                {adminMsg.text}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
                placeholder="email@semfronteiras.app"
                className="flex-1 bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleAddAdmin}
                disabled={adminLoading || !newAdminEmail.trim()}
                className="px-4 py-2 rounded-[4px] text-sm font-semibold transition-all disabled:opacity-40 text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 whitespace-nowrap"
              >
                {adminLoading ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : '+ Adicionar'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {admins.length === 0 ? (
                <p className="text-xs text-muted-foreground/40 text-center py-6">Nenhum administrador.</p>
              ) : admins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between px-3 py-2.5 rounded-[4px] border border-border bg-primary/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <span className="text-xs text-foreground truncate">{admin.email || admin.user_id}</span>
                    {admin.user_id === currentUserId && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border shrink-0">você</span>
                    )}
                    <RoleBadge role="admin" />
                  </div>
                  {admin.user_id !== currentUserId && (
                    <button
                      onClick={() => handleRemoveAdmin(admin.id, admin.user_id)}
                      disabled={removingAdmin === admin.id}
                      className="text-muted-foreground/30 hover:text-destructive transition-colors disabled:opacity-40 ml-2 shrink-0"
                    >
                      {removingAdmin === admin.id
                        ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ── Líderes ───────────────────────────────────────────────── */}
          <Section
            title="Líderes"
            desc="Acesso ao Dashboard do Líder para visualizar dados do próprio time."
          >
            {liderMsg && (
              <div className={`rounded-[4px] px-3 py-2 text-xs border ${liderMsg.ok ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                {liderMsg.text}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                value={newLiderEmail}
                onChange={e => setNewLiderEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddLider()}
                placeholder="email@semfronteiras.app"
                className="flex-1 bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleAddLider}
                disabled={liderLoading || !newLiderEmail.trim()}
                className="px-4 py-2 rounded-[4px] text-sm font-semibold transition-all disabled:opacity-40 text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 whitespace-nowrap"
              >
                {liderLoading ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : '+ Adicionar'}
              </button>
            </div>

            {lideres.length > 4 && (
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                </svg>
                <input
                  type="text"
                  value={liderSearch}
                  onChange={e => setLiderSearch(e.target.value)}
                  placeholder="Filtrar líderes..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[4px] border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
                />
              </div>
            )}

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {filteredLideres.length === 0 ? (
                <p className="text-xs text-muted-foreground/40 text-center py-6">Nenhum líder cadastrado.</p>
              ) : filteredLideres.map(lider => (
                <div key={lider.id}>
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-[4px] border transition-colors cursor-pointer"
                    style={{
                      borderColor: selectedLider?.user_id === lider.user_id ? 'rgba(0,102,255,0.4)' : 'hsl(var(--border))',
                      background: selectedLider?.user_id === lider.user_id ? 'rgba(0,102,255,0.06)' : 'hsl(var(--card))',
                    }}
                    onClick={() => selectLider(lider)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0">
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <span className="text-xs text-foreground truncate">{lider.email || lider.user_id}</span>
                      <RoleBadge role="lideranca" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border transition-all"
                        style={selectedLider?.user_id === lider.user_id
                          ? { background: 'rgba(0,102,255,0.15)', borderColor: 'rgba(0,102,255,0.3)', color: '#4D94FF' }
                          : { background: 'transparent', borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
                      >
                        {selectedLider?.user_id === lider.user_id ? '▲ time' : '▼ time'}
                      </span>
                      <button
                        onClick={() => handleRemoveLider(lider.id, lider.user_id)}
                        disabled={removingLider === lider.id}
                        className="text-muted-foreground/30 hover:text-destructive transition-colors disabled:opacity-40"
                      >
                        {removingLider === lider.id
                          ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                          : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Equipe do líder selecionado (full width) ──────────────── */}
        {selectedLider && (
          <div className="mt-6 border border-border rounded-[6px] p-6 space-y-4 bg-card" style={{ borderColor: 'rgba(0,102,255,0.3)' }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-0.5">Time do líder</p>
                <h3 className="text-sm font-bold text-foreground">{selectedLider.email}</h3>
                {ciclo && <p className="text-[10px] text-muted-foreground/40 mt-0.5">Ciclo {ciclo} · {equipe.length} colaborador{equipe.length !== 1 ? 'es' : ''}</p>}
              </div>
              <button onClick={() => setSelectedLider(null)} className="text-muted-foreground/40 hover:text-foreground transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Add member */}
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={newNome}
                onChange={e => setNewNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMembro()}
                placeholder="Nome completo do colaborador"
                className="flex-1 min-w-[180px] bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
              />
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email (opcional)"
                className="flex-1 min-w-[180px] bg-background border border-border rounded-[4px] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleAddMembro}
                disabled={!newNome.trim() || !ciclo}
                className="px-4 py-2 rounded-[4px] text-sm font-semibold transition-all disabled:opacity-40 text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 whitespace-nowrap"
              >
                + Adicionar
              </button>
            </div>

            {equipeError && <p className="text-xs text-destructive">{equipeError}</p>}

            {equipeLoading ? (
              <div className="flex justify-center py-6"><div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
            ) : equipe.length === 0 ? (
              <p className="text-xs text-muted-foreground/30 text-center py-4 italic">Nenhum colaborador adicionado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {equipe.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-3 py-2.5 rounded-[4px] border border-border" style={{ background: '#0A0A0A' }}>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{m.colaborador_nome}</p>
                      {m.colaborador_email && <p className="text-[10px] text-muted-foreground/50 truncate">{m.colaborador_email}</p>}
                    </div>
                    <button
                      onClick={() => handleRemoveMembro(m.id)}
                      className="text-muted-foreground/30 hover:text-destructive transition-colors ml-2 shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestaoAcessos;
