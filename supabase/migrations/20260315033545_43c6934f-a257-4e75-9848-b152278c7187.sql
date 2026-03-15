
-- Tabela de feedbacks
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  from_user_name TEXT NOT NULL,
  from_user_email TEXT NOT NULL,
  to_user_name TEXT NOT NULL,
  to_user_email TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  ciclo TEXT NOT NULL DEFAULT '2026.1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Usuário pode enviar feedback
CREATE POLICY "Users can insert own feedbacks"
  ON public.feedbacks FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Usuário pode ver feedbacks que enviou
CREATE POLICY "Users can view sent feedbacks"
  ON public.feedbacks FOR SELECT
  USING (auth.uid() = from_user_id);

-- Usuário pode ver feedbacks que recebeu (via email)
CREATE POLICY "Users can view received feedbacks"
  ON public.feedbacks FOR SELECT
  USING (
    to_user_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Admin pode ver todos
CREATE POLICY "Admins can view all feedbacks"
  ON public.feedbacks FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Índices
CREATE INDEX idx_feedbacks_from_user ON public.feedbacks(from_user_id);
CREATE INDEX idx_feedbacks_to_email ON public.feedbacks(to_user_email);
CREATE INDEX idx_feedbacks_ciclo ON public.feedbacks(ciclo);
