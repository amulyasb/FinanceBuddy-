-- ============================================================
-- Personal Business Transaction & Financial Management System
-- Supabase SQL Schema + RLS Policies
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- --------------------------
-- ACCOUNTS TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  opening_balance NUMERIC(15,2) DEFAULT 0 NOT NULL,
  current_balance NUMERIC(15,2) DEFAULT 0 NOT NULL,
  min_balance_threshold NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------
-- CATEGORIES TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('credit','debit')) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);

-- --------------------------
-- TRANSACTIONS TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('credit','debit')) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  remark TEXT,
  running_balance NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------
-- STATEMENTS TABLE
-- --------------------------
CREATE TABLE IF NOT EXISTS public.statements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  statement_number TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  opening_balance NUMERIC(15,2),
  closing_balance NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;

-- ACCOUNTS POLICIES
CREATE POLICY "accounts_select" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounts_insert" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts_update" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "accounts_delete" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- CATEGORIES POLICIES (user's own + system defaults)
CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (user_id = auth.uid() OR is_default = TRUE);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- TRANSACTIONS POLICIES
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- STATEMENTS POLICIES
CREATE POLICY "statements_select" ON public.statements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "statements_insert" ON public.statements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "statements_update" ON public.statements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "statements_delete" ON public.statements FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SEED DEFAULT CATEGORIES
-- (is_default = TRUE, user_id = NULL → available to all users)
-- ============================================================

INSERT INTO public.categories (name, type, is_default) VALUES
  -- Credit Categories
  ('Salary', 'credit', TRUE),
  ('Sales Revenue', 'credit', TRUE),
  ('Freelance Income', 'credit', TRUE),
  ('Interest Earned', 'credit', TRUE),
  ('Investment Returns', 'credit', TRUE),
  ('Loan Received', 'credit', TRUE),
  ('Other Income', 'credit', TRUE),
  -- Debit Categories
  ('Rent', 'debit', TRUE),
  ('Utilities', 'debit', TRUE),
  ('Food & Dining', 'debit', TRUE),
  ('Transport', 'debit', TRUE),
  ('Salary Paid', 'debit', TRUE),
  ('Office Supplies', 'debit', TRUE),
  ('Marketing', 'debit', TRUE),
  ('Loan Repayment', 'debit', TRUE),
  ('Miscellaneous', 'debit', TRUE);
