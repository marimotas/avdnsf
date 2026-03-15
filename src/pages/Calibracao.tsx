import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  calcularResultados,
  CLUSTER_COLORS,
  type ColaboradorResultado,
  type AvaliacaoRow,
} from '@/lib/ninebox-calc';
import { useCicloAtivo } from '@/hooks/useCicloAtivo';
import logoNsf from '@/assets/logo_nsfs.png';

// ─── Types ────────────────────────────────────────────────────────────────────

type DeclaracaoRow = {
  user_name: string;
  user_email: string;
  declaracao: string | null;
  metas: string | null;
  updated_at: string;
};

type ProfileRow = {
  name: string;
  email: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

// ─── Score bar ────────────────────────────────────────────────────────────────

const ScoreRow = ({
  label,
  score,
  nivel,
  color,
}: {
  label: string;
  score: number;
  nivel: string;
  color: string;
}) => {
  const nivelColor =
    nivel === 'Alto'
      ? { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' }
      : nivel === 'Médio'
      ? { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' }
      : { bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.3)', text: '#f87171' };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tabular-nums text-foreground">{score.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">/25</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: nivelColor.bg, border: `1px solid ${nivelColor.border}`, color: nivelColor.text }}
          >
            {nivel}
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full" style={{ background: '#1A1A1A' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${((score - 5) / 20) * 100}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Mini 9-Box ───────────────────────────────────────────────────────────────

const Mini9Box = ({ resultado }: { resultado: ColaboradorResultado }) => {
  const desMap: Record<string, number> = { Baixo: 0, Médio: 1, Alto: 2 };
  const potMap: Record<string, number> = { Baixo: 0, Médio: 1, Alto: 2 };
  const myCol = desMap[resultado.desempenhoNivel];
  const myRow = potMap[resultado.potencialNivel];
  const c = CLUSTER_COLORS[resultado.quadrante.cluster];

  return (
    <div className="space-y-1">
      {[2, 1, 0].map((row) => (
        <div key={row} className="flex gap-1">
          {[0, 1, 2].map((col) => {
            const isMe = col === myCol && row === myRow;
            return (
              <div
                key={col}
                className="w-10 h-10 rounded-[3px] flex items-center justify-center transition-all"
                style={
                  isMe
                    ? { background: c.bg, border: `2px solid ${c.border}` }
                    : { background: '#111', border: '1px solid #222' }
                }
              >
                {isMe && <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.badge }} />}
              </div>
            );
          })}
        </div>
      ))}
      <div className="flex justify-between text-[8px] text-muted-foreground/50 pt-0.5 px-0.5">
        <span>Baixo</span>
        <span>Desempenho →</span>
        <span>Alto</span>
      </div>
    </div>
  );
};

// ─── Relatório do colaborador ─────────────────────────────────────────────────

const Relatorio = ({
  resultado,
  declaracao,
  ciclo,
}: {
  resultado: ColaboradorResultado;
  declaracao: DeclaracaoRow | null;
  ciclo: string;
}) => {
  const c = CLUSTER_COLORS[resultado.quadrante.cluster];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Nome + Ciclo */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">{resultado.nome}</h2>
          <p className="text-xs text-muted-foreground/50 mt-0.5">Ciclo {ciclo}</p>
        </div>
        <div
          className="text-xs font-black px-3 py-1 rounded-full"
          style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
        >
          C{resultado.quadrante.cluster} — {resultado.quadrante.clusterNome.toUpperCase()}
        </div>
      </div>

      {/* Grid de 2 colunas em desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Avaliação de Desempenho ─────────────────────────────── */}
        <div className="border border-border rounded-[6px] p-5 space-y-5" style={{ background: '#0A0A0A' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Avaliação de Desempenho
          </p>

          {/* Cluster hero */}
          <div
            className="rounded-[4px] px-4 py-3 space-y-0.5"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}
          >
            <p className="text-xs font-bold" style={{ color: c.text }}>{resultado.quadrante.nome}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{resultado.quadrante.clusterAcao}</p>
          </div>

          {/* Scores */}
          <ScoreRow
            label="Desempenho"
            score={resultado.desempenhoScore}
            nivel={resultado.desempenhoNivel}
            color="#0066FF"
          />
          {resultado.potencialScore > 0 && (
            <ScoreRow
              label="Potencial"
              score={resultado.potencialScore}
              nivel={resultado.potencialNivel}
              color="hsl(0 0% 75%)"
            />
          )}

          {/* 9-box mini */}
          <div className="pt-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Posição na Matriz
            </p>
            <Mini9Box resultado={resultado} />
          </div>

          {/* Avaliações recebidas */}
          <div className="border-t border-border pt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="space-y-0.5">
              <p className="font-bold uppercase tracking-widest text-[10px]">Tipo de avaliação</p>
              <p className="text-foreground font-semibold">
                {resultado.temLider ? '✓ Líder' : '— sem líder'}
              </p>
              <p className="text-foreground font-semibold">
                {resultado.temInteracao ? '✓ Interação' : '— sem interação'}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="font-bold uppercase tracking-widest text-[10px]">Comentários</p>
              <p className="text-foreground font-semibold">
                {resultado.comentarios.length} recebido{resultado.comentarios.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Comentários */}
          {resultado.comentarios.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Comentários recebidos
              </p>
              {resultado.comentarios.map((cmt, i) => (
                <div
                  key={i}
                  className="border-l-2 pl-3 py-1"
                  style={{ borderColor: c.border }}
                >
                  <p className="text-xs text-foreground/80 leading-relaxed italic">"{cmt}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Declaração e Metas ──────────────────────────────────── */}
        <div className="space-y-5">

          {/* Declaração */}
          <div className="border border-border rounded-[6px] p-5 space-y-3" style={{ background: '#0A0A0A' }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Declaração de Expectativas
              </p>
              {declaracao?.updated_at && (
                <span className="text-[10px] text-muted-foreground/40">
                  {fmt(declaracao.updated_at)}
                </span>
              )}
            </div>

            {declaracao?.declaracao ? (
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {declaracao.declaracao}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <svg className="w-8 h-8 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
                <p className="text-xs text-muted-foreground/40">Nenhuma declaração preenchida.</p>
              </div>
            )}
          </div>

          {/* Metas */}
          <div className="border border-border rounded-[6px] p-5 space-y-3" style={{ background: '#0A0A0A' }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Metas
              </p>
              {declaracao?.updated_at && (
                <span className="text-[10px] text-muted-foreground/40">
                  {fmt(declaracao.updated_at)}
                </span>
              )}
            </div>

            {declaracao?.metas ? (
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {declaracao.metas}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <svg className="w-8 h-8 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
                <p className="text-xs text-muted-foreground/40">Nenhuma meta preenchida.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Busca com autocomplete ───────────────────────────────────────────────────

const BuscaInput = ({
  value,
  onChange,
  sugestoes,
  onSelect,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  sugestoes: string[];
  onSelect: (nome: string) => void;
  loading: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Digite o nome do colaborador..."
          className="w-full pl-11 pr-4 py-3 text-sm rounded-[6px] border border-border bg-card text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
          style={{ background: '#0A0A0A' }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        )}
      </div>

      {open && sugestoes.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 border border-border rounded-[6px] overflow-hidden z-50 max-h-64 overflow-y-auto"
          style={{ background: '#111' }}
        >
          {sugestoes.map((nome) => (
            <button
              key={nome}
              onMouseDown={() => { onSelect(nome); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.25)', color: '#4D94FF' }}
              >
                {nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
              </div>
              <span className="text-sm text-foreground">{nome}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Calibracao = () => {
  const navigate = useNavigate();
  const { ciclo, loading: cicloLoading } = useCicloAtivo();

  // Auth
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Busca
  const [busca, setBusca] = useState('');
  const [nomeSelecionado, setNomeSelecionado] = useState('');
  const [todosNomes, setTodosNomes] = useState<string[]>([]);

  // Dados carregados
  const [resultado, setResultado] = useState<ColaboradorResultado | null>(null);
  const [declaracao, setDeclaracao] = useState<DeclaracaoRow | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Sugestões filtradas
  const sugestoes = todosNomes.filter(
    (n) =>
      busca.trim().length > 0 &&
      n.toLowerCase().includes(busca.toLowerCase()) &&
      n !== nomeSelecionado
  ).slice(0, 8);

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/'); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
      if (!data) { navigate('/'); return; }
      setIsAdmin(true);
      setAuthLoading(false);
    })();
  }, [navigate]);

  // ── Carregar lista de nomes de colaboradores avaliados ──────────────────────
  useEffect(() => {
    if (!isAdmin || !ciclo) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('avaliacoes')
      .select('colaborador_nome')
      .eq('ciclo', ciclo)
      .then(({ data }: { data: { colaborador_nome: string }[] | null }) => {
        if (!data) return;
        const unicos = [...new Set(data.map((r) => r.colaborador_nome))].sort();
        setTodosNomes(unicos);
      });
  }, [isAdmin, ciclo]);

  // ── Buscar dados do colaborador selecionado ─────────────────────────────────
  useEffect(() => {
    if (!nomeSelecionado || !ciclo) return;

    setDataLoading(true);
    setResultado(null);
    setDeclaracao(null);
    setNotFound(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    Promise.all([
      // Avaliações
      client
        .from('avaliacoes')
        .select('colaborador_nome,tipo_avaliador,d1,d2,d3,d4,d5,p1,p2,p3,p4,p5,i1,i2,i3,i4,i5,comentario')
        .eq('ciclo', ciclo)
        .eq('colaborador_nome', nomeSelecionado),

      // Declarações — busca por nome (já que não temos user_id aqui)
      client
        .from('declaracoes')
        .select('user_name,user_email,declaracao,metas,updated_at')
        .eq('ciclo', ciclo)
        .ilike('user_name', nomeSelecionado)
        .maybeSingle(),
    ]).then(
      ([
        { data: avalData },
        { data: declData },
      ]: [
        { data: AvaliacaoRow[] | null },
        { data: DeclaracaoRow | null },
      ]) => {
        if (!avalData || avalData.length === 0) {
          setNotFound(true);
        } else {
          const resultados = calcularResultados(avalData);
          setResultado(resultados[0] ?? null);
        }
        setDeclaracao(declData ?? null);
        setDataLoading(false);
      }
    );
  }, [nomeSelecionado, ciclo]);

  const handleSelect = (nome: string) => {
    setNomeSelecionado(nome);
    setBusca(nome);
  };

  const handleLimpar = () => {
    setBusca('');
    setNomeSelecionado('');
    setResultado(null);
    setDeclaracao(null);
    setNotFound(false);
  };

  // ── Loading / acesso ─────────────────────────────────────────────────────────
  if (authLoading || cicloLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: '#000' }}>
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoNsf} alt="NSF" className="w-7 h-7" />
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-foreground" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: '14px' }}>
                nutrição sem fronteiras
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: '10px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.03em' }}>
                calibração · {ciclo ? `ciclo ${ciclo}` : 'sem ciclo ativo'}
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

      <div className="pt-16 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Título */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Administração</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Calibração</h1>
          <p className="text-sm text-muted-foreground">
            Consulte o relatório completo de um colaborador: avaliação de desempenho, declaração de expectativas e metas.
          </p>
        </div>

        {/* Sem ciclo ativo */}
        {!ciclo && (
          <div
            className="border rounded-[4px] px-5 py-4 text-sm text-muted-foreground"
            style={{ background: '#0A0A0A', borderColor: 'hsl(var(--border))' }}
          >
            Nenhum ciclo ativo no momento. Ative um ciclo em <strong className="text-foreground">Configurações</strong> para usar a calibração.
          </div>
        )}

        {/* Campo de busca */}
        {ciclo && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              Colaborador
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <BuscaInput
                  value={busca}
                  onChange={(v) => { setBusca(v); if (v !== nomeSelecionado) setNomeSelecionado(''); }}
                  sugestoes={sugestoes}
                  onSelect={handleSelect}
                  loading={dataLoading}
                />
              </div>
              {(busca || nomeSelecionado) && (
                <button
                  onClick={handleLimpar}
                  className="px-4 py-3 rounded-[6px] text-xs font-bold border border-border text-muted-foreground hover:text-foreground transition-colors"
                  style={{ background: '#0A0A0A' }}
                >
                  Limpar
                </button>
              )}
            </div>
            {todosNomes.length === 0 && !dataLoading && (
              <p className="text-xs text-muted-foreground/40">
                Nenhuma avaliação encontrada para o ciclo {ciclo}.
              </p>
            )}
            {todosNomes.length > 0 && (
              <p className="text-xs text-muted-foreground/40">
                {todosNomes.length} colaborador{todosNomes.length !== 1 ? 'es' : ''} avaliado{todosNomes.length !== 1 ? 's' : ''} neste ciclo
              </p>
            )}
          </div>
        )}

        {/* Loading de dados */}
        {dataLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {/* Não encontrado */}
        {notFound && !dataLoading && (
          <div
            className="border rounded-[6px] px-5 py-8 text-center space-y-2"
            style={{ background: '#0A0A0A', borderColor: 'hsl(var(--border))' }}
          >
            <p className="text-sm font-bold text-foreground">Nenhuma avaliação encontrada</p>
            <p className="text-xs text-muted-foreground">
              Não há avaliações registradas para <strong className="text-foreground">{nomeSelecionado}</strong> no ciclo {ciclo}.
            </p>
          </div>
        )}

        {/* Relatório */}
        {resultado && !dataLoading && (
          <Relatorio
            resultado={resultado}
            declaracao={declaracao}
            ciclo={ciclo!}
          />
        )}

        {/* Estado vazio — aguardando busca */}
        {!nomeSelecionado && !dataLoading && ciclo && (
          <div
            className="border border-dashed border-border rounded-[6px] px-5 py-16 flex flex-col items-center gap-3 text-center"
            style={{ background: 'transparent' }}
          >
            <svg className="w-10 h-10 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
            <p className="text-sm font-bold text-foreground">Busque um colaborador</p>
            <p className="text-xs text-muted-foreground/50 max-w-xs">
              Digite o nome acima para visualizar o relatório completo de calibração.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/20 pb-6">
          nutrição sem fronteiras · calibração {ciclo}
        </p>
      </div>
    </div>
  );
};

export default Calibracao;
