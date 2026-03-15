-- 1. Add 'lideranca' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lideranca';

-- 2. Create equipes table (maps a leader to their team members)
CREATE TABLE IF NOT EXISTS public.equipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lider_user_id UUID NOT NULL,
  lider_nome TEXT NOT NULL DEFAULT '',
  lider_email TEXT NOT NULL DEFAULT '',
  colaborador_nome TEXT NOT NULL,
  colaborador_email TEXT NOT NULL DEFAULT '',
  ciclo TEXT NOT NULL DEFAULT '2026.1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (lider_user_id, colaborador_nome, ciclo)
);

-- 3. Enable RLS
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;

-- 4. Admins can do everything
CREATE POLICY "Admins can manage equipes"
  ON public.equipes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Leaders can view and manage their own team
CREATE POLICY "Lideres can view own equipe"
  ON public.equipes FOR SELECT
  USING (auth.uid() = lider_user_id);

-- 6. Auto-update updated_at
CREATE TRIGGER update_equipes_updated_at
  BEFORE UPDATE ON public.equipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();