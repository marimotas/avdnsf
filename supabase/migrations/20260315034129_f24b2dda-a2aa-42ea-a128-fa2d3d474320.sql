
-- Corrigir política RLS: usar auth.email() em vez de subquery em auth.users
DROP POLICY IF EXISTS "Users can view received feedbacks" ON public.feedbacks;

CREATE POLICY "Users can view received feedbacks"
  ON public.feedbacks FOR SELECT
  USING (to_user_email = auth.email());
