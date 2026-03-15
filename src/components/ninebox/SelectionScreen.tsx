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
        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">
          Vamos falar de desempenho?
        </h2>
        <p className="text-muted-foreground text-sm">
          Preencha os campos abaixo para começar
        </p>
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
            {COLLABORATORS.map((c) => (
              <option key={c} value={c} style={{ background: '#0A0A0A' }}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Qual é o seu nome?
          </label>
          <select
            value={avaliador}
            onChange={(e) => handleAvaliadorChange(e.target.value)}
            className="w-full bg-card border border-border rounded-[4px] px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="" disabled>Selecione seu nome</option>
            {COLLABORATORS.map((c) => (
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

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Type cards */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Tipo de avaliação
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Líder card */}
          <button
            onClick={() => setTipo('Líder')}
            className={`text-left p-5 rounded-[4px] border transition-all duration-200 ${
              tipo === 'Líder'
                ? 'border-primary'
                : 'border-border hover:border-primary'
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
            className={`text-left p-5 rounded-[4px] border transition-all duration-200 ${
              tipo === 'Interação'
                ? 'border-foreground'
                : 'border-border hover:border-foreground'
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
              Trabalho com esta pessoa e avalio o desempenho que observei nas nossas interações (5 perguntas).
            </p>
          </button>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={!isValid}
        className="w-full py-4 text-sm font-bold tracking-wide rounded-[4px] transition-all duration-200"
        style={
          isValid
            ? { background: '#0066FF', color: '#fff' }
            : { background: '#111111', color: '#444444', cursor: 'not-allowed' }
        }
      >
        Continuar para as perguntas →
      </button>
    </div>
  );
};

export default SelectionScreen;
