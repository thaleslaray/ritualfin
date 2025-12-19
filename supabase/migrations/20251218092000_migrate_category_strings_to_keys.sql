-- =============================================
-- 002-add-categories: migrate legacy category strings -> categories.key
-- =============================================

-- Map legacy PT-BR labels (case/accents/spaces-insensitive) to canonical keys
WITH category_map AS (
  SELECT * FROM (
    VALUES
      ('moradia', 'moradia'),
      ('alimentacao', 'alimentacao'),
      ('transporte', 'transporte'),
      ('saude', 'saude'),
      ('lazer', 'lazer'),
      ('educacao', 'educacao'),
      ('vestuario', 'vestuario'),
      ('outros', 'outros')
  ) AS m(key, normalized)
)
UPDATE public.category_budgets cb
SET category = m.key
FROM category_map m
WHERE public.normalize_category_name(cb.category) = m.normalized;

WITH category_map AS (
  SELECT * FROM (
    VALUES
      ('moradia', 'moradia'),
      ('alimentacao', 'alimentacao'),
      ('transporte', 'transporte'),
      ('saude', 'saude'),
      ('lazer', 'lazer'),
      ('educacao', 'educacao'),
      ('vestuario', 'vestuario'),
      ('outros', 'outros')
  ) AS m(key, normalized)
)
UPDATE public.transactions t
SET category = m.key
FROM category_map m
WHERE t.category IS NOT NULL
  AND public.normalize_category_name(t.category) = m.normalized;

WITH category_map AS (
  SELECT * FROM (
    VALUES
      ('moradia', 'moradia'),
      ('alimentacao', 'alimentacao'),
      ('transporte', 'transporte'),
      ('saude', 'saude'),
      ('lazer', 'lazer'),
      ('educacao', 'educacao'),
      ('vestuario', 'vestuario'),
      ('outros', 'outros')
  ) AS m(key, normalized)
)
UPDATE public.merchant_mappings mm
SET category = m.key
FROM category_map m
WHERE mm.category IS NOT NULL
  AND public.normalize_category_name(mm.category) = m.normalized;
