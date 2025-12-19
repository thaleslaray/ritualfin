-- Tabela principal de categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  display_name_normalized TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraints de unicidade
ALTER TABLE public.categories 
  ADD CONSTRAINT categories_couple_key_unique UNIQUE (couple_id, key);
ALTER TABLE public.categories 
  ADD CONSTRAINT categories_couple_name_unique UNIQUE (couple_id, display_name_normalized);

-- Índice para busca por casal + ativo
CREATE INDEX idx_categories_couple_active ON public.categories(couple_id, is_active);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy: usuários podem gerenciar categorias do próprio casal
CREATE POLICY "Users can manage own couple categories" ON public.categories
  FOR ALL
  USING (couple_id = get_user_couple_id(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão para cada casal existente
INSERT INTO public.categories (couple_id, key, display_name, display_name_normalized, is_default, sort_order)
SELECT 
  c.id,
  cat.key,
  cat.display_name,
  cat.display_name_normalized,
  true,
  cat.sort_order
FROM public.couples c
CROSS JOIN (VALUES 
  ('moradia', 'Moradia', 'moradia', 0),
  ('alimentacao', 'Alimentação', 'alimentacao', 1),
  ('transporte', 'Transporte', 'transporte', 2),
  ('saude', 'Saúde', 'saude', 3),
  ('vestuario', 'Vestuário', 'vestuario', 4),
  ('lazer', 'Lazer', 'lazer', 5),
  ('educacao', 'Educação', 'educacao', 6),
  ('outros', 'Outros', 'outros', 7)
) AS cat(key, display_name, display_name_normalized, sort_order);

-- Migrar strings legadas para keys em category_budgets
UPDATE public.category_budgets
SET category = CASE category
  WHEN 'Moradia' THEN 'moradia'
  WHEN 'Alimentação' THEN 'alimentacao'
  WHEN 'Transporte' THEN 'transporte'
  WHEN 'Saúde' THEN 'saude'
  WHEN 'Vestuário' THEN 'vestuario'
  WHEN 'Lazer' THEN 'lazer'
  WHEN 'Educação' THEN 'educacao'
  WHEN 'Outros' THEN 'outros'
  ELSE category
END
WHERE category IN ('Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Vestuário', 'Lazer', 'Educação', 'Outros');

-- Migrar strings legadas para keys em transactions
UPDATE public.transactions
SET category = CASE category
  WHEN 'Moradia' THEN 'moradia'
  WHEN 'Alimentação' THEN 'alimentacao'
  WHEN 'Transporte' THEN 'transporte'
  WHEN 'Saúde' THEN 'saude'
  WHEN 'Vestuário' THEN 'vestuario'
  WHEN 'Lazer' THEN 'lazer'
  WHEN 'Educação' THEN 'educacao'
  WHEN 'Outros' THEN 'outros'
  ELSE category
END
WHERE category IN ('Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Vestuário', 'Lazer', 'Educação', 'Outros');

-- Migrar strings legadas para keys em merchant_mappings
UPDATE public.merchant_mappings
SET category = CASE category
  WHEN 'Moradia' THEN 'moradia'
  WHEN 'Alimentação' THEN 'alimentacao'
  WHEN 'Transporte' THEN 'transporte'
  WHEN 'Saúde' THEN 'saude'
  WHEN 'Vestuário' THEN 'vestuario'
  WHEN 'Lazer' THEN 'lazer'
  WHEN 'Educação' THEN 'educacao'
  WHEN 'Outros' THEN 'outros'
  ELSE category
END
WHERE category IN ('Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Vestuário', 'Lazer', 'Educação', 'Outros');