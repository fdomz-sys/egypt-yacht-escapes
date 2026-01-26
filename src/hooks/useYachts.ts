import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Yacht {
  id: string;
  owner_id: string | null;
  name: string;
  name_ar: string | null;
  type: "private-yacht" | "shared-trip" | "jet-ski" | "speed-boat" | "catamaran";
  location: "marsa-matruh" | "north-coast" | "alexandria" | "el-gouna";
  capacity: number;
  price_per_person: number;
  price_per_hour: number;
  description: string | null;
  description_ar: string | null;
  amenities: string[] | null;
  included: string[] | null;
  image_urls: string[] | null;
  rating: number | null;
  review_count: number | null;
  is_available: boolean | null;
  created_at: string;
  updated_at: string;
}

interface UseYachtsOptions {
  location?: string;
  type?: string;
  minCapacity?: number;
  maxPrice?: number;
}

export const useYachts = (options?: UseYachtsOptions) => {
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchYachts = async () => {
    setIsLoading(true);
    setError(null);

    let query = supabase
      .from("yachts")
      .select("*")
      .eq("is_available", true)
      .order("rating", { ascending: false });

    if (options?.location) {
      query = query.eq("location", options.location as "marsa-matruh" | "north-coast" | "alexandria" | "el-gouna");
    }

    if (options?.type) {
      query = query.eq("type", options.type as "private-yacht" | "shared-trip" | "jet-ski" | "speed-boat" | "catamaran");
    }

    if (options?.minCapacity) {
      query = query.gte("capacity", options.minCapacity);
    }

    if (options?.maxPrice) {
      query = query.lte("price_per_person", options.maxPrice);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching yachts:", fetchError);
      setError(fetchError.message);
      setYachts([]);
    } else {
      setYachts(data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchYachts();
  }, [options?.location, options?.type, options?.minCapacity, options?.maxPrice]);

  return {
    yachts,
    isLoading,
    error,
    refetch: fetchYachts,
  };
};

export const useYacht = (id: string | undefined) => {
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setYacht(null);
      setIsLoading(false);
      return;
    }

    const fetchYacht = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("yachts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching yacht:", fetchError);
        setError(fetchError.message);
        setYacht(null);
      } else {
        setYacht(data);
      }

      setIsLoading(false);
    };

    fetchYacht();
  }, [id]);

  return { yacht, isLoading, error };
};

export const useAvailability = (yachtId: string | undefined, date: Date | undefined) => {
  const [slotsRemaining, setSlotsRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!yachtId || !date) {
      setSlotsRemaining(null);
      return;
    }

    const fetchAvailability = async () => {
      setIsLoading(true);

      const dateStr = date.toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("availability")
        .select("slots_remaining")
        .eq("yacht_id", yachtId)
        .eq("date", dateStr)
        .maybeSingle();

      if (error) {
        console.error("Error fetching availability:", error);
        setSlotsRemaining(null);
      } else if (data) {
        setSlotsRemaining(data.slots_remaining);
      } else {
        // No availability record means full capacity available
        // We'll need to get yacht capacity
        const { data: yachtData } = await supabase
          .from("yachts")
          .select("capacity")
          .eq("id", yachtId)
          .maybeSingle();

        setSlotsRemaining(yachtData?.capacity ?? null);
      }

      setIsLoading(false);
    };

    fetchAvailability();
  }, [yachtId, date]);

  return { slotsRemaining, isLoading };
};
