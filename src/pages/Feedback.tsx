import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoNsf from '@/assets/logo_nsfs.png';

// ── Nomes fictícios (substituir pela lista real depois) ──────────────────────
const COLABORADORES = [
  { nome: 'Ana Paula Souza', email: 'ana.souza@nsf.org' },
  { nome: 'Bruno Carvalho', email: 'bruno.carvalho@nsf.org' },
  { nome: 'Carla Mendes', email: 'carla.mendes@nsf.org' },
  { nome: 'Diego Ferreira', email: 'diego.ferreira@nsf.org' },
  { nome: 'Elaine Rodrigues', email: 'elaine.rodrigues@nsf.org' },
  { nome: 'Felipe Almeida', email: 'felipe.almeida@nsf.org' },
  { nome: 'Gabriela Lima', email: 'gabriela.lima@nsf.org' },
  { nome: 'Henrique Costa', email: 'henrique.costa@nsf.org' },
  { nome: 'Isabela Nunes', email: 'isabela.nunes@nsf.org' },
  { nome: 'João Pedro Martins', email: 'joao.martins@nsf.org' },
  { nome: 'Karina Oliveira', email: 'karina.oliveira@nsf.org' },
  { nome: 'Lucas Pereira', email: 'lucas.pereira@nsf.org' },
  { nome: 'Mariana Torres', email: 'mariana.torres@nsf.org' },
  { nome: 'Nicolas Barbosa', email: 'nicolas.barbosa@nsf.org' },
  { nome: 'Patrícia Gomes', email: 'patricia.gomes@nsf.org' },
];

type FeedbackRow = {
  id: string;
  from_user_name: string;
  from_user_email: string;
  to_user_name: string;
  to_user_email: string;
  mensagem: string;
  ciclo: string;
  created_at: string;
};

type Tab = 'enviar' | 'recebidos' | 'enviados';

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (dt: string) =>
  new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const Avatar = ({ name, size = 32 }: { name: string; size?: number }) => {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
      style={{ width: size, height: size, background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.25)', color: '#4D94FF' }}
    >
      {initials}
    </div>
  );
};

const FeedbackCard = ({ fb, variant }: { fb: FeedbackRow; variant: 'recebido' | 'enviado' }) => (
  <div
    className="border border-border rounded-[4px] p-4 space-y-3"
    style={{ background: '#0A0A0A' }}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Avatar name={variant === 'recebido' ? fb.from_user_name : fb.to_user_name} />
        <div>
          <p className="text-xs font-bold text-foreground">
            {variant === 'recebido' ? fb.from_user_name : fb.to_user_name}
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            {variant === 'recebido' ? 'enviou para você' : 'você enviou'}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)', color: '#4D94FF' }}
        >
          {fb.ciclo}
        </span>
        <span className="text-[10px] text-muted-foreground/40">{fmt(fb.created_at)}</span>
      </div>
    </div>
    <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/30 pl-3">
      {fb.mensagem}
    </p>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const Feedback = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('enviar');

  // Auth
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);

  // Enviar
  const [busca, setBusca] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [destinatario, setDestinatario] = useState<{ nome: string; email: string } | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Listas
  const [recebidos, setRecebidos] = useState<FeedbackRow[]>([]);
  const [enviados, setEnviados] = useState<FeedbackRow[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Sugestões filtradas
  const sugestoes = COLABORADORES.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) && c.email !== user?.email
  ).slice(0, 8);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Mock user — auth desabilitado temporariamente
  useEffect(() => {
    setUser({ id: '00000000-0000-0000-0000-000000000000', email: 'demo@semfronteiras.app', name: 'Usuário Demo' });
  }, []);

  // Carregar listas
  const loadLists = async () => {
    if (!user) return;
    setLoadingLists(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const [{ data: rec }, { data: env }] = await Promise.all([
      client.from('feedbacks').select('*').eq('to_user_email', user.email).order('created_at', { ascending: false }),
      client.from('feedbacks').select('*').eq('from_user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setRecebidos(rec ?? []);
    setEnviados(env ?? []);
    setLoadingLists(false);
  };

  useEffect(() => {
    if (user) loadLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSelectDestinatario = (c: { nome: string; email: string }) => {
    setDestinatario(c);
    setBusca(c.nome);
    setDropdownOpen(false);
  };

  const handleEnviar = async () => {
    if (!destinatario || !mensagem.trim() || !user) return;
    if (mensagem.trim().length < 10) { setSendError('Mensagem muito curta (mínimo 10 caracteres).'); return; }
    if (mensagem.trim().length > 2000) { setSendError('Mensagem muito longa (máximo 2000 caracteres).'); return; }

    setSending(true);
    setSendError('');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('feedbacks').insert({
        from_user_id: user.id,
        from_user_name: user.name,
        from_user_email: user.email,
        to_user_name: destinatario.nome,
        to_user_email: destinatario.email,
        mensagem: mensagem.trim(),
        ciclo: '2026.1',
      });
      if (error) throw error;
      setSendSuccess(true);
      setDestinatario(null);
      setBusca('');
      setMensagem('');
      await loadLists();
      setTimeout(() => setSendSuccess(false), 4000);
    } catch {
      setSendError('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const canSend = !!destinatario && mensagem.trim().length >= 10;

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'enviar', label: 'Enviar feedback' },
    { key: 'recebidos', label: 'Recebidos', count: recebidos.length },
    { key: 'enviados', label: 'Enviados', count: enviados.length },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
              feedback
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-border">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-colors relative"
              style={{
                color: activeTab === t.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                borderBottom: activeTab === t.key ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              }}
            >
              {t.label}
              {typeof t.count === 'number' && t.count > 0 && (
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,102,255,0.15)', color: '#4D94FF' }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="pt-28 w-full max-w-2xl mx-auto px-6 py-8">

        {/* ── TAB: ENVIAR ─────────────────────────────────────────── */}
        {activeTab === 'enviar' && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Feedback</p>
              <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">Enviar feedback</h1>
              <p className="text-sm text-muted-foreground mt-1">Reconheça alguém ou compartilhe uma observação construtiva.</p>
            </div>

            {sendSuccess && (
              <div
                className="border rounded-[4px] px-4 py-3 text-sm font-medium flex items-center gap-2"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Feedback enviado com sucesso!
              </div>
            )}

            <div className="space-y-5 border border-border rounded-[4px] p-5" style={{ background: '#0A0A0A' }}>
              {/* Destinatário */}
              <div className="space-y-1.5" ref={dropdownRef}>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Para quem é este feedback?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={busca}
                    onChange={e => {
                      setBusca(e.target.value);
                      setDestinatario(null);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="Buscar colaborador..."
                    maxLength={100}
                    className="w-full bg-card border border-border rounded-[4px] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                  />
                  {destinatario && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4" style={{ color: '#4ade80' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {/* Dropdown */}
                  {dropdownOpen && busca.length > 0 && !destinatario && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 border border-border rounded-[4px] overflow-hidden z-50"
                      style={{ background: '#111' }}
                    >
                      {sugestoes.length === 0 ? (
                        <p className="px-3 py-2.5 text-sm text-muted-foreground/50">Nenhum colaborador encontrado.</p>
                      ) : (
                        sugestoes.map(c => (
                          <button
                            key={c.email}
                            onMouseDown={() => handleSelectDestinatario(c)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                          >
                            <Avatar name={c.nome} size={28} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{c.nome}</p>
                              <p className="text-[10px] text-muted-foreground/50">{c.email}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mensagem */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Mensagem
                </label>
                <textarea
                  rows={6}
                  value={mensagem}
                  onChange={e => setMensagem(e.target.value)}
                  maxLength={2000}
                  placeholder="Escreva seu feedback de forma clara e respeitosa. Seja específico sobre comportamentos e situações..."
                  className="w-full bg-card border border-border rounded-[4px] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground/40">Mínimo 10 caracteres · Máximo 2000</p>
                  <p className="text-[10px] text-muted-foreground/40 tabular-nums">{mensagem.length}/2000</p>
                </div>
              </div>

              {/* Erro */}
              {sendError && (
                <p className="text-xs" style={{ color: '#f87171' }}>{sendError}</p>
              )}

              {/* Enviar */}
              <button
                onClick={handleEnviar}
                disabled={!canSend || sending}
                className="w-full py-3 text-sm font-bold rounded-[4px] transition-all duration-200 disabled:opacity-40"
                style={
                  canSend && !sending
                    ? { background: '#0066FF', color: '#fff', boxShadow: '0 4px 20px rgba(0,102,255,0.25)' }
                    : { background: '#111', color: '#444', cursor: 'not-allowed' }
                }
              >
                {sending ? 'Enviando...' : 'Enviar feedback'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: RECEBIDOS ──────────────────────────────────────── */}
        {activeTab === 'recebidos' && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Mural</p>
              <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">Meus feedbacks recebidos</h1>
              <p className="text-sm text-muted-foreground mt-1">Feedbacks que você recebeu de colegas.</p>
            </div>

            {loadingLists ? (
              <div className="flex justify-center py-16">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : recebidos.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.12)' }}
                >
                  <svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Nenhum feedback recebido ainda.</p>
                <p className="text-xs text-muted-foreground/50">Os feedbacks que colegas enviarem para você aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recebidos.map(fb => <FeedbackCard key={fb.id} fb={fb} variant="recebido" />)}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ENVIADOS ───────────────────────────────────────── */}
        {activeTab === 'enviados' && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Mural</p>
              <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">Meus feedbacks enviados</h1>
              <p className="text-sm text-muted-foreground mt-1">Feedbacks que você enviou para colegas.</p>
            </div>

            {loadingLists ? (
              <div className="flex justify-center py-16">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : enviados.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.12)' }}
                >
                  <svg className="w-5 h-5" style={{ color: '#4D94FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Você ainda não enviou nenhum feedback.</p>
                <button
                  onClick={() => setActiveTab('enviar')}
                  className="text-xs font-bold px-4 py-2 rounded-[4px] transition-all"
                  style={{ background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)', color: '#4D94FF' }}
                >
                  Enviar primeiro feedback
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {enviados.map(fb => <FeedbackCard key={fb.id} fb={fb} variant="enviado" />)}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Feedback;
