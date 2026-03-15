
-- Allow anon reads on declaracoes and feedbacks for demo mode (SSO disabled temporarily)
CREATE POLICY "Public anon can read declaracoes demo"
  ON public.declaracoes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public anon can read feedbacks demo"
  ON public.feedbacks FOR SELECT
  TO anon
  USING (true);
