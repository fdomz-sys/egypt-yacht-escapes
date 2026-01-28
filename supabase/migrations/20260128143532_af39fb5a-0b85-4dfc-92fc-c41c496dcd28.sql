CREATE OR REPLACE FUNCTION public.create_booking(p_yacht_id uuid, p_date date, p_time_slot text, p_seats integer, p_payment_method text)
 RETURNS TABLE(booking_id uuid, booking_reference text, success boolean, error_message text)
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
        -- IMPORTANT: qualify column with table alias to avoid ambiguity with output variable 'booking_reference'
        EXIT WHEN NOT EXISTS (
          SELECT 1
          FROM public.bookings AS b
          WHERE b.booking_reference = v_booking_ref
        );
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
$function$;