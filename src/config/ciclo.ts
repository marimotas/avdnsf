import { supabase } from '@/integrations/supabase/client';

/** Fallback estático — usado apenas como valor inicial de display, não para controle de acesso */
export const CICLO_FALLBACK = '2026.1';

/** Busca o ciclo com ativo=true no banco. Retorna null se não houver ciclo ativo. */
export async function fetchCicloAtivo(): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('ciclos')
    .select('nome')
    .eq('ativo', true)
    .maybeSingle();
  return data?.nome ?? null;
}
