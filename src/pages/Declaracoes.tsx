import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import logoNsf from '@/assets/logo_nsfs.png';

const CICLO = '2026.1';

type Janela = {
  data_abertura: string;
  data_fechamento: string;
};

type Declaracao = {
  id?: string;
  declaracao: string;
  metas: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

// ─── Page ─────────────────────────────────────────────────────────────────────
const MOCK_USER = { id: 'demo-user-id', email: 'demo@semfronteiras.app', user_metadata: { full_name: 'Usuário Demo' } } as unknown as User;

const Declaracoes = () => {
  const navigate = useNavigate();
  const [user] = useState<User | null>(MOCK_USER);
  const [janela, setJanela] = useState<Janela | null>(null);
  const [janelaLoading, setJanelaLoading] = useState(true);

  // Load window config — uses tipo='declaracao_expectativas' (and 'metas' shares same window for now)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('janela_declaracoes')
      .select('data_abertura,data_fechamento')
      .eq('ciclo', CICLO)
      .eq('tipo', 'declaracao_expectativas')
      .maybeSingle()
      .then(({ data }: { data: Janela | null }) => {
        setJanela(data);
        setJanelaLoading(false);
      });
  }, []);

  // Load existing declaration
  const loadDeclaracao = useCallback(async (uid: string) => {
    setDataLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('declaracoes')
      .select('id,declaracao,metas')
      .eq('user_id', uid)
      .eq('ciclo', CICLO)
      .maybeSingle();
    if (data) {
      setExistingId(data.id);
      setDeclaracao(data.declaracao ?? '');
      setMetas(data.metas ?? '');
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadDeclaracao(user.id);
  }, [user, loadDeclaracao]);

  const isOpen = janela
    ? new Date() >= new Date(janela.data_abertura) && new Date() <= new Date(janela.data_fechamento)
    : false;

  const handleSave = async () => {
    if (!user || !isOpen) return;
    setSaving(true);
    setSaved(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    if (existingId) {
      await client
        .from('declaracoes')
        .update({ declaracao, metas })
        .eq('id', existingId);
    } else {
      const { data } = await client
        .from('declaracoes')
        .insert({
          user_id: user.id,
          user_name: displayName,
          user_email: user.email ?? '',
          ciclo: CICLO,
          declaracao,
          metas,
        })
        .select('id')
        .single();
      if (data) setExistingId(data.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (authLoading || janelaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-4" style={{ background: '#000' }}>
        <p className="text-muted-foreground text-sm">Você precisa estar logado.</p>
        <button onClick={() => navigate('/')} className="text-xs font-bold text-primary hover:underline">
          Ir para o login
        </button>
      </div>
    );
  }

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
                declaração de expectativas · ciclo {CICLO}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Portal
          </button>
        </div>
      </header>

      <div className="pt-16 max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Title */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ciclo {CICLO}</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Declaração de Expectativas</h1>
        </div>

        {/* Window status banner */}
        {!janela ? (
          <div
            className="border rounded-[4px] px-5 py-4 text-sm text-muted-foreground"
            style={{ background: '#0A0A0A', borderColor: 'hsl(var(--border))' }}
          >
            O período de declarações ainda não foi definido pelo RH. Verifique novamente em breve.
          </div>
        ) : !isOpen ? (
          <div
            className="border rounded-[4px] px-5 py-4 space-y-1"
            style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}
          >
            <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>Período encerrado</p>
            <p className="text-xs text-muted-foreground">
              As declarações estiveram abertas de{' '}
              <span className="text-foreground font-medium">{formatDate(janela.data_abertura)}</span> até{' '}
              <span className="text-foreground font-medium">{formatDate(janela.data_fechamento)}</span>.
            </p>
          </div>
        ) : (
          <div
            className="border rounded-[4px] px-5 py-3 flex items-center gap-2"
            style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.25)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs text-muted-foreground">
              Aberto até <span className="text-foreground font-medium">{formatDate(janela.data_fechamento)}</span>
            </p>
          </div>
        )}

        {/* Form */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Declaração */}
            <div className="border border-border rounded-[4px] p-5 space-y-3" style={{ background: '#0A0A0A' }}>
              <div className="space-y-0.5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Minha declaração de expectativas
                </p>
                <p className="text-[11px] text-muted-foreground/50">
                  Descreva o que você espera entregar e como deseja se desenvolver neste ciclo.
                </p>
              </div>
              <textarea
                value={declaracao}
                onChange={(e) => setDeclaracao(e.target.value)}
                disabled={!isOpen}
                placeholder={isOpen ? 'Escreva sua declaração de expectativas...' : 'Campo fechado no momento.'}
                rows={6}
                maxLength={2000}
                className="w-full bg-transparent border border-border rounded-[4px] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground/30 text-right">{declaracao.length}/2000</p>
            </div>

            {/* Metas */}
            <div className="border border-border rounded-[4px] p-5 space-y-3" style={{ background: '#0A0A0A' }}>
              <div className="space-y-0.5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Metas</p>
                <p className="text-[11px] text-muted-foreground/50">
                  Liste suas metas concretas para o ciclo — o que você vai atingir e como irá medir.
                </p>
              </div>
              <textarea
                value={metas}
                onChange={(e) => setMetas(e.target.value)}
                disabled={!isOpen}
                placeholder={isOpen ? 'Escreva suas metas para o ciclo...' : 'Campo fechado no momento.'}
                rows={6}
                maxLength={2000}
                className="w-full bg-transparent border border-border rounded-[4px] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground/30 text-right">{metas.length}/2000</p>
            </div>

            {/* Save button */}
            {isOpen && (
              <div className="flex items-center justify-between">
                {saved && (
                  <p className="text-xs text-green-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Salvo com sucesso
                  </p>
                )}
                {!saved && <span />}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[4px] text-sm font-bold text-white transition-all duration-150 disabled:opacity-50"
                  style={{ background: saving ? '#1a1a1a' : '#0066FF', border: '1px solid rgba(0,102,255,0.5)' }}
                >
                  {saving && <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {saving ? 'Salvando...' : existingId ? 'Atualizar' : 'Salvar declaração'}
                </button>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/30 pb-6">
          ciclo {CICLO} · nutrição sem fronteiras
        </p>
      </div>
    </div>
  );
};

export default Declaracoes;
