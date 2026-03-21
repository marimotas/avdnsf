-- Remove demo policies that exposed all data to anonymous users

DROP POLICY IF EXISTS "Public anon can read feedbacks demo" ON public.feedbacks;
DROP POLICY IF EXISTS "Public anon can read declaracoes demo" ON public.declaracoes;
