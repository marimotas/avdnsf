import { useState } from "react";
import EvaluationHeader from "./EvaluationHeader";
import EvaluationCategory, { type CategoryData } from "./EvaluationCategory";
import EvaluationSummary from "./EvaluationSummary";
import { exportEvaluationToExcel } from "@/lib/exportToExcel";

const initialCategories: CategoryData[] = [
  {
    id: "technical",
    title: "Competências Técnicas",
    icon: "⚙️",
    comment: "",
    questions: [
      { id: "t1", text: "Domina os conhecimentos técnicos exigidos pelo cargo", rating: null },
      { id: "t2", text: "Aplica corretamente as ferramentas e metodologias do setor", rating: null },
      { id: "t3", text: "Demonstra capacidade de aprendizado contínuo e atualização", rating: null },
      { id: "t4", text: "Entrega trabalhos com qualidade e precisão técnica", rating: null },
    ],
  },
  {
    id: "productivity",
    title: "Produtividade & Resultados",
    icon: "🎯",
    comment: "",
    questions: [
      { id: "p1", text: "Cumpre prazos e metas estabelecidos", rating: null },
      { id: "p2", text: "Consegue priorizar tarefas de forma eficaz", rating: null },
      { id: "p3", text: "Apresenta volume de entregas adequado à função", rating: null },
      { id: "p4", text: "Busca otimizar processos e melhorar a eficiência", rating: null },
    ],
  },
  {
    id: "communication",
    title: "Comunicação & Relacionamento",
    icon: "💬",
    comment: "",
    questions: [
      { id: "c1", text: "Comunica-se de forma clara e objetiva", rating: null },
      { id: "c2", text: "Mantém bom relacionamento interpessoal com a equipe", rating: null },
      { id: "c3", text: "Sabe ouvir e aceitar feedbacks construtivos", rating: null },
      { id: "c4", text: "Colabora ativamente com colegas e outros times", rating: null },
    ],
  },
  {
    id: "leadership",
    title: "Liderança & Iniciativa",
    icon: "🌟",
    comment: "",
    questions: [
      { id: "l1", text: "Toma iniciativa diante de desafios e oportunidades", rating: null },
      { id: "l2", text: "Influencia positivamente o ambiente e a equipe", rating: null },
      { id: "l3", text: "Demonstra capacidade de tomar decisões com segurança", rating: null },
      { id: "l4", text: "Inspira e motiva outros colaboradores", rating: null },
    ],
  },
  {
    id: "culture",
    title: "Cultura & Comportamento",
    icon: "🤝",
    comment: "",
    questions: [
      { id: "cu1", text: "Age em conformidade com os valores da organização", rating: null },
      { id: "cu2", text: "Demonstra comprometimento e responsabilidade", rating: null },
      { id: "cu3", text: "Adapta-se bem a mudanças e novas situações", rating: null },
      { id: "cu4", text: "Mantém postura profissional e ética no trabalho", rating: null },
    ],
  },
];

const PerformanceEvaluation = () => {
  const [evaluatorInfo, setEvaluatorInfo] = useState({
    evaluatorName: "",
    employeeName: "",
    department: "",
    role: "",
    period: "",
  });

  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [generalComment, setGeneralComment] = useState("");

  const handleInfoChange = (field: string, value: string) => {
    setEvaluatorInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (categoryId: string, questionId: string, rating: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              questions: cat.questions.map((q) =>
                q.id === questionId ? { ...q, rating } : q
              ),
            }
          : cat
      )
    );
  };

  const handleCommentChange = (categoryId: string, comment: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, comment } : cat))
    );
  };

  const handleExport = () => {
    exportEvaluationToExcel(evaluatorInfo, categories, generalComment);
  };

  const totalQuestions = categories.flatMap((c) => c.questions).length;
  const answeredQuestions = categories.flatMap((c) => c.questions).filter((q) => q.rating !== null).length;
  const isComplete = answeredQuestions === totalQuestions;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-[var(--gradient-hero)] text-primary-foreground py-3 px-6 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold">Performance Review</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-primary-foreground/70">
            <div className="w-24 h-1.5 rounded-full bg-primary-foreground/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs">{answeredQuestions}/{totalQuestions}</span>
          </div>
          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isComplete
                ? "bg-accent text-accent-foreground hover:brightness-110 shadow-lg"
                : "bg-primary-foreground/10 text-primary-foreground/50 cursor-not-allowed"
            }`}
            disabled={!isComplete}
            title={!isComplete ? `Responda todas as ${totalQuestions} questões para exportar` : ""}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <EvaluationHeader evaluatorInfo={evaluatorInfo} onChange={handleInfoChange} />

        {categories.map((category, index) => (
          <EvaluationCategory
            key={category.id}
            category={category}
            categoryIndex={index}
            onRatingChange={(questionId, rating) => handleRatingChange(category.id, questionId, rating)}
            onCommentChange={(comment) => handleCommentChange(category.id, comment)}
          />
        ))}

        <EvaluationSummary
          categories={categories}
          generalComment={generalComment}
          onGeneralCommentChange={setGeneralComment}
        />

        {/* Export button bottom */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleExport}
            disabled={!isComplete}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200 shadow-[var(--shadow-elevated)] ${
              isComplete
                ? "bg-primary text-primary-foreground hover:brightness-110 hover:scale-105"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {isComplete
              ? "📥 Exportar Avaliação para Excel"
              : `Responda todas as questões (${answeredQuestions}/${totalQuestions})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceEvaluation;
