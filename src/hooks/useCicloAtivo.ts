import { useState, useEffect } from 'react';
import { fetchCicloAtivo } from '@/config/ciclo';

/**
 * Hook que retorna o ciclo ativo buscado do banco (tabela ciclos, ativo=true).
 * Retorna null quando não há ciclo ativo.
 */
export function useCicloAtivo(): { ciclo: string | null; loading: boolean } {
  const [ciclo, setCiclo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCicloAtivo().then((nome) => {
      setCiclo(nome);
      setLoading(false);
    });
  }, []);

  return { ciclo, loading };
}
