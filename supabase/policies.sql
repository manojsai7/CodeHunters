-- =====================================================
-- Code Hunters - Supabase RLS Policies & SQL Functions
-- Run this in Supabase SQL Editor after Prisma migration
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_checkout_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Admin can read all profiles
CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- Auto-create profile on signup (via trigger)
-- Profile is auto-created on signup via service_role (bypasses RLS).
-- Users can only insert their own profile row.
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- COURSES
-- =====================================================

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true);

-- Admin can manage all courses
CREATE POLICY "Admin can manage courses"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- =====================================================
-- LESSONS
-- =====================================================

-- Anyone can view published lessons of published courses
CREATE POLICY "View published lessons"
  ON lessons FOR SELECT
  USING (
    is_published = true AND
    EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND is_published = true)
  );

-- Admin can manage lessons
CREATE POLICY "Admin can manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- =====================================================
-- LESSON PROGRESS
-- =====================================================

-- Users can read/write their own progress
CREATE POLICY "Users manage own progress"
  ON lesson_progress FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- PROJECTS
-- =====================================================

-- Anyone can view published projects
CREATE POLICY "Anyone can view published projects"
  ON projects FOR SELECT
  USING (is_published = true);

-- Admin can manage all projects
CREATE POLICY "Admin can manage projects"
  ON projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- =====================================================
-- PURCHASES
-- =====================================================

-- Users can view their own purchases
CREATE POLICY "Users view own purchases"
  ON purchases FOR SELECT
  USING (auth.uid()::text = user_id);

-- Service role can create/update purchases (via API)
-- NOTE: service_role already bypasses RLS. This policy is scoped to
-- authenticated users creating their own purchases only.
CREATE POLICY "Users can insert own purchases"
  ON purchases FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own purchases"
  ON purchases FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Admin can view all purchases
CREATE POLICY "Admin can view all purchases"
  ON purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- =====================================================
-- GUEST PURCHASES
-- =====================================================

-- Admin can view all guest purchases
CREATE POLICY "Admin can view guest purchases"
  ON guest_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- Guest purchases are managed exclusively via service_role (Prisma),
-- which bypasses RLS. No permissive policy needed for anon/authenticated.
CREATE POLICY "Admin can manage guest purchases"
  ON guest_purchases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- =====================================================
-- REFERRAL USES
-- =====================================================

-- Users can view their referrals (given and received)
CREATE POLICY "Users view own referrals"
  ON referral_uses FOR SELECT
  USING (
    auth.uid()::text = referrer_id OR auth.uid()::text = referred_id
  );

-- Referral uses are created via service_role (Prisma) which bypasses RLS.
-- Only allow authenticated users to insert referrals where they are the referred user.
CREATE POLICY "Users can create own referrals"
  ON referral_uses FOR INSERT
  WITH CHECK (auth.uid()::text = referred_id);

-- =====================================================
-- COUPONS
-- =====================================================

-- Anyone can read active coupons (for validation)
CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT
  USING (is_active = true);

-- Admin can manage coupons
CREATE POLICY "Admin can manage coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- =====================================================
-- PRE-CHECKOUT LEADS
-- =====================================================

-- Pre-checkout leads are inserted via service_role (Prisma) which bypasses RLS.
-- No permissive INSERT needed for anon/authenticated — deny by default.

-- Admin can view all leads
CREATE POLICY "Admin can view leads"
  ON pre_checkout_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- =====================================================
-- REVIEWS
-- =====================================================

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

-- Users can create reviews (must have purchased)
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id AND
    EXISTS (
      SELECT 1 FROM purchases
      WHERE purchases.user_id = auth.uid()::text
        AND purchases.course_id = reviews.course_id
        AND purchases.status = 'completed'
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Credit referral coins and auto-generate coupon
CREATE OR REPLACE FUNCTION credit_referral_coins(
  p_referrer_id TEXT,
  p_coins_to_add INT DEFAULT 15
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_coins INT;
  v_new_coins INT;
  v_coupon_code TEXT;
  v_result JSON;
BEGIN
  -- Get current coins
  SELECT gold_coins INTO v_current_coins
  FROM profiles
  WHERE user_id = p_referrer_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Add coins
  v_new_coins := v_current_coins + p_coins_to_add;

  UPDATE profiles
  SET gold_coins = v_new_coins
  WHERE user_id = p_referrer_id;

  -- Check if threshold reached for auto-coupon (80 coins)
  IF v_new_coins >= 80 AND v_current_coins < 80 THEN
    -- Generate unique coupon code
    v_coupon_code := 'GOLD-' || upper(substr(md5(random()::text), 1, 8));

    INSERT INTO coupons (id, code, discount_percent, max_uses, current_uses, is_active, created_at)
    VALUES (
      gen_random_uuid()::text,
      v_coupon_code,
      10,
      1,
      0,
      true,
      NOW()
    );

    -- Deduct coins
    UPDATE profiles
    SET gold_coins = v_new_coins - 80
    WHERE user_id = p_referrer_id;

    v_new_coins := v_new_coins - 80;

    RETURN json_build_object(
      'success', true,
      'new_coins', v_new_coins,
      'coupon_generated', true,
      'coupon_code', v_coupon_code
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'new_coins', v_new_coins,
    'coupon_generated', false
  );
END;
$$;

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  v_referral_code := 'CH-' || upper(substr(md5(NEW.id::text || random()::text), 1, 8));

  INSERT INTO profiles (user_id, name, email, role, gold_coins, is_student_verified, referral_code, created_at, updated_at)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user',
    0,
    false,
    v_referral_code,
    NOW(),
    NOW()
  );

  -- Handle referral code if provided during signup
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    UPDATE profiles
    SET referred_by = NEW.raw_user_meta_data->>'referral_code'
    WHERE user_id = NEW.id::text;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger: Auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function: Recompute course rating after review
CREATE OR REPLACE FUNCTION recompute_course_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg_rating FLOAT;
  v_total_reviews INT;
BEGIN
  SELECT AVG(rating)::FLOAT, COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM reviews
  WHERE course_id = COALESCE(NEW.course_id, OLD.course_id);

  UPDATE courses
  SET rating = COALESCE(v_avg_rating, 0),
      total_reviews = v_total_reviews
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);

  RETURN NEW;
END;
$$;

-- Trigger: Recompute rating on review changes
DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION recompute_course_rating();
