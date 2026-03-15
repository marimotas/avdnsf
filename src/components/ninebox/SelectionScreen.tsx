import { useState } from 'react';
import { COLLABORATORS, type EvaluationState, type EvaluationType } from './types';

interface SelectionScreenProps {
  initial: EvaluationState;
  avaliadorNome: string;
  onContinue: (data: EvaluationState) => void;
}

const SelectionScreen = ({ initial, avaliadorNome, onContinue }: SelectionScreenProps) => {
  const [colaborador, setColaborador] = useState(initial.colaboradorNome);
  const [tipo, setTipo] = useState<EvaluationType | null>(initial.tipoAvaliador);
  const [error, setError] = useState('');

  const isValid = colaborador && tipo && colaborador !== avaliadorNome;

  const handleContinue = () => {
    if (colaborador === avaliadorNome) {
      setError('Você não pode avaliar a si mesmo.');
      return;
    }
    setError('');
    onContinue({
      ...initial,
      colaboradorNome: colaborador,
      avaliadorNome,
      tipoAvaliador: tipo,
    });
  };

  const handleColaboradorChange = (v: string) => {
    setColaborador(v);
    if (v && avaliadorNome && v === avaliadorNome) {
      setError('Você não pode avaliar a si mesmo.');
    } else {
      setError('');
    }
  };

  // Filter out the logged-in user from the list
  const collaboratorsToEvaluate = COLLABORATORS.filter(c => c !== avaliadorNome);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-foreground">
          Vamos falar de desempenho?
        </h2>
        <p className="text-muted-foreground text-sm">
          Preencha os campos abaixo para começar
        </p>
      </div>

      {/* Avaliador info */}
      <div className="border border-border rounded-[4px] px-4 py-3 flex items-center gap-3 bg-card">
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Avaliador</p>
          <p className="text-sm font-semibold text-foreground truncate">
            {avaliadorNome || <span className="text-muted-foreground/40 italic font-normal">Carregando...</span>}
          </p>
        </div>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)', color: '#4D94FF' }}
        >
          você
        </span>
      </div>

      {/* Selects */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Quem você está avaliando?
          </label>
          <select
            value={colaborador}
            onChange={(e) => handleColaboradorChange(e.target.value)}
            className="w-full bg-card border border-border rounded-[4px] px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="" disabled>Selecione o colaborador</option>
            {collaboratorsToEvaluate.map((c) => (
              <option key={c} value={c} style={{ background: '#0A0A0A' }}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      {/* Type cards */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Como você avalia?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Líder card */}
          <button
            onClick={() => setTipo('Líder')}
            className={`text-left p-5 rounded-lg border transition-all duration-200 ${
              tipo === 'Líder' ? 'border-primary' : 'border-border hover:border-primary/50'
            }`}
            style={tipo === 'Líder' ? { background: 'rgba(0,102,255,0.08)' } : { background: '#0A0A0A' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-bold text-foreground">Líder</span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${tipo === 'Líder' ? 'border-primary' : 'border-muted-foreground'}`}>
                {tipo === 'Líder' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sou o gestor direto. 10 perguntas no total.
            </p>
          </button>

          {/* Interação card */}
          <button
            onClick={() => setTipo('Interação')}
            className={`text-left p-5 rounded-lg border transition-all duration-200 ${
              tipo === 'Interação' ? 'border-foreground' : 'border-border hover:border-foreground/50'
            }`}
            style={tipo === 'Interação' ? { background: 'rgba(255,255,255,0.05)' } : { background: '#0A0A0A' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-bold text-foreground">Interação</span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${tipo === 'Interação' ? 'border-foreground' : 'border-muted-foreground'}`}>
                {tipo === 'Interação' && <div className="w-2 h-2 rounded-full bg-foreground" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Trabalho com esta pessoa e avalio o desempenho que observei nas nossas interações. 5 perguntas no total.
            </p>
          </button>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={!isValid}
        className="w-full py-4 text-sm font-bold tracking-widest uppercase rounded-lg transition-all duration-200"
        style={
          isValid
            ? { background: '#0066FF', color: '#fff', letterSpacing: '0.1em' }
            : { background: '#111111', color: '#444444', cursor: 'not-allowed' }
        }
      >
        Continuar →
      </button>
    </div>
  );
};

export default SelectionScreen;
