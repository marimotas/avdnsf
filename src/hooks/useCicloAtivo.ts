import { useState, useEffect } from 'react';
import { fetchCicloAtivo, CICLO_FALLBACK } from '@/config/ciclo';

/**
 * Hook que retorna o ciclo ativo buscado do banco (tabela ciclos, ativo=true).
 * Enquanto carrega, retorna o fallback '2026.1'.
 */
export function useCicloAtivo(): { ciclo: string; loading: boolean } {
  const [ciclo, setCiclo] = useState<string>(CICLO_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCicloAtivo().then((nome) => {
      setCiclo(nome);
      setLoading(false);
    });
  }, []);

  return { ciclo, loading };
}
