import { ratingLabels } from "./RatingSelector";
import type { CategoryData } from "./EvaluationCategory";

interface EvaluationSummaryProps {
  categories: CategoryData[];
  generalComment: string;
  onGeneralCommentChange: (value: string) => void;
}

const EvaluationSummary = ({ categories, generalComment, onGeneralCommentChange }: EvaluationSummaryProps) => {
  const allRatings = categories.flatMap((c) => c.questions.map((q) => q.rating)).filter(Boolean) as number[];
  const average = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
  const totalQuestions = categories.flatMap((c) => c.questions).length;
  const answeredQuestions = allRatings.length;

  const getAverageLabel = (avg: number) => {
    if (avg === 0) return { label: "—", color: "text-muted-foreground" };
    if (avg < 2) return { label: ratingLabels[1].label, color: ratingLabels[1].color };
    if (avg < 3) return { label: ratingLabels[2].label, color: ratingLabels[2].color };
    if (avg < 4) return { label: ratingLabels[3].label, color: ratingLabels[3].color };
    if (avg < 4.5) return { label: ratingLabels[4].label, color: ratingLabels[4].color };
    return { label: ratingLabels[5].label, color: ratingLabels[5].color };
  };

  const avgMeta = getAverageLabel(average);

  return (
    <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border overflow-hidden">
      <div className="px-8 py-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          📊 Resumo da Avaliação
        </h2>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-muted/40 border border-border p-4 text-center">
            <p className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              {average > 0 ? average.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Nota Média</p>
            <p className={`text-sm font-medium mt-1 ${avgMeta.color}`}>{avgMeta.label}</p>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border p-4 text-center">
            <p className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              {answeredQuestions}
              <span className="text-lg text-muted-foreground font-normal">/{totalQuestions}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Questões Respondidas</p>
            <p className="text-sm font-medium mt-1 text-muted-foreground">
              {totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0}% concluído
            </p>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border p-4 text-center">
            <p className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              {categories.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Categorias</p>
            <p className="text-sm font-medium mt-1 text-muted-foreground">Áreas avaliadas</p>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((category) => {
            const catRatings = category.questions.map((q) => q.rating).filter(Boolean) as number[];
            const catAvg = catRatings.length > 0 ? catRatings.reduce((a, b) => a + b, 0) / catRatings.length : 0;
            return (
              <div key={category.id} className="flex items-center gap-3">
                <span className="text-base w-8 flex-shrink-0">{category.icon}</span>
                <span className="text-sm text-foreground flex-1 truncate">{category.title}</span>
                <div className="w-32 h-2 rounded-full bg-muted overflow-hidden flex-shrink-0">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${catAvg > 0 ? (catAvg / 5) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground w-8 text-right flex-shrink-0">
                  {catAvg > 0 ? catAvg.toFixed(1) : "—"}
                </span>
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            📝 Comentário Geral & Plano de Desenvolvimento
          </label>
          <textarea
            value={generalComment}
            onChange={(e) => onGeneralCommentChange(e.target.value)}
            placeholder="Descreva os principais pontos fortes, áreas de melhoria e próximos passos para o desenvolvimento do colaborador..."
            rows={4}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default EvaluationSummary;
