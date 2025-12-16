-- =============================================
-- RITUAL FINANCEIRO DO CASAL - DATA MODEL
-- =============================================

-- 1. ENUM Types
CREATE TYPE public.app_role AS ENUM ('admin', 'partner');
CREATE TYPE public.transaction_source AS ENUM ('print', 'ofx', 'manual');
CREATE TYPE public.transaction_confidence AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.import_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- 2. Couples table (main entity)
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Profiles table (linked to auth.users and couples)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES public.couples(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User roles table (security - separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'partner',
  UNIQUE (user_id, role)
);

-- 5. Months table (budget periods)
CREATE TABLE public.months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  year_month TEXT NOT NULL, -- Format: YYYY-MM
  closed_at TIMESTAMPTZ,
  edited_after_close BOOLEAN DEFAULT false,
  cloned_from UUID REFERENCES public.months(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_id, year_month)
);

-- 6. Category budgets (8 fixed categories per month)
CREATE TABLE public.category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id UUID REFERENCES public.months(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  planned_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (month_id, category)
);

-- 7. Recurring bills (fixed expenses)
CREATE TABLE public.recurring_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Cards (credit cards with limits)
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  monthly_limit DECIMAL(12,2) NOT NULL DEFAULT 0,
  closing_day INTEGER CHECK (closing_day >= 1 AND closing_day <= 31),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Imports table (for idempotency)
CREATE TABLE public.imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  type transaction_source NOT NULL,
  file_name TEXT,
  file_hash TEXT, -- SHA256 for deduplication
  file_url TEXT,
  status import_status NOT NULL DEFAULT 'pending',
  transactions_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE (couple_id, file_hash)
);

-- 10. Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id UUID REFERENCES public.months(id) ON DELETE CASCADE NOT NULL,
  import_id UUID REFERENCES public.imports(id) ON DELETE SET NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  merchant TEXT NOT NULL,
  merchant_normalized TEXT, -- For deduplication
  amount DECIMAL(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  category TEXT,
  confidence transaction_confidence DEFAULT 'low',
  is_internal_transfer BOOLEAN DEFAULT false,
  is_card_payment BOOLEAN DEFAULT false,
  fingerprint TEXT, -- SHA256 for deduplication
  source transaction_source NOT NULL,
  raw_data JSONB,
  needs_review BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_profiles_couple ON public.profiles(couple_id);
CREATE INDEX idx_months_couple ON public.months(couple_id);
CREATE INDEX idx_transactions_month ON public.transactions(month_id);
CREATE INDEX idx_transactions_fingerprint ON public.transactions(fingerprint);
CREATE INDEX idx_transactions_needs_review ON public.transactions(needs_review) WHERE needs_review = true;
CREATE INDEX idx_imports_couple ON public.imports(couple_id);
CREATE INDEX idx_audit_logs_couple ON public.audit_logs(couple_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to check if user has role (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's couple_id
CREATE OR REPLACE FUNCTION public.get_user_couple_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT couple_id FROM public.profiles WHERE id = _user_id
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_couple_id UUID;
BEGIN
  -- Create a new couple for the user
  INSERT INTO public.couples (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'Meu Casal'))
  RETURNING id INTO new_couple_id;
  
  -- Create profile linked to the couple
  INSERT INTO public.profiles (id, email, full_name, couple_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    new_couple_id
  );
  
  -- Assign partner role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'partner');
  
  RETURN NEW;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps triggers
CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON public.couples
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_months_updated_at
  BEFORE UPDATE ON public.months
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_category_budgets_updated_at
  BEFORE UPDATE ON public.category_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_bills_updated_at
  BEFORE UPDATE ON public.recurring_bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Couples policies
CREATE POLICY "Users can view own couple"
  ON public.couples FOR SELECT
  USING (id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can update own couple"
  ON public.couples FOR UPDATE
  USING (id = public.get_user_couple_id(auth.uid()));

-- Profiles policies
CREATE POLICY "Users can view profiles in same couple"
  ON public.profiles FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()) OR id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Months policies
CREATE POLICY "Users can view own couple months"
  ON public.months FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can insert months for own couple"
  ON public.months FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can update own couple months"
  ON public.months FOR UPDATE
  USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can delete own couple months"
  ON public.months FOR DELETE
  USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Category budgets policies
CREATE POLICY "Users can manage category budgets"
  ON public.category_budgets FOR ALL
  USING (
    month_id IN (
      SELECT id FROM public.months 
      WHERE couple_id = public.get_user_couple_id(auth.uid())
    )
  );

-- Recurring bills policies
CREATE POLICY "Users can manage recurring bills"
  ON public.recurring_bills FOR ALL
  USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Cards policies
CREATE POLICY "Users can manage cards"
  ON public.cards FOR ALL
  USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Imports policies
CREATE POLICY "Users can manage imports"
  ON public.imports FOR ALL
  USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Transactions policies
CREATE POLICY "Users can manage transactions"
  ON public.transactions FOR ALL
  USING (
    month_id IN (
      SELECT id FROM public.months 
      WHERE couple_id = public.get_user_couple_id(auth.uid())
    )
  );

-- Audit logs policies
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (couple_id = public.get_user_couple_id(auth.uid()));

CREATE POLICY "Users can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));