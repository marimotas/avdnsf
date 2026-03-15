
-- 1. Create ciclos table to track active cycles
CREATE TABLE public.ciclos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  criado_por uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ciclos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ciclos"
  ON public.ciclos
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can read ciclos"
  ON public.ciclos
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default cycle 2026.1
INSERT INTO public.ciclos (nome, ativo) VALUES ('2026.1', true);

-- 2. Add ciclo column to avaliacoes table
ALTER TABLE public.avaliacoes
  ADD COLUMN ciclo text NOT NULL DEFAULT '2026.1';

-- Index for filtering by ciclo
CREATE INDEX idx_avaliacoes_ciclo ON public.avaliacoes (ciclo);
