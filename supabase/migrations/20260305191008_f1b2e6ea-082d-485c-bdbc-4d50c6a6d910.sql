
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===== USER ROLES (create first for has_role function) =====
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'GX' || UPPER(SUBSTRING(md5(NEW.id::text) FROM 1 FOR 6))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== DEPOSITS =====
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(18,2) NOT NULL,
  fee DECIMAL(18,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  network TEXT NOT NULL CHECK (network IN ('BEP-20', 'TRC-20')),
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all deposits" ON public.deposits FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update deposits" ON public.deposits FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON public.deposits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== WITHDRAWALS =====
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(18,2) NOT NULL,
  fee DECIMAL(18,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('BEP-20', 'TRC-20')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update withdrawals" ON public.withdrawals FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== REFERRAL EARNINGS =====
CREATE TABLE public.referral_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 4),
  deposit_id UUID REFERENCES public.deposits(id),
  amount DECIMAL(18,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referral earnings" ON public.referral_earnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all referral earnings" ON public.referral_earnings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ===== ROI PAYOUTS =====
CREATE TABLE public.roi_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(18,2) NOT NULL,
  for_month TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.roi_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roi payouts" ON public.roi_payouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roi payouts" ON public.roi_payouts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ===== WALLET ADDRESSES =====
CREATE TABLE public.wallet_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL UNIQUE CHECK (network IN ('BEP-20', 'TRC-20')),
  address TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view wallet addresses" ON public.wallet_addresses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage wallet addresses" ON public.wallet_addresses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_wallet_addresses_updated_at BEFORE UPDATE ON public.wallet_addresses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== PLATFORM SETTINGS =====
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view settings" ON public.platform_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('monthly_roi', '10'),
  ('min_investment', '100'),
  ('deposit_fee', '5'),
  ('withdrawal_fee', '5'),
  ('referral_level_1', '8'),
  ('referral_level_2', '4'),
  ('referral_level_3', '2'),
  ('referral_level_4', '1'),
  ('terms_and_conditions', 'Enter your terms and conditions here...'),
  ('privacy_policy', 'Enter your privacy policy here...');

-- Insert default wallet addresses
INSERT INTO public.wallet_addresses (network, address) VALUES
  ('BEP-20', '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38'),
  ('TRC-20', 'TLfVYMwLRz5G4QnNWWr2LhFX7xPGKd3vR5');

-- ===== BALANCE FUNCTION =====
CREATE OR REPLACE FUNCTION public.get_user_balance(p_user_id UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(
    (SELECT SUM(net_amount) FROM public.deposits WHERE user_id = p_user_id AND status = 'confirmed'), 0
  ) + COALESCE(
    (SELECT SUM(amount) FROM public.roi_payouts WHERE user_id = p_user_id), 0
  ) + COALESCE(
    (SELECT SUM(amount) FROM public.referral_earnings WHERE user_id = p_user_id), 0
  ) - COALESCE(
    (SELECT SUM(amount) FROM public.withdrawals WHERE user_id = p_user_id AND status IN ('approved', 'completed')), 0
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
