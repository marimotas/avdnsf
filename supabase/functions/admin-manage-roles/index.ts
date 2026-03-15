import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: roleRow } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: 'Acesso negado. Apenas administradores.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { action, email, user_id } = await req.json();

    if (action === 'add') {
      if (!email) return new Response(JSON.stringify({ error: 'E-mail obrigatório.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      // Find user by email in auth.users
      const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (listErr) throw listErr;
      const target = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!target) return new Response(JSON.stringify({ error: 'Usuário não encontrado. O colaborador precisa ter feito login ao menos uma vez.' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      // Check if already admin
      const { data: existing } = await supabaseAdmin.from('user_roles').select('id').eq('user_id', target.id).eq('role', 'admin').maybeSingle();
      if (existing) return new Response(JSON.stringify({ error: 'Este usuário já é administrador.' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const { error: insertErr } = await supabaseAdmin.from('user_roles').insert({ user_id: target.id, role: 'admin' });
      if (insertErr) throw insertErr;

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'remove') {
      if (!user_id) return new Response(JSON.stringify({ error: 'user_id obrigatório.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (user_id === user.id) return new Response(JSON.stringify({ error: 'Você não pode remover seu próprio acesso de administrador.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const { error: delErr } = await supabaseAdmin.from('user_roles').delete().eq('user_id', user_id).eq('role', 'admin');
      if (delErr) throw delErr;

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Ação inválida.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
