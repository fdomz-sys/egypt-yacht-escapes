-- ====================================================
-- PHASE 1: DATABASE SCHEMA FOR YACHT BOOKING PLATFORM
-- ====================================================

-- 1. Create role enum for user roles
CREATE TYPE public.app_role AS ENUM ('guest', 'owner', 'staff', 'admin');

-- 2. Create location enum
CREATE TYPE public.location_type AS ENUM ('marsa-matruh', 'north-coast', 'alexandria', 'el-gouna');

-- 3. Create activity type enum
CREATE TYPE public.activity_type AS ENUM ('private-yacht', 'shared-trip', 'jet-ski', 'speed-boat', 'catamaran');

-- 4. Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'boarded');

-- ====================================================
-- USER PROFILES TABLE
-- ====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- USER ROLES TABLE (Separate for security)
-- ====================================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'guest',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- YACHTS TABLE
-- ====================================================
CREATE TABLE public.yachts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    type activity_type NOT NULL DEFAULT 'private-yacht',
    location location_type NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    price_per_person DECIMAL(10,2) NOT NULL CHECK (price_per_person >= 0),
    price_per_hour DECIMAL(10,2) NOT NULL CHECK (price_per_hour >= 0),
    description TEXT,
    description_ar TEXT,
    amenities TEXT[] DEFAULT '{}',
    included TEXT[] DEFAULT '{}',
    image_urls TEXT[] DEFAULT '{}',
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.yachts ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- AVAILABILITY TABLE
-- ====================================================
CREATE TABLE public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    yacht_id UUID REFERENCES public.yachts(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    slots_remaining INTEGER NOT NULL CHECK (slots_remaining >= 0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (yacht_id, date)
);

-- Enable RLS
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- BOOKINGS TABLE
-- ====================================================
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    yacht_id UUID REFERENCES public.yachts(id) ON DELETE SET NULL NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    seats INTEGER NOT NULL CHECK (seats > 0),
    subtotal DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('online', 'cash')),
    status booking_status DEFAULT 'pending' NOT NULL,
    qr_code_data TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- SCANS TABLE (For QR code scanning by staff)
-- ====================================================
CREATE TABLE public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    scanned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    notes TEXT
);

-- Enable RLS
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- HELPER FUNCTIONS (Security Definer for RLS)
-- ====================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'admin')
$$;

-- Check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'owner')
$$;

-- Check if user is staff
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'staff')
$$;

-- Check if user owns a yacht
CREATE OR REPLACE FUNCTION public.owns_yacht(_user_id UUID, _yacht_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.yachts
        WHERE id = _yacht_id AND owner_id = _user_id
    )
$$;

-- Generate booking reference
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := 'SEA-';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- ====================================================
-- RLS POLICIES
-- ====================================================

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_staff(auth.uid()));

-- USER ROLES POLICIES
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin(auth.uid()));

-- YACHTS POLICIES
CREATE POLICY "Anyone can view available yachts"
    ON public.yachts FOR SELECT
    USING (is_available = true);

CREATE POLICY "Owners can view their own yachts"
    ON public.yachts FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Owners can create yachts"
    ON public.yachts FOR INSERT
    WITH CHECK (
        owner_id = auth.uid() AND public.is_owner(auth.uid())
    );

CREATE POLICY "Owners can update own yachts"
    ON public.yachts FOR UPDATE
    USING (owner_id = auth.uid() AND public.is_owner(auth.uid()));

CREATE POLICY "Owners can delete own yachts"
    ON public.yachts FOR DELETE
    USING (owner_id = auth.uid() AND public.is_owner(auth.uid()));

CREATE POLICY "Admins can manage all yachts"
    ON public.yachts FOR ALL
    USING (public.is_admin(auth.uid()));

-- AVAILABILITY POLICIES
CREATE POLICY "Anyone can view availability"
    ON public.availability FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage availability"
    ON public.availability FOR ALL
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Owners can manage own yacht availability"
    ON public.availability FOR ALL
    USING (public.owns_yacht(auth.uid(), yacht_id));

-- BOOKINGS POLICIES
CREATE POLICY "Users can view own bookings"
    ON public.bookings FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending bookings"
    ON public.bookings FOR UPDATE
    USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Owners can view bookings for their yachts"
    ON public.bookings FOR SELECT
    USING (public.owns_yacht(auth.uid(), yacht_id));

CREATE POLICY "Staff can view all bookings"
    ON public.bookings FOR SELECT
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update booking status"
    ON public.bookings FOR UPDATE
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage all bookings"
    ON public.bookings FOR ALL
    USING (public.is_admin(auth.uid()));

-- SCANS POLICIES
CREATE POLICY "Staff can create scans"
    ON public.scans FOR INSERT
    WITH CHECK (staff_id = auth.uid() AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can view scans"
    ON public.scans FOR SELECT
    USING (public.is_staff(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all scans"
    ON public.scans FOR ALL
    USING (public.is_admin(auth.uid()));

-- ====================================================
-- TRIGGERS
-- ====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yachts_updated_at
    BEFORE UPDATE ON public.yachts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON public.availability
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- Auto-assign guest role to new users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'guest');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- BOOKING FUNCTION (Atomic with availability check)
-- ====================================================
CREATE OR REPLACE FUNCTION public.create_booking(
    p_yacht_id UUID,
    p_date DATE,
    p_time_slot TEXT,
    p_seats INTEGER,
    p_payment_method TEXT
)
RETURNS TABLE (
    booking_id UUID,
    booking_reference TEXT,
    success BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_yacht RECORD;
    v_availability RECORD;
    v_booking_ref TEXT;
    v_booking_id UUID;
    v_subtotal DECIMAL(10,2);
    v_platform_fee DECIMAL(10,2);
    v_total DECIMAL(10,2);
    v_qr_data TEXT;
BEGIN
    -- Get yacht info
    SELECT * INTO v_yacht FROM public.yachts WHERE id = p_yacht_id AND is_available = true;
    
    IF v_yacht IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false, 'Yacht not found or unavailable';
        RETURN;
    END IF;
    
    -- Check capacity
    IF p_seats > v_yacht.capacity THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false, 'Requested seats exceed yacht capacity';
        RETURN;
    END IF;
    
    -- Get or create availability record
    SELECT * INTO v_availability 
    FROM public.availability 
    WHERE yacht_id = p_yacht_id AND date = p_date
    FOR UPDATE; -- Lock row for update
    
    IF v_availability IS NULL THEN
        -- Create availability with yacht capacity
        INSERT INTO public.availability (yacht_id, date, slots_remaining)
        VALUES (p_yacht_id, p_date, v_yacht.capacity)
        RETURNING * INTO v_availability;
    END IF;
    
    -- Check if enough slots available
    IF v_availability.slots_remaining < p_seats THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false, 'Not enough slots available for selected date';
        RETURN;
    END IF;
    
    -- Calculate prices
    v_subtotal := v_yacht.price_per_person * p_seats;
    v_platform_fee := ROUND(v_subtotal * 0.05, 2);
    v_total := v_subtotal + v_platform_fee;
    
    -- Generate unique booking reference
    LOOP
        v_booking_ref := public.generate_booking_reference();
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.bookings WHERE booking_reference = v_booking_ref);
    END LOOP;
    
    -- Generate QR code data
    v_qr_data := 'SEASCAPE:' || v_booking_ref || ':' || encode(gen_random_bytes(8), 'hex');
    
    -- Create booking
    INSERT INTO public.bookings (
        booking_reference,
        user_id,
        yacht_id,
        date,
        time_slot,
        seats,
        subtotal,
        platform_fee,
        total_price,
        payment_method,
        status,
        qr_code_data
    ) VALUES (
        v_booking_ref,
        auth.uid(),
        p_yacht_id,
        p_date,
        p_time_slot,
        p_seats,
        v_subtotal,
        v_platform_fee,
        v_total,
        p_payment_method,
        'confirmed',
        v_qr_data
    ) RETURNING id INTO v_booking_id;
    
    -- Decrement availability
    UPDATE public.availability
    SET slots_remaining = slots_remaining - p_seats
    WHERE id = v_availability.id;
    
    RETURN QUERY SELECT v_booking_id, v_booking_ref, true, NULL::TEXT;
END;
$$;

-- ====================================================
-- CANCEL BOOKING FUNCTION
-- ====================================================
CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking RECORD;
BEGIN
    -- Get booking
    SELECT * INTO v_booking 
    FROM public.bookings 
    WHERE id = p_booking_id 
    AND (user_id = auth.uid() OR public.is_admin(auth.uid()))
    FOR UPDATE;
    
    IF v_booking IS NULL THEN
        RETURN QUERY SELECT false, 'Booking not found or unauthorized';
        RETURN;
    END IF;
    
    IF v_booking.status = 'cancelled' THEN
        RETURN QUERY SELECT false, 'Booking is already cancelled';
        RETURN;
    END IF;
    
    IF v_booking.status = 'boarded' THEN
        RETURN QUERY SELECT false, 'Cannot cancel a completed booking';
        RETURN;
    END IF;
    
    -- Update booking status
    UPDATE public.bookings SET status = 'cancelled' WHERE id = p_booking_id;
    
    -- Restore availability
    UPDATE public.availability
    SET slots_remaining = slots_remaining + v_booking.seats
    WHERE yacht_id = v_booking.yacht_id AND date = v_booking.date;
    
    RETURN QUERY SELECT true, NULL::TEXT;
END;
$$;

-- ====================================================
-- SCAN BOOKING FUNCTION (For staff)
-- ====================================================
CREATE OR REPLACE FUNCTION public.scan_booking(p_qr_code_data TEXT)
RETURNS TABLE (
    success BOOLEAN,
    error_message TEXT,
    booking_info JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking RECORD;
    v_yacht RECORD;
    v_guest RECORD;
BEGIN
    -- Check if caller is staff
    IF NOT public.is_staff(auth.uid()) AND NOT public.is_admin(auth.uid()) THEN
        RETURN QUERY SELECT false, 'Unauthorized: Staff access required', NULL::JSONB;
        RETURN;
    END IF;
    
    -- Find booking by QR code
    SELECT b.*, p.name as guest_name, p.email as guest_email, p.phone as guest_phone
    INTO v_booking
    FROM public.bookings b
    JOIN public.profiles p ON b.user_id = p.id
    WHERE b.qr_code_data = p_qr_code_data
    FOR UPDATE;
    
    IF v_booking IS NULL THEN
        RETURN QUERY SELECT false, 'Invalid QR code', NULL::JSONB;
        RETURN;
    END IF;
    
    -- Get yacht info
    SELECT * INTO v_yacht FROM public.yachts WHERE id = v_booking.yacht_id;
    
    -- Check booking status
    IF v_booking.status = 'boarded' THEN
        RETURN QUERY SELECT false, 'Already boarded', jsonb_build_object(
            'booking_reference', v_booking.booking_reference,
            'guest_name', v_booking.guest_name,
            'yacht_name', v_yacht.name,
            'status', v_booking.status
        );
        RETURN;
    END IF;
    
    IF v_booking.status = 'cancelled' THEN
        RETURN QUERY SELECT false, 'Booking was cancelled', NULL::JSONB;
        RETURN;
    END IF;
    
    IF v_booking.status != 'confirmed' THEN
        RETURN QUERY SELECT false, 'Booking not confirmed', NULL::JSONB;
        RETURN;
    END IF;
    
    -- Update booking to boarded
    UPDATE public.bookings SET status = 'boarded' WHERE id = v_booking.id;
    
    -- Record scan
    INSERT INTO public.scans (booking_id, staff_id)
    VALUES (v_booking.id, auth.uid());
    
    RETURN QUERY SELECT true, NULL::TEXT, jsonb_build_object(
        'booking_id', v_booking.id,
        'booking_reference', v_booking.booking_reference,
        'guest_name', v_booking.guest_name,
        'guest_email', v_booking.guest_email,
        'guest_phone', v_booking.guest_phone,
        'yacht_name', v_yacht.name,
        'yacht_location', v_yacht.location,
        'date', v_booking.date,
        'time_slot', v_booking.time_slot,
        'seats', v_booking.seats,
        'total_price', v_booking.total_price,
        'status', 'boarded'
    );
END;
$$;