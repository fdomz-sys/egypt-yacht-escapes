import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Booking {
  id: string;
  booking_reference: string;
  yacht_id: string;
  date: string;
  time_slot: string;
  seats: number;
  subtotal: number;
  platform_fee: number;
  total_price: number;
  payment_method: string;
  status: "pending" | "pending_payment" | "confirmed" | "cancelled" | "boarded" | "used";
  qr_code_data: string | null;
  admin_notes?: string | null;
  notes?: string | null;
  created_at: string;
  yacht?: {
    name: string;
    name_ar: string | null;
    location: string;
    image_urls: string[] | null;
  };
}

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        yacht:yachts(name, name_ar, location, image_urls)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } else {
      setBookings(data || []);
    }
    setIsLoading(false);
  };

  const createBooking = async (
    yachtId: string,
    date: Date,
    timeSlot: string,
    seats: number,
    paymentMethod: "online" | "cash"
  ): Promise<{ success: boolean; bookingReference?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: "Please login to make a booking" };
    }

    const { data, error } = await supabase.rpc("create_booking", {
      p_yacht_id: yachtId,
      p_date: date.toISOString().split("T")[0],
      p_time_slot: timeSlot,
      p_seats: seats,
      p_payment_method: paymentMethod,
    });

    if (error) {
      console.error("Booking error:", error);
      return { success: false, error: error.message };
    }

    const result = data?.[0];
    if (!result?.success) {
      return { success: false, error: result?.error_message || "Booking failed" };
    }

    // Refresh bookings after successful creation
    await fetchBookings();

    return { success: true, bookingReference: result.booking_reference };
  };

  const cancelBooking = async (
    bookingId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.rpc("cancel_booking", {
      p_booking_id: bookingId,
    });

    if (error) {
      console.error("Cancel error:", error);
      return { success: false, error: error.message };
    }

    const result = data?.[0];
    if (!result?.success) {
      return { success: false, error: result?.error_message || "Cancel failed" };
    }

    // Refresh bookings after cancellation
    await fetchBookings();

    return { success: true };
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  return {
    bookings,
    isLoading,
    createBooking,
    cancelBooking,
    refreshBookings: fetchBookings,
  };
};
