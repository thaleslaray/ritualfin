-- =============================================
-- 002-add-categories: seed default categories per couple
-- =============================================

-- Seed helper (idempotent)
CREATE OR REPLACE FUNCTION public.seed_default_categories_for_couple(_couple_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.categories (
    couple_id,
    key,
    display_name,
    display_name_normalized,
    is_active,
    sort_order,
    is_default
  )
  SELECT
    _couple_id,
    d.key,
    d.display_name,
    public.normalize_category_name(d.display_name),
    TRUE,
    d.sort_order,
    TRUE
  FROM (
    VALUES
      ('moradia', 'Moradia', 0),
      ('alimentacao', 'Alimentação', 1),
      ('transporte', 'Transporte', 2),
      ('saude', 'Saúde', 3),
      ('lazer', 'Lazer', 4),
      ('educacao', 'Educação', 5),
      ('vestuario', 'Vestuário', 6),
      ('outros', 'Outros', 7)
  ) AS d(key, display_name, sort_order)
  ON CONFLICT (couple_id, key) DO NOTHING;
END;
$$;

-- Backfill existing couples (idempotent)
WITH defaults AS (
  SELECT * FROM (
    VALUES
      ('moradia', 'Moradia', 0),
      ('alimentacao', 'Alimentação', 1),
      ('transporte', 'Transporte', 2),
      ('saude', 'Saúde', 3),
      ('lazer', 'Lazer', 4),
      ('educacao', 'Educação', 5),
      ('vestuario', 'Vestuário', 6),
      ('outros', 'Outros', 7)
  ) AS d(key, display_name, sort_order)
)
INSERT INTO public.categories (
  couple_id,
  key,
  display_name,
  display_name_normalized,
  is_active,
  sort_order,
  is_default
)
SELECT
  c.id,
  d.key,
  d.display_name,
  public.normalize_category_name(d.display_name),
  TRUE,
  d.sort_order,
  TRUE
FROM public.couples c
CROSS JOIN defaults d
ON CONFLICT (couple_id, key) DO NOTHING;

-- Ensure new couples also get defaults
CREATE OR REPLACE FUNCTION public.couples_seed_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.seed_default_categories_for_couple(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS couples_seed_default_categories_trigger ON public.couples;
CREATE TRIGGER couples_seed_default_categories_trigger
AFTER INSERT ON public.couples
FOR EACH ROW
EXECUTE FUNCTION public.couples_seed_default_categories();
