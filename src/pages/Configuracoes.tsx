import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoNsf from '@/assets/logo_nsfs.png';

type AdminUser = {
  id: string;
  user_id: string;
  role: string;
  email?: string;
};

const Configuracoes = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const checkAdmin = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/'); return; }
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).eq('role', 'admin').maybeSingle();
    if (!data) { navigate('/'); return; }
    setIsAdmin(true);
  }, [navigate]);

  const loadAdmins = useCallback(async () => {
    const { data } = await supabase.from('user_roles').select('*').eq('role', 'admin');
    setAdmins(data ?? []);
  }, []);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

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
      // Look up user by email via edge function / RPC workaround:
      // We need the user_id from auth. We'll call a workaround using admin client on edge function.
      // For now we use the service role key via supabase-js admin API.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'add', email }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Erro ao adicionar admin.');
      } else {
        setSuccess(`${email} agora tem acesso de administrador.`);
        setNewEmail('');
        loadAdmins();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string, userId: string) => {
    setError('');
    setSuccess('');
    setRemoving(adminId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Don't allow removing yourself
      if (userId === session.user.id) {
        setError('Você não pode remover seu próprio acesso de administrador.');
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'remove', user_id: userId }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Erro ao remover admin.');
      } else {
        setSuccess('Acesso removido com sucesso.');
        loadAdmins();
      }
    } finally {
      setRemoving(null);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
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
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.03em' }}>
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

        {/* Feedback */}
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-[6px] px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="border border-green-500/30 bg-green-500/10 rounded-[6px] px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* Gerenciar administradores */}
        <div className="border border-border rounded-[6px] p-6 space-y-5" style={{ background: '#0A0A0A' }}>
          <div>
            <h2 className="text-sm font-bold text-foreground">Administradores</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Administradores têm acesso ao dashboard de resultados, janela de declarações e configurações.
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
              className="px-4 py-2 rounded-[4px] text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.3)', color: '#4D94FF' }}
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
                className="flex items-center justify-between px-3 py-2.5 rounded-[4px] border border-border"
                style={{ background: 'rgba(0,102,255,0.03)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)' }}
                  >
                    <svg className="w-3 h-3" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <span className="text-xs text-foreground font-mono">{admin.user_id}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,102,255,0.12)', border: '1px solid rgba(0,102,255,0.2)', color: '#4D94FF' }}
                  >
                    admin
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveAdmin(admin.id, admin.user_id)}
                  disabled={removing === admin.id}
                  className="text-xs text-muted-foreground/40 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  {removing === admin.id ? (
                    <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
