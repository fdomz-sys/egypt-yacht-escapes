-- =============================================
-- PRODUCTION BOOKING SYSTEM MIGRATION
-- =============================================

-- 1. Add new booking statuses to the enum
-- First, let's add 'pending_payment' and 'used' to the booking_status enum
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending_payment';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'used';

-- 2. Create booking_status_history table for audit trail
CREATE TABLE IF NOT EXISTS public.booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on status history
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for booking_status_history
CREATE POLICY "Admins can manage all status history"
ON public.booking_status_history FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view status history"
ON public.booking_status_history FOR SELECT
USING (public.is_staff(auth.uid()));

CREATE POLICY "Owners can view status history for their yacht bookings"
ON public.booking_status_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.yachts y ON b.yacht_id = y.id
        WHERE b.id = booking_status_history.booking_id
        AND y.owner_id = auth.uid()
    )
);

-- 3. Add admin_notes column to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 4. Update create_booking function to use pending_payment status
-- Also fix gen_random_bytes issue by using a simpler approach
CREATE OR REPLACE FUNCTION public.create_booking(
    p_yacht_id UUID,
    p_date DATE,
    p_time_slot TEXT,
    p_seats INTEGER,
    p_payment_method TEXT
)
RETURNS TABLE(booking_id UUID, booking_reference TEXT, success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_yacht RECORD;
    v_availability RECORD;
    v_booking_ref TEXT;
    v_booking_id UUID;
    v_subtotal DECIMAL(10,2);
    v_platform_fee DECIMAL(10,2);
    v_total DECIMAL(10,2);
    v_qr_data TEXT;
    v_random_suffix TEXT;
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

    -- Check for double booking (same yacht, date, time slot with active booking)
    IF EXISTS (
        SELECT 1 FROM public.bookings existing
        WHERE existing.yacht_id = p_yacht_id
        AND existing.date = p_date
        AND existing.time_slot = p_time_slot
        AND existing.status NOT IN ('cancelled')
    ) THEN
        -- Check available capacity for shared trips
        SELECT COALESCE(SUM(existing.seats), 0) INTO v_subtotal
        FROM public.bookings existing
        WHERE existing.yacht_id = p_yacht_id
        AND existing.date = p_date
        AND existing.time_slot = p_time_slot
        AND existing.status NOT IN ('cancelled');
        
        IF (v_subtotal + p_seats) > v_yacht.capacity THEN
            RETURN QUERY SELECT NULL::UUID, NULL::TEXT, false, 'Not enough capacity for this time slot';
            RETURN;
        END IF;
    END IF;

    -- Get or create availability record
    SELECT * INTO v_availability
    FROM public.availability
    WHERE yacht_id = p_yacht_id AND date = p_date
    FOR UPDATE;

    IF v_availability IS NULL THEN
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
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.bookings AS b
            WHERE b.booking_reference = v_booking_ref
        );
    END LOOP;

    -- Generate QR code data using UUID (no gen_random_bytes)
    v_random_suffix := REPLACE(gen_random_uuid()::TEXT, '-', '');
    v_qr_data := 'SEASCAPE:' || v_booking_ref || ':' || SUBSTRING(v_random_suffix FROM 1 FOR 16);

    -- Create booking with PENDING_PAYMENT status
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
        'pending_payment',
        v_qr_data
    ) RETURNING id INTO v_booking_id;

    -- Decrement availability
    UPDATE public.availability
    SET slots_remaining = slots_remaining - p_seats
    WHERE id = v_availability.id;

    -- Record initial status in history
    INSERT INTO public.booking_status_history (booking_id, previous_status, new_status, changed_by, notes)
    VALUES (v_booking_id, NULL, 'pending_payment', auth.uid(), 'Booking created');

    RETURN QUERY SELECT v_booking_id, v_booking_ref, true, NULL::TEXT;
END;
$function$;

-- 5. Create admin function to update booking status
CREATE OR REPLACE FUNCTION public.admin_update_booking_status(
    p_booking_id UUID,
    p_new_status TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_booking RECORD;
    v_old_status TEXT;
BEGIN
    -- Check permissions
    IF NOT (public.is_admin(auth.uid()) OR public.is_owner(auth.uid()) OR public.is_staff(auth.uid())) THEN
        RETURN QUERY SELECT false, 'Unauthorized: Admin, owner, or staff access required';
        RETURN;
    END IF;

    -- Get booking
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;

    IF v_booking IS NULL THEN
        RETURN QUERY SELECT false, 'Booking not found';
        RETURN;
    END IF;

    v_old_status := v_booking.status::TEXT;

    -- Validate status transition
    IF v_old_status = 'used' THEN
        RETURN QUERY SELECT false, 'Cannot modify a used booking';
        RETURN;
    END IF;

    IF v_old_status = 'cancelled' AND p_new_status != 'cancelled' THEN
        -- Only admins can restore cancelled bookings
        IF NOT public.is_admin(auth.uid()) THEN
            RETURN QUERY SELECT false, 'Only admins can restore cancelled bookings';
            RETURN;
        END IF;
    END IF;

    -- Update booking status
    UPDATE public.bookings
    SET status = p_new_status::booking_status,
        admin_notes = COALESCE(p_notes, admin_notes),
        updated_at = now()
    WHERE id = p_booking_id;

    -- Record status change in history
    INSERT INTO public.booking_status_history (booking_id, previous_status, new_status, changed_by, notes)
    VALUES (p_booking_id, v_old_status, p_new_status, auth.uid(), p_notes);

    -- If cancelled, restore availability
    IF p_new_status = 'cancelled' AND v_old_status != 'cancelled' THEN
        UPDATE public.availability
        SET slots_remaining = slots_remaining + v_booking.seats
        WHERE yacht_id = v_booking.yacht_id AND date = v_booking.date;
    END IF;

    -- If un-cancelling, reduce availability again
    IF v_old_status = 'cancelled' AND p_new_status != 'cancelled' THEN
        UPDATE public.availability
        SET slots_remaining = slots_remaining - v_booking.seats
        WHERE yacht_id = v_booking.yacht_id AND date = v_booking.date;
    END IF;

    RETURN QUERY SELECT true, NULL::TEXT;
END;
$function$;

-- 6. Create function to regenerate QR code
CREATE OR REPLACE FUNCTION public.regenerate_qr_code(p_booking_id UUID)
RETURNS TABLE(success BOOLEAN, new_qr_code TEXT, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_booking RECORD;
    v_new_qr TEXT;
    v_random_suffix TEXT;
BEGIN
    -- Check permissions
    IF NOT (public.is_admin(auth.uid()) OR public.is_owner(auth.uid())) THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Unauthorized';
        RETURN;
    END IF;

    -- Get booking
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;

    IF v_booking IS NULL THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Booking not found';
        RETURN;
    END IF;

    IF v_booking.status = 'used' THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Cannot regenerate QR for used booking';
        RETURN;
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RETURN QUERY SELECT false, NULL::TEXT, 'Cannot regenerate QR for cancelled booking';
        RETURN;
    END IF;

    -- Generate new QR code
    v_random_suffix := REPLACE(gen_random_uuid()::TEXT, '-', '');
    v_new_qr := 'SEASCAPE:' || v_booking.booking_reference || ':' || SUBSTRING(v_random_suffix FROM 1 FOR 16);

    -- Update booking
    UPDATE public.bookings
    SET qr_code_data = v_new_qr, updated_at = now()
    WHERE id = p_booking_id;

    -- Record in history
    INSERT INTO public.booking_status_history (booking_id, previous_status, new_status, changed_by, notes)
    VALUES (p_booking_id, v_booking.status::TEXT, v_booking.status::TEXT, auth.uid(), 'QR code regenerated');

    RETURN QUERY SELECT true, v_new_qr, NULL::TEXT;
END;
$function$;

-- 7. Update scan_booking function for production logic
CREATE OR REPLACE FUNCTION public.scan_booking(p_qr_code_data TEXT)
RETURNS TABLE(success BOOLEAN, error_message TEXT, booking_info JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_booking RECORD;
    v_yacht RECORD;
BEGIN
    -- Check if caller is staff/admin/owner
    IF NOT (public.is_staff(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_owner(auth.uid())) THEN
        RETURN QUERY SELECT false, 'Unauthorized: Staff access required', NULL::JSONB;
        RETURN;
    END IF;

    -- Find booking by QR code
    SELECT b.*, p.name as guest_name, p.email as guest_email, p.phone as guest_phone
    INTO v_booking
    FROM public.bookings b
    JOIN public.profiles p ON b.user_id = p.id
    WHERE b.qr_code_data = p_qr_code_data;

    IF v_booking IS NULL THEN
        RETURN QUERY SELECT false, 'Invalid QR code - booking not found', NULL::JSONB;
        RETURN;
    END IF;

    -- Get yacht info
    SELECT * INTO v_yacht FROM public.yachts WHERE id = v_booking.yacht_id;

    -- Build booking info JSON (always return this for display)
    DECLARE
        v_info JSONB := jsonb_build_object(
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
            'status', v_booking.status::TEXT,
            'payment_method', v_booking.payment_method
        );
    BEGIN
        -- Check booking status
        CASE v_booking.status::TEXT
            WHEN 'pending_payment' THEN
                RETURN QUERY SELECT false, 'PAYMENT NOT CONFIRMED - Booking is pending payment', v_info;
                RETURN;
            WHEN 'cancelled' THEN
                RETURN QUERY SELECT false, 'BOOKING CANCELLED - This booking was cancelled', v_info;
                RETURN;
            WHEN 'used' THEN
                RETURN QUERY SELECT false, 'ALREADY USED - This booking has already been used', v_info;
                RETURN;
            WHEN 'boarded' THEN
                -- Legacy status, treat as used
                RETURN QUERY SELECT false, 'ALREADY BOARDED - This booking has already been used', v_info;
                RETURN;
            WHEN 'confirmed' THEN
                -- Valid for boarding - but don't auto-mark as used, let admin do it
                RETURN QUERY SELECT true, 'VALID - Ready for boarding', v_info;
                RETURN;
            WHEN 'pending' THEN
                -- Legacy status, treat as pending payment
                RETURN QUERY SELECT false, 'PAYMENT NOT CONFIRMED - Booking is pending', v_info;
                RETURN;
            ELSE
                RETURN QUERY SELECT false, 'Unknown booking status', v_info;
                RETURN;
        END CASE;
    END;
END;
$function$;

-- 8. Create function to mark booking as used (separate from scan)
CREATE OR REPLACE FUNCTION public.mark_booking_used(p_booking_id UUID)
RETURNS TABLE(success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_booking RECORD;
BEGIN
    -- Check permissions
    IF NOT (public.is_staff(auth.uid()) OR public.is_admin(auth.uid()) OR public.is_owner(auth.uid())) THEN
        RETURN QUERY SELECT false, 'Unauthorized';
        RETURN;
    END IF;

    -- Get booking
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;

    IF v_booking IS NULL THEN
        RETURN QUERY SELECT false, 'Booking not found';
        RETURN;
    END IF;

    IF v_booking.status::TEXT != 'confirmed' THEN
        RETURN QUERY SELECT false, 'Only confirmed bookings can be marked as used';
        RETURN;
    END IF;

    -- Update to used
    UPDATE public.bookings
    SET status = 'used', updated_at = now()
    WHERE id = p_booking_id;

    -- Record scan
    INSERT INTO public.scans (booking_id, staff_id)
    VALUES (p_booking_id, auth.uid());

    -- Record in history
    INSERT INTO public.booking_status_history (booking_id, previous_status, new_status, changed_by, notes)
    VALUES (p_booking_id, 'confirmed', 'used', auth.uid(), 'Guest boarded');

    RETURN QUERY SELECT true, NULL::TEXT;
END;
$function$;

-- 9. Update cancel_booking to use the new history system
CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id UUID)
RETURNS TABLE(success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_booking RECORD;
    v_old_status TEXT;
BEGIN
    -- Get booking
    SELECT * INTO v_booking 
    FROM public.bookings 
    WHERE id = p_booking_id 
    AND (user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_owner(auth.uid()) OR public.is_staff(auth.uid()))
    FOR UPDATE;
    
    IF v_booking IS NULL THEN
        RETURN QUERY SELECT false, 'Booking not found or unauthorized';
        RETURN;
    END IF;

    v_old_status := v_booking.status::TEXT;
    
    IF v_booking.status::TEXT = 'cancelled' THEN
        RETURN QUERY SELECT false, 'Booking is already cancelled';
        RETURN;
    END IF;
    
    IF v_booking.status::TEXT = 'used' THEN
        RETURN QUERY SELECT false, 'Cannot cancel a used booking';
        RETURN;
    END IF;

    IF v_booking.status::TEXT = 'boarded' THEN
        RETURN QUERY SELECT false, 'Cannot cancel a completed booking';
        RETURN;
    END IF;
    
    -- Update booking status
    UPDATE public.bookings SET status = 'cancelled', updated_at = now() WHERE id = p_booking_id;
    
    -- Restore availability
    UPDATE public.availability
    SET slots_remaining = slots_remaining + v_booking.seats
    WHERE yacht_id = v_booking.yacht_id AND date = v_booking.date;

    -- Record in history
    INSERT INTO public.booking_status_history (booking_id, previous_status, new_status, changed_by, notes)
    VALUES (p_booking_id, v_old_status, 'cancelled', auth.uid(), 'Booking cancelled');
    
    RETURN QUERY SELECT true, NULL::TEXT;
END;
$function$;