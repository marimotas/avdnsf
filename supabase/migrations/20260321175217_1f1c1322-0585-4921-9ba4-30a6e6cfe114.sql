
CREATE TABLE public.calibracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_nome TEXT NOT NULL,
  ciclo TEXT NOT NULL DEFAULT '2026.1',
  desempenho_nivel TEXT NOT NULL,
  potencial_nivel TEXT NOT NULL,
  nota_final NUMERIC(3,1),
  justificativa TEXT,
  calibrado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(colaborador_nome, ciclo)
);

ALTER TABLE public.calibracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_full_access" ON public.calibracoes
  FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "lideranca_can_view" ON public.calibracoes
  FOR SELECT
  TO public
  USING (has_role(auth.uid(), 'lideranca'::app_role));

CREATE TRIGGER update_calibracoes_updated_at
  BEFORE UPDATE ON public.calibracoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
