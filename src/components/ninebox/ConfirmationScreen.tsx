interface ConfirmationScreenProps {
  colaboradorNome: string;
  onRestart: () => void;
}

const ConfirmationScreen = ({ colaboradorNome, onRestart }: ConfirmationScreenProps) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-8 animate-fade-in">
      {/* Check icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
      >
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ color: 'hsl(var(--success))' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Avaliação enviada!
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-md">
          Obrigado pela sua contribuição. Seu feedback é fundamental para o desenvolvimento de{' '}
          <span className="text-foreground font-semibold">{colaboradorNome}</span>.
        </p>
      </div>

      <button
        onClick={onRestart}
        className="mt-4 px-8 py-3 text-sm font-bold tracking-wide text-foreground border border-border rounded-[4px] hover:border-primary hover:text-primary transition-colors duration-200"
      >
        Fazer outra avaliação
      </button>
    </div>
  );
};

export default ConfirmationScreen;
