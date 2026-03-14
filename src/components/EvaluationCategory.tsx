import RatingSelector from "./RatingSelector";

export interface Question {
  id: string;
  text: string;
  rating: number | null;
}

export interface CategoryData {
  id: string;
  title: string;
  icon: string;
  questions: Question[];
  comment: string;
}

interface EvaluationCategoryProps {
  category: CategoryData;
  categoryIndex: number;
  onRatingChange: (questionId: string, rating: number) => void;
  onCommentChange: (comment: string) => void;
}

const EvaluationCategory = ({
  category,
  categoryIndex,
  onRatingChange,
  onCommentChange,
}: EvaluationCategoryProps) => {
  const completedQuestions = category.questions.filter((q) => q.rating !== null).length;
  const progress = Math.round((completedQuestions / category.questions.length) * 100);

  return (
    <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border overflow-hidden">
      <div className="px-8 py-5 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
            {category.icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
              Categoria {categoryIndex + 1}
            </p>
            <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              {category.title}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {completedQuestions}/{category.questions.length}
          </span>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {category.questions.map((question, qIndex) => (
          <div key={question.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">
                {qIndex + 1}
              </span>
              <p className="text-sm font-medium text-foreground leading-relaxed">{question.text}</p>
            </div>
            <div className="pl-9">
              <RatingSelector value={question.rating} onChange={(r) => onRatingChange(question.id, r)} />
            </div>
            {qIndex < category.questions.length - 1 && (
              <div className="pl-9 border-b border-border/50 pt-2" />
            )}
          </div>
        ))}

        <div className="pt-2">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            💬 Comentários e Feedback — {category.title}
          </label>
          <textarea
            value={category.comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder={`Descreva observações, exemplos concretos e sugestões sobre ${category.title.toLowerCase()}...`}
            rows={3}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default EvaluationCategory;
