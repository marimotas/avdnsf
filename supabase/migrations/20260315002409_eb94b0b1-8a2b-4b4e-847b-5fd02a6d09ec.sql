
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz DEFAULT now(),
  colaborador_nome text NOT NULL,
  avaliador_nome   text NOT NULL,
  tipo_avaliador   text NOT NULL,
  d1 int2, d2 int2, d3 int2, d4 int2, d5 int2,
  p1 int2, p2 int2, p3 int2, p4 int2, p5 int2,
  i1 int2, i2 int2, i3 int2, i4 int2, i5 int2,
  comentario text
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on avaliacoes"
  ON public.avaliacoes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public select on avaliacoes"
  ON public.avaliacoes
  FOR SELECT
  TO anon, authenticated
  USING (true);
