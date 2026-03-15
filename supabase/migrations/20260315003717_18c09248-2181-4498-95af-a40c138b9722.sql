
-- Adicionar CHECK constraint no tipo_avaliador
ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_tipo_avaliador_check
  CHECK (tipo_avaliador IN ('Líder', 'Interação'));

-- Adicionar CHECK constraints nas notas D1–D5
ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_d1_check CHECK (d1 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_d2_check CHECK (d2 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_d3_check CHECK (d3 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_d4_check CHECK (d4 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_d5_check CHECK (d5 BETWEEN 1 AND 5);

-- Adicionar CHECK constraints nas notas P1–P5
ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_p1_check CHECK (p1 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_p2_check CHECK (p2 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_p3_check CHECK (p3 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_p4_check CHECK (p4 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_p5_check CHECK (p5 BETWEEN 1 AND 5);

-- Adicionar CHECK constraints nas notas I1–I5
ALTER TABLE public.avaliacoes
  ADD CONSTRAINT avaliacoes_i1_check CHECK (i1 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_i2_check CHECK (i2 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_i3_check CHECK (i3 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_i4_check CHECK (i4 BETWEEN 1 AND 5),
  ADD CONSTRAINT avaliacoes_i5_check CHECK (i5 BETWEEN 1 AND 5);
