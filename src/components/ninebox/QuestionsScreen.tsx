import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  type EvaluationState,
  LIDER_QUESTIONS,
  INTERACAO_QUESTIONS,
  SCALE_LABELS,
  COMMENT_PLACEHOLDER,
} from './types';

interface QuestionsScreenProps {
  state: EvaluationState;
  onChange: (s: EvaluationState) => void;
  onSubmitted: () => void;
}

interface Question {
  key: string;
  text: string;
  dimension: 'Desempenho' | 'Potencial';
}

function buildQuestions(tipo: EvaluationState['tipoAvaliador']): Question[] {
  if (tipo === 'Líder') {
    return [
      ...LIDER_QUESTIONS.desempenho.map((q) => ({ ...q, dimension: 'Desempenho' as const })),
      ...LIDER_QUESTIONS.potencial.map((q) => ({ ...q, dimension: 'Potencial' as const })),
    ];
  }
  return INTERACAO_QUESTIONS.map((q) => ({ ...q, dimension: 'Desempenho' as const }));
}

const DimensionBadge = ({ dimension }: { dimension: 'Desempenho' | 'Potencial' }) => {
  if (dimension === 'Desempenho') {
    return (
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-[2px]"
        style={{
          background: 'rgba(0,102,255,0.12)',
          border: '1px solid rgba(0,102,255,0.3)',
          color: '#4D94FF',
        }}
      >
        Desempenho
      </span>
    );
  }
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-[2px]"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#FFFFFF',
      }}
    >
      Potencial
    </span>
  );
};

const QuestionsScreen = ({ state, onChange, onSubmitted }: QuestionsScreenProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [janelaAberta, setJanelaAberta] = useState<boolean | null>(null);

  useEffect(() => {
    const checkJanela = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('janela_declaracoes')
        .select('data_abertura,data_fechamento')
        .eq('tipo', 'avaliacao_desempenho')
        .eq('ciclo', '2026.1')
        .maybeSingle();

      if (!data) { setJanelaAberta(false); return; }
      const today = new Date().toISOString().slice(0, 10);
      const aberturaDate = data.data_abertura?.slice(0, 10) ?? '';
      const fechamentoDate = data.data_fechamento?.slice(0, 10) ?? '';
      setJanelaAberta(!!(aberturaDate && fechamentoDate && today >= aberturaDate && today <= fechamentoDate));
    };
    checkJanela();
  }, []);

  const questions = buildQuestions(state.tipoAvaliador);
  const total = questions.length;
  const answered = questions.filter((q) => state[q.key as keyof EvaluationState] !== null).length;
  const progress = total > 0 ? (answered / total) * 100 : 0;
  const allAnswered = answered === total;

  const getAnswer = (key: string): number | null =>
    state[key as keyof EvaluationState] as number | null;

  const setAnswer = (key: string, value: number) => {
    onChange({ ...state, [key]: value });
  };

  // Score per dimension
  const desempenhoKeys = state.tipoAvaliador === 'Líder'
    ? ['d1', 'd2', 'd3', 'd4', 'd5']
    : ['i1', 'i2', 'i3', 'i4', 'i5'];
  const potencialKeys = ['p1', 'p2', 'p3', 'p4', 'p5'];

  const avgScore = (keys: string[]) => {
    const vals = keys.map((k) => state[k as keyof EvaluationState] as number | null).filter((v) => v !== null) as number[];
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const desempenhoAvg = avgScore(desempenhoKeys);
  const potencialAvg = state.tipoAvaliador === 'Líder' ? avgScore(potencialKeys) : null;

  const handleSubmit = async () => {
    if (!allAnswered || loading || !janelaAberta) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        colaborador_nome: state.colaboradorNome,
        avaliador_nome: state.avaliadorNome,
        tipo_avaliador: state.tipoAvaliador,
        comentario: state.comentario || null,
        ciclo: '2026.1', // TODO: pass ciclo dinamicamente quando múltiplos ciclos estiverem ativos
        // Líder fields
        d1: state.tipoAvaliador === 'Líder' ? state.d1 : null,
        d2: state.tipoAvaliador === 'Líder' ? state.d2 : null,
        d3: state.tipoAvaliador === 'Líder' ? state.d3 : null,
        d4: state.tipoAvaliador === 'Líder' ? state.d4 : null,
        d5: state.tipoAvaliador === 'Líder' ? state.d5 : null,
        p1: state.tipoAvaliador === 'Líder' ? state.p1 : null,
        p2: state.tipoAvaliador === 'Líder' ? state.p2 : null,
        p3: state.tipoAvaliador === 'Líder' ? state.p3 : null,
        p4: state.tipoAvaliador === 'Líder' ? state.p4 : null,
        p5: state.tipoAvaliador === 'Líder' ? state.p5 : null,
        // Interação fields
        i1: state.tipoAvaliador === 'Interação' ? state.i1 : null,
        i2: state.tipoAvaliador === 'Interação' ? state.i2 : null,
        i3: state.tipoAvaliador === 'Interação' ? state.i3 : null,
        i4: state.tipoAvaliador === 'Interação' ? state.i4 : null,
        i5: state.tipoAvaliador === 'Interação' ? state.i5 : null,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any).from('avaliacoes').insert(payload);
      if (dbError) throw dbError;
      onSubmitted();
    } catch (e: unknown) {
      setError('Erro ao salvar avaliação. Tente novamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Progress bar */}
      <div
        className="sticky top-[69px] z-40 py-4 border-b border-border"
        style={{ background: '#000' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-bold text-foreground">{state.colaboradorNome}</p>
            <p className="text-xs text-muted-foreground">
              por {state.avaliadorNome} · <span className="text-foreground">{state.tipoAvaliador}</span>
            </p>
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: answered === total ? 'hsl(var(--success))' : 'hsl(var(--primary))' }}>
            {answered}/{total}
          </span>
        </div>
        <div className="h-1 rounded-full" style={{ background: '#1A1A1A' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: '#0066FF' }}
          />
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, idx) => {
        const answer = getAnswer(q.key);
        return (
          <div
            key={q.key}
            className="border border-border rounded-[4px] p-5 space-y-4 transition-colors duration-200"
            style={{ background: '#0A0A0A' }}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <span className="text-xs font-black tabular-nums mt-0.5" style={{ color: 'hsl(var(--text-dim))' }}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 space-y-2">
                <DimensionBadge dimension={q.dimension} />
                <p className="text-sm text-foreground leading-relaxed">{q.text}</p>
              </div>
            </div>

            {/* Scale */}
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setAnswer(q.key, val)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-[4px] border text-xs font-bold transition-all duration-150"
                  style={
                    answer === val
                      ? { background: '#0066FF', borderColor: '#0066FF', color: '#fff' }
                      : { background: '#0A0A0A', borderColor: '#2A2A2A', color: '#666666' }
                  }
                >
                  <span className="text-base font-black">{val}</span>
                  <span className="text-[9px] leading-tight text-center hidden sm:block" style={{ color: answer === val ? 'rgba(255,255,255,0.8)' : '#555' }}>
                    {SCALE_LABELS[val]}
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile label */}
            {answer !== null && (
              <p className="sm:hidden text-xs text-center text-muted-foreground">
                {SCALE_LABELS[answer]}
              </p>
            )}
          </div>
        );
      })}

      {/* Comment */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Comentário <span style={{ color: 'hsl(var(--text-dim))' }}>(opcional)</span>
        </label>
        <textarea
          rows={5}
          value={state.comentario}
          onChange={(e) => onChange({ ...state, comentario: e.target.value })}
          placeholder={COMMENT_PLACEHOLDER}
          className="w-full bg-card border border-border rounded-[4px] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
        />
      </div>

      {/* Summary card */}
      <div
        className="border border-border rounded-[4px] p-5 space-y-4"
        style={{ background: '#0A0A0A' }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resumo</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avaliado</span>
            <span className="font-semibold text-foreground">{state.colaboradorNome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avaliador</span>
            <span className="font-semibold text-foreground">{state.avaliadorNome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo</span>
            <span className="font-semibold text-foreground">{state.tipoAvaliador}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold" style={{ color: allAnswered ? 'hsl(var(--success))' : 'hsl(var(--primary))' }}>
              {answered}/{total} respondidas
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Score por dimensão</p>
          <ScoreBar label="Desempenho" avg={desempenhoAvg} color="#0066FF" />
          {potencialAvg !== null && (
            <ScoreBar label="Potencial" avg={potencialAvg} color="hsl(0 0% 100%)" />
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm font-medium" style={{ color: 'hsl(0 72% 51%)' }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="pb-8">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="w-full py-4 text-sm font-bold tracking-wide rounded-[4px] transition-all duration-200"
          style={
            allAnswered && !loading
              ? { background: '#0066FF', color: '#fff', boxShadow: '0 4px 24px rgba(0,102,255,0.3)' }
              : { background: '#111111', color: '#444444', cursor: 'not-allowed' }
          }
        >
          {loading ? 'Salvando...' : 'Salvar e enviar avaliação'}
        </button>
      </div>
    </div>
  );
};

// Helper bar component
const ScoreBar = ({ label, avg, color }: { label: string; avg: number; color: string }) => {
  const pct = avg > 0 ? (avg / 5) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums" style={{ color: avg > 0 ? color : 'hsl(var(--text-dim))' }}>
          {avg > 0 ? avg.toFixed(1) : '—'}
        </span>
      </div>
      <div className="h-1 rounded-full" style={{ background: '#1A1A1A' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

export default QuestionsScreen;
