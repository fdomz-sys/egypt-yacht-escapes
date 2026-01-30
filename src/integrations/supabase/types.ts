export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string
          date: string
          id: string
          slots_remaining: number
          updated_at: string
          yacht_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          slots_remaining: number
          updated_at?: string
          yacht_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          slots_remaining?: number
          updated_at?: string
          yacht_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_yacht_id_fkey"
            columns: ["yacht_id"]
            isOneToOne: false
            referencedRelation: "yachts"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_status_history: {
        Row: {
          booking_id: string
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          notes: string | null
          previous_status: string | null
        }
        Insert: {
          booking_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          previous_status?: string | null
        }
        Update: {
          booking_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_notes: string | null
          booking_reference: string
          created_at: string
          date: string
          id: string
          notes: string | null
          payment_method: string
          platform_fee: number
          qr_code_data: string | null
          seats: number
          status: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          time_slot: string
          total_price: number
          updated_at: string
          user_id: string
          yacht_id: string
        }
        Insert: {
          admin_notes?: string | null
          booking_reference: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          payment_method: string
          platform_fee: number
          qr_code_data?: string | null
          seats: number
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          time_slot: string
          total_price: number
          updated_at?: string
          user_id: string
          yacht_id: string
        }
        Update: {
          admin_notes?: string | null
          booking_reference?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          payment_method?: string
          platform_fee?: number
          qr_code_data?: string | null
          seats?: number
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal?: number
          time_slot?: string
          total_price?: number
          updated_at?: string
          user_id?: string
          yacht_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_yacht_id_fkey"
            columns: ["yacht_id"]
            isOneToOne: false
            referencedRelation: "yachts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          booking_id: string
          id: string
          notes: string | null
          scanned_at: string
          staff_id: string
        }
        Insert: {
          booking_id: string
          id?: string
          notes?: string | null
          scanned_at?: string
          staff_id: string
        }
        Update: {
          booking_id?: string
          id?: string
          notes?: string | null
          scanned_at?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      yachts: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          image_urls: string[] | null
          included: string[] | null
          is_available: boolean | null
          location: Database["public"]["Enums"]["location_type"]
          name: string
          name_ar: string | null
          owner_id: string | null
          price_per_hour: number
          price_per_person: number
          rating: number | null
          review_count: number | null
          type: Database["public"]["Enums"]["activity_type"]
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity: number
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_urls?: string[] | null
          included?: string[] | null
          is_available?: boolean | null
          location: Database["public"]["Enums"]["location_type"]
          name: string
          name_ar?: string | null
          owner_id?: string | null
          price_per_hour: number
          price_per_person: number
          rating?: number | null
          review_count?: number | null
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_urls?: string[] | null
          included?: string[] | null
          is_available?: boolean | null
          location?: Database["public"]["Enums"]["location_type"]
          name?: string
          name_ar?: string | null
          owner_id?: string | null
          price_per_hour?: number
          price_per_person?: number
          rating?: number | null
          review_count?: number | null
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_booking_status: {
        Args: { p_booking_id: string; p_new_status: string; p_notes?: string }
        Returns: {
          error_message: string
          success: boolean
        }[]
      }
      cancel_booking: {
        Args: { p_booking_id: string }
        Returns: {
          error_message: string
          success: boolean
        }[]
      }
      create_booking: {
        Args: {
          p_date: string
          p_payment_method: string
          p_seats: number
          p_time_slot: string
          p_yacht_id: string
        }
        Returns: {
          booking_id: string
          booking_reference: string
          error_message: string
          success: boolean
        }[]
      }
      generate_booking_reference: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      mark_booking_used: {
        Args: { p_booking_id: string }
        Returns: {
          error_message: string
          success: boolean
        }[]
      }
      owns_yacht: {
        Args: { _user_id: string; _yacht_id: string }
        Returns: boolean
      }
      regenerate_qr_code: {
        Args: { p_booking_id: string }
        Returns: {
          error_message: string
          new_qr_code: string
          success: boolean
        }[]
      }
      scan_booking: {
        Args: { p_qr_code_data: string }
        Returns: {
          booking_info: Json
          error_message: string
          success: boolean
        }[]
      }
    }
    Enums: {
      activity_type:
        | "private-yacht"
        | "shared-trip"
        | "jet-ski"
        | "speed-boat"
        | "catamaran"
      app_role: "guest" | "owner" | "staff" | "admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "boarded"
        | "pending_payment"
        | "used"
      location_type: "marsa-matruh" | "north-coast" | "alexandria" | "el-gouna"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "private-yacht",
        "shared-trip",
        "jet-ski",
        "speed-boat",
        "catamaran",
      ],
      app_role: ["guest", "owner", "staff", "admin"],
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "boarded",
        "pending_payment",
        "used",
      ],
      location_type: ["marsa-matruh", "north-coast", "alexandria", "el-gouna"],
    },
  },
} as const
