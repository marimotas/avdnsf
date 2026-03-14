interface EvaluationHeaderProps {
  evaluatorInfo: {
    evaluatorName: string;
    employeeName: string;
    department: string;
    role: string;
    period: string;
  };
  onChange: (field: string, value: string) => void;
}

const EvaluationHeader = ({ evaluatorInfo, onChange }: EvaluationHeaderProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border overflow-hidden">
      <div className="px-8 py-6 bg-[var(--gradient-hero)]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-primary-foreground/70 uppercase tracking-widest">Avaliação de Desempenho</span>
        </div>
        <h1 className="text-3xl font-bold text-primary-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Formulário de Avaliação
        </h1>
        <p className="text-primary-foreground/60 mt-1 text-sm">Preencha todos os campos com atenção e objetividade</p>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Nome do Avaliador", field: "evaluatorName", placeholder: "Seu nome completo" },
          { label: "Nome do Avaliado", field: "employeeName", placeholder: "Nome do colaborador" },
          { label: "Departamento", field: "department", placeholder: "Ex: Tecnologia, RH..." },
          { label: "Cargo do Avaliado", field: "role", placeholder: "Ex: Desenvolvedor, Analista..." },
          { label: "Período de Avaliação", field: "period", placeholder: "Ex: Jan/2025 – Jun/2025" },
        ].map(({ label, field, placeholder }) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
            <input
              type="text"
              value={evaluatorInfo[field as keyof typeof evaluatorInfo]}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationHeader;
