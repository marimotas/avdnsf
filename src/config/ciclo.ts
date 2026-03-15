import { supabase } from '@/integrations/supabase/client';

/** Fallback estático — usado enquanto a query ainda não retornou */
export const CICLO_FALLBACK = '2026.1';

/** Busca o ciclo com ativo=true no banco. Retorna o fallback se não encontrar. */
export async function fetchCicloAtivo(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('ciclos')
    .select('nome')
    .eq('ativo', true)
    .maybeSingle();
  return data?.nome ?? CICLO_FALLBACK;
}
