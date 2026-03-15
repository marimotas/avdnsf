-- Add 'tipo' column to janela_declaracoes to support multiple field windows
ALTER TABLE public.janela_declaracoes 
ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'declaracao_expectativas';

-- Update existing rows to have the default tipo
UPDATE public.janela_declaracoes SET tipo = 'declaracao_expectativas' WHERE tipo = 'declaracao_expectativas';

-- Drop old unique constraint on ciclo if any, then add unique on (ciclo, tipo)
ALTER TABLE public.janela_declaracoes
DROP CONSTRAINT IF EXISTS janela_declaracoes_ciclo_tipo_key;

ALTER TABLE public.janela_declaracoes
ADD CONSTRAINT janela_declaracoes_ciclo_tipo_key UNIQUE (ciclo, tipo);