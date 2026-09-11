create extension if not exists pgcrypto;

CREATE TYPE app_role AS ENUM ('admin', 'compliance', 'analyst', 'player');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role app_role DEFAULT 'player'::app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins manage all profiles"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE TABLE public.wagers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  payout NUMERIC(12, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wagers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players view own wagers"
  ON public.wagers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff view all wagers"
  ON public.wagers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'compliance', 'analyst')
    )
  );
