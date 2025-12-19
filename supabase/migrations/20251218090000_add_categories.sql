-- =============================================
-- 002-add-categories: categories table + RLS + normalization
-- =============================================

-- Table: categories (per couple)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  display_name_normalized TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_id, key),
  UNIQUE (couple_id, display_name_normalized)
);

CREATE INDEX IF NOT EXISTS idx_categories_couple ON public.categories(couple_id);
CREATE INDEX IF NOT EXISTS idx_categories_couple_sort ON public.categories(couple_id, sort_order);

-- Normalization helper for name uniqueness (DB-side)
CREATE OR REPLACE FUNCTION public.normalize_category_name(input TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(
    btrim(
      lower(
        translate(
          coalesce(input, ''),
          'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇç',
          'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCc'
        )
      )
    ),
    '\\s+',
    ' ',
    'g'
  )
$$;

-- Keep normalized column consistent
CREATE OR REPLACE FUNCTION public.categories_set_normalized()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.display_name_normalized := public.normalize_category_name(NEW.display_name);

  IF NEW.key IS NULL OR btrim(NEW.key) = '' THEN
    RAISE EXCEPTION 'CATEGORY_KEY_REQUIRED';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS categories_set_normalized_trigger ON public.categories;
CREATE TRIGGER categories_set_normalized_trigger
BEFORE INSERT OR UPDATE OF display_name, key ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.categories_set_normalized();

-- Prevent updating the immutable key
CREATE OR REPLACE FUNCTION public.categories_prevent_key_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.key IS DISTINCT FROM OLD.key THEN
    RAISE EXCEPTION 'CATEGORY_KEY_IMMUTABLE';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS categories_prevent_key_update_trigger ON public.categories;
CREATE TRIGGER categories_prevent_key_update_trigger
BEFORE UPDATE OF key ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.categories_prevent_key_update();

-- Prevent deleting categories that are in use (budgets or transactions)
CREATE OR REPLACE FUNCTION public.categories_prevent_delete_if_in_use()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  in_use BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.category_budgets cb
    JOIN public.months m ON m.id = cb.month_id
    WHERE m.couple_id = OLD.couple_id
      AND cb.category = OLD.key
  ) OR EXISTS (
    SELECT 1
    FROM public.transactions t
    JOIN public.months m ON m.id = t.month_id
    WHERE m.couple_id = OLD.couple_id
      AND t.category = OLD.key
  )
  INTO in_use;

  IF in_use THEN
    RAISE EXCEPTION 'CATEGORY_IN_USE';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS categories_prevent_delete_if_in_use_trigger ON public.categories;
CREATE TRIGGER categories_prevent_delete_if_in_use_trigger
BEFORE DELETE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.categories_prevent_delete_if_in_use();

-- updated_at trigger
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own couple categories" ON public.categories;
CREATE POLICY "Users can view own couple categories"
  ON public.categories FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own couple categories" ON public.categories;
CREATE POLICY "Users can insert own couple categories"
  ON public.categories FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update own couple categories" ON public.categories;
CREATE POLICY "Users can update own couple categories"
  ON public.categories FOR UPDATE
  USING (couple_id = public.get_user_couple_id(auth.uid()));

DROP POLICY IF EXISTS "Users can delete own couple categories" ON public.categories;
CREATE POLICY "Users can delete own couple categories"
  ON public.categories FOR DELETE
  USING (couple_id = public.get_user_couple_id(auth.uid()));
