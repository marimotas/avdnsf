import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Verifica se a janela de um tipo específico está aberta hoje para o ciclo ativo.
 * Retorna { aberta: boolean, loading: boolean }
 */
export function useJanelaAtiva(tipo: string, ciclo: string | null): { aberta: boolean; loading: boolean } {
  const [aberta, setAberta] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ciclo) {
      setAberta(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('janela_declaracoes')
      .select('data_abertura,data_fechamento')
      .eq('ciclo', ciclo)
      .eq('tipo', tipo)
      .maybeSingle()
      .then(({ data }: { data: { data_abertura: string; data_fechamento: string } | null }) => {
        if (!data) {
          setAberta(false);
        } else {
          const hoje = new Date().toISOString().slice(0, 10);
          const abertura = data.data_abertura?.slice(0, 10) ?? '';
          const fechamento = data.data_fechamento?.slice(0, 10) ?? '';
          setAberta(!!(abertura && fechamento && hoje >= abertura && hoje <= fechamento));
        }
        setLoading(false);
      });
  }, [tipo, ciclo]);

  return { aberta, loading };
}
