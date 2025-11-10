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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          amount_paid: number
          charger_id: string
          created_at: string
          driver_id: string
          end_time: string
          id: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          amount_paid: number
          charger_id: string
          created_at?: string
          driver_id: string
          end_time: string
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          amount_paid?: number
          charger_id?: string
          created_at?: string
          driver_id?: string
          end_time?: string
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bookings_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chargers: {
        Row: {
          address: string
          amenities: Json | null
          availability_end: string | null
          availability_start: string | null
          charging_fee_type: string | null
          company: string | null
          connector_type: string
          contact_number: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean
          latitude: number
          longitude: number
          owner_id: string
          parking_type: string | null
          power_output_kw: number
          power_source: string | null
          price_per_hour: number
          rating_avg: number | null
          title: string
          total_reviews: number | null
        }
        Insert: {
          address: string
          amenities?: Json | null
          availability_end?: string | null
          availability_start?: string | null
          charging_fee_type?: string | null
          company?: string | null
          connector_type: string
          contact_number?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          latitude: number
          longitude: number
          owner_id: string
          parking_type?: string | null
          power_output_kw: number
          power_source?: string | null
          price_per_hour: number
          rating_avg?: number | null
          title: string
          total_reviews?: number | null
        }
        Update: {
          address?: string
          amenities?: Json | null
          availability_end?: string | null
          availability_start?: string | null
          charging_fee_type?: string | null
          company?: string | null
          connector_type?: string
          contact_number?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          latitude?: number
          longitude?: number
          owner_id?: string
          parking_type?: string | null
          power_output_kw?: number
          power_source?: string | null
          price_per_hour?: number
          rating_avg?: number | null
          title?: string
          total_reviews?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chargers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          charger_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          charger_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          charger_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          charger_id: string
          comment: string | null
          created_at: string
          driver_id: string
          id: string
          rating: number
        }
        Insert: {
          booking_id: string
          charger_id: string
          comment?: string | null
          created_at?: string
          driver_id: string
          id?: string
          rating: number
        }
        Update: {
          booking_id?: string
          charger_id?: string
          comment?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_shares: {
        Row: {
          charger_id: string
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          destination_latitude: number
          destination_longitude: number
          distance_remaining_km: number | null
          eta_minutes: number | null
          expires_at: string
          id: string
          is_active: boolean
          share_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          charger_id: string
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          destination_latitude: number
          destination_longitude: number
          distance_remaining_km?: number | null
          eta_minutes?: number | null
          expires_at?: string
          id?: string
          is_active?: boolean
          share_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          charger_id?: string
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          destination_latitude?: number
          destination_longitude?: number
          distance_remaining_km?: number | null
          eta_minutes?: number | null
          expires_at?: string
          id?: string
          is_active?: boolean
          share_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trip_shares_charger"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          battery_capacity: number
          bms_protocol: string | null
          charging_preferences: string | null
          color: string | null
          company: string
          connector_type: string
          created_at: string
          ev_type: string | null
          id: string
          model: string
          model_year: number | null
          owner_id: string
          plate_number: string | null
          power_output: number | null
          preferred_charger_power: number | null
          range_km: number | null
          vehicle_image: string | null
          vehicle_name: string | null
        }
        Insert: {
          battery_capacity: number
          bms_protocol?: string | null
          charging_preferences?: string | null
          color?: string | null
          company: string
          connector_type: string
          created_at?: string
          ev_type?: string | null
          id?: string
          model: string
          model_year?: number | null
          owner_id: string
          plate_number?: string | null
          power_output?: number | null
          preferred_charger_power?: number | null
          range_km?: number | null
          vehicle_image?: string | null
          vehicle_name?: string | null
        }
        Update: {
          battery_capacity?: number
          bms_protocol?: string | null
          charging_preferences?: string | null
          color?: string | null
          company?: string
          connector_type?: string
          created_at?: string
          ev_type?: string | null
          id?: string
          model?: string
          model_year?: number | null
          owner_id?: string
          plate_number?: string | null
          power_output?: number | null
          preferred_charger_power?: number | null
          range_km?: number | null
          vehicle_image?: string | null
          vehicle_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      payment_status: "unpaid" | "paid" | "failed"
      user_role: "owner" | "driver" | "both"
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
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      payment_status: ["unpaid", "paid", "failed"],
      user_role: ["owner", "driver", "both"],
    },
  },
} as const
