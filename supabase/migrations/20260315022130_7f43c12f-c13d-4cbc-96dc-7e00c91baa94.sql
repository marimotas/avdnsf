
-- Table to store each collaborator's declaration
CREATE TABLE public.declaracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  ciclo text NOT NULL DEFAULT '2026.1',
  declaracao text,
  metas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ciclo)
);

ALTER TABLE public.declaracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own declaracoes"
  ON public.declaracoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all declaracoes"
  ON public.declaracoes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own declaracao"
  ON public.declaracoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own declaracao"
  ON public.declaracoes FOR UPDATE
  USING (auth.uid() = user_id);

-- Table for admin to configure the open window per cycle
CREATE TABLE public.janela_declaracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo text NOT NULL UNIQUE DEFAULT '2026.1',
  data_abertura timestamptz NOT NULL,
  data_fechamento timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.janela_declaracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read janela"
  ON public.janela_declaracoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert janela"
  ON public.janela_declaracoes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update janela"
  ON public.janela_declaracoes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_declaracoes_updated_at
  BEFORE UPDATE ON public.declaracoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_janela_updated_at
  BEFORE UPDATE ON public.janela_declaracoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
