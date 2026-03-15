import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const respond = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify caller
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !user) return respond({ error: 'Não autorizado.' }, 401);

    // Must be admin
    const { data: roleRow } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    if (!roleRow) return respond({ error: 'Acesso negado. Apenas administradores.' }, 403);

    const body = await req.json();
    const { action, email, user_id } = body;

    // LIST
    if (action === 'list') {
      const { data: rows } = await supabaseAdmin.from('user_roles').select('id,user_id,role').eq('role', 'admin');
      if (!rows) return respond({ admins: [] });

      // Enrich with emails
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const userMap = new Map(listData?.users?.map(u => [u.id, u.email]) ?? []);
      const admins = rows.map(r => ({ id: r.id, user_id: r.user_id, email: userMap.get(r.user_id) ?? '' }));
      return respond({ admins });
    }

    // ADD
    if (action === 'add') {
      if (!email) return respond({ error: 'E-mail obrigatório.' }, 400);
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const target = listData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!target) return respond({ error: 'Usuário não encontrado. O colaborador precisa ter feito login ao menos uma vez.' }, 404);
      const { data: existing } = await supabaseAdmin.from('user_roles').select('id').eq('user_id', target.id).eq('role', 'admin').maybeSingle();
      if (existing) return respond({ error: 'Este usuário já é administrador.' }, 409);
      const { error: insertErr } = await supabaseAdmin.from('user_roles').insert({ user_id: target.id, role: 'admin' });
      if (insertErr) throw insertErr;
      return respond({ success: true });
    }

    // REMOVE
    if (action === 'remove') {
      if (!user_id) return respond({ error: 'user_id obrigatório.' }, 400);
      if (user_id === user.id) return respond({ error: 'Você não pode remover seu próprio acesso de administrador.' }, 400);
      const { error: delErr } = await supabaseAdmin.from('user_roles').delete().eq('user_id', user_id).eq('role', 'admin');
      if (delErr) throw delErr;
      return respond({ success: true });
    }

    return respond({ error: 'Ação inválida.' }, 400);

  } catch (err) {
    return respond({ error: String(err) }, 500);
  }
});
