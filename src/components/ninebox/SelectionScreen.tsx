import { useState } from 'react';
import { COLLABORATORS, type EvaluationState, type EvaluationType } from './types';

interface SelectionScreenProps {
  initial: EvaluationState;
  onContinue: (data: EvaluationState) => void;
}

const SelectionScreen = ({ initial, onContinue }: SelectionScreenProps) => {
  const [colaborador, setColaborador] = useState(initial.colaboradorNome);
  const [avaliador, setAvaliador] = useState(initial.avaliadorNome);
  const [tipo, setTipo] = useState<EvaluationType | null>(initial.tipoAvaliador);
  const [error, setError] = useState('');

  const isValid = colaborador && avaliador && tipo && colaborador !== avaliador;

  const handleContinue = () => {
    if (colaborador === avaliador) {
      setError('O avaliador não pode ser a mesma pessoa que o colaborador avaliado.');
      return;
    }
    setError('');
    onContinue({
      ...initial,
      colaboradorNome: colaborador,
      avaliadorNome: avaliador,
      tipoAvaliador: tipo,
    });
  };

  const handleColaboradorChange = (v: string) => {
    setColaborador(v);
    if (v && avaliador && v === avaliador) {
      setError('O avaliador não pode ser a mesma pessoa que o colaborador avaliado.');
    } else {
      setError('');
    }
  };

  const handleAvaliadorChange = (v: string) => {
    setAvaliador(v);
    if (colaborador && v && colaborador === v) {
      setError('O avaliador não pode ser a mesma pessoa que o colaborador avaliado.');
    } else {
      setError('');
    }
  };

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

      {/* Selects */}
      <div className="space-y-4">
        {/* Avaliador – read-only, from Google */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Seu nome
          </label>
          <div
            className="w-full border border-border rounded-[4px] px-4 py-3 text-sm text-foreground flex items-center gap-2"
            style={{ background: '#0A0A0A' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0" style={{ color: 'hsl(var(--text-dim))' }}>
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="currentColor"/>
            </svg>
            <span>{avaliador || '—'}</span>
            <span className="ml-auto text-xs" style={{ color: 'hsl(var(--text-dim))' }}>via Google</span>
          </div>
        </div>

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
            {COLLABORATORS.filter((c) => c !== avaliador).map((c) => (
              <option key={c} value={c} style={{ background: '#0A0A0A' }}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm font-medium" style={{ color: 'hsl(0 72% 51%)' }}>
          {error}
        </p>
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
              tipo === 'Líder'
                ? 'border-primary'
                : 'border-border hover:border-primary/50'
            }`}
            style={
              tipo === 'Líder'
                ? { background: 'rgba(0,102,255,0.08)' }
                : { background: '#0A0A0A' }
            }
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-bold text-foreground">Líder</span>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  tipo === 'Líder' ? 'border-primary' : 'border-muted-foreground'
                }`}
              >
                {tipo === 'Líder' && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
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
              tipo === 'Interação'
                ? 'border-foreground'
                : 'border-border hover:border-foreground/50'
            }`}
            style={
              tipo === 'Interação'
                ? { background: 'rgba(255,255,255,0.05)' }
                : { background: '#0A0A0A' }
            }
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-bold text-foreground">Interação</span>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  tipo === 'Interação' ? 'border-foreground' : 'border-muted-foreground'
                }`}
              >
                {tipo === 'Interação' && (
                  <div className="w-2 h-2 rounded-full bg-foreground" />
                )}
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
