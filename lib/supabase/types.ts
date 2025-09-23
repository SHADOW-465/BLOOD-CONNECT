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
      achievements: {
        Row: {
          description: string
          icon_url: string | null
          id: number
          name: string
          points_reward: number | null
        }
        Insert: {
          description: string
          icon_url?: string | null
          id?: never
          name: string
          points_reward?: number | null
        }
        Update: {
          description?: string
          icon_url?: string | null
          id?: never
          name?: string
          points_reward?: number | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_datetime: string
          appointment_type: Database["public"]["Enums"]["appointment_type"]
          created_at: string | null
          hospital_id: number | null
          id: number
          notes: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string | null
          user_id: number
        }
        Insert: {
          appointment_datetime: string
          appointment_type: Database["public"]["Enums"]["appointment_type"]
          created_at?: string | null
          hospital_id?: number | null
          id?: never
          notes?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string | null
          user_id: number
        }
        Update: {
          appointment_datetime?: string
          appointment_type?: Database["public"]["Enums"]["appointment_type"]
          created_at?: string | null
          hospital_id?: number | null
          id?: never
          notes?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: number | null
          category: string | null
          content: string
          id: number
          image_url: string | null
          published_at: string | null
          read_time_minutes: number | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          author_id?: number | null
          category?: string | null
          content: string
          id?: never
          image_url?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          author_id?: number | null
          category?: string | null
          content?: string
          id?: never
          image_url?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_inventory: {
        Row: {
          blood_type: string
          hospital_id: number
          id: number
          last_updated: string | null
          quantity_in_units: number
          rh_factor: Database["public"]["Enums"]["rh_factor_type"]
        }
        Insert: {
          blood_type: string
          hospital_id: number
          id?: never
          last_updated?: string | null
          quantity_in_units: number
          rh_factor: Database["public"]["Enums"]["rh_factor_type"]
        }
        Update: {
          blood_type?: string
          hospital_id?: number
          id?: never
          last_updated?: string | null
          quantity_in_units?: number
          rh_factor?: Database["public"]["Enums"]["rh_factor_type"]
        }
        Relationships: [
          {
            foreignKeyName: "blood_inventory_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_requests: {
        Row: {
          blood_type: string
          contact_phone: string
          created_at: string | null
          hospital_name: string
          id: number
          latitude: number
          longitude: number
          notes: string | null
          patient_name: string
          requester_id: number
          required_by: string
          rh_factor: Database["public"]["Enums"]["rh_factor_type"]
          status: Database["public"]["Enums"]["request_status"]
          units_needed: number
          updated_at: string | null
          urgency: Database["public"]["Enums"]["request_urgency"]
        }
        Insert: {
          blood_type: string
          contact_phone: string
          created_at?: string | null
          hospital_name: string
          id?: never
          latitude: number
          longitude: number
          notes?: string | null
          patient_name: string
          requester_id: number
          required_by: string
          rh_factor: Database["public"]["Enums"]["rh_factor_type"]
          status?: Database["public"]["Enums"]["request_status"]
          units_needed: number
          updated_at?: string | null
          urgency: Database["public"]["Enums"]["request_urgency"]
        }
        Update: {
          blood_type?: string
          contact_phone?: string
          created_at?: string | null
          hospital_name?: string
          id?: never
          latitude?: number
          longitude?: number
          notes?: string | null
          patient_name?: string
          requester_id?: number
          required_by?: string
          rh_factor?: Database["public"]["Enums"]["rh_factor_type"]
          status?: Database["public"]["Enums"]["request_status"]
          units_needed?: number
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["request_urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "blood_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string | null
          created_by_user_id: number
          description: string | null
          id: number
          name: string
          type: Database["public"]["Enums"]["community_type"]
        }
        Insert: {
          created_at?: string | null
          created_by_user_id: number
          description?: string | null
          id?: never
          name: string
          type: Database["public"]["Enums"]["community_type"]
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: number
          description?: string | null
          id?: never
          name?: string
          type?: Database["public"]["Enums"]["community_type"]
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: number
          id: number
          joined_at: string | null
          role: Database["public"]["Enums"]["community_member_role"]
          user_id: number
        }
        Insert: {
          community_id: number
          id?: never
          joined_at?: string | null
          role?: Database["public"]["Enums"]["community_member_role"]
          user_id: number
        }
        Update: {
          community_id?: number
          id?: never
          joined_at?: string | null
          role?: Database["public"]["Enums"]["community_member_role"]
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_journey: {
        Row: {
          created_at: string | null
          donation_id: number
          hospital_id: number | null
          id: number
          notes: string | null
          recipient_id: number | null
          status: Database["public"]["Enums"]["journey_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donation_id: number
          hospital_id?: number | null
          id?: never
          notes?: string | null
          recipient_id?: number | null
          status: Database["public"]["Enums"]["journey_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donation_id?: number
          hospital_id?: number | null
          id?: never
          notes?: string | null
          recipient_id?: number | null
          status?: Database["public"]["Enums"]["journey_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_journey_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_journey_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_journey_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          created_at: string | null
          donation_date: string
          donation_type: Database["public"]["Enums"]["donation_type"]
          donor_id: number
          id: number
          location: string | null
          notes: string | null
          units_donated: number
        }
        Insert: {
          created_at?: string | null
          donation_date: string
          donation_type?: Database["public"]["Enums"]["donation_type"]
          donor_id: number
          id?: never
          location?: string | null
          notes?: string | null
          units_donated: number
        }
        Update: {
          created_at?: string | null
          donation_date?: string
          donation_type?: Database["public"]["Enums"]["donation_type"]
          donor_id?: number
          id?: never
          location?: string | null
          notes?: string | null
          units_donated?: number
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          event_id: number
          id: number
          registered_at: string | null
          registration_status: Database["public"]["Enums"]["registration_status"]
          user_id: number
        }
        Insert: {
          event_id: number
          id?: never
          registered_at?: string | null
          registration_status?: Database["public"]["Enums"]["registration_status"]
          user_id: number
        }
        Update: {
          event_id?: number
          id?: never
          registered_at?: string | null
          registration_status?: Database["public"]["Enums"]["registration_status"]
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by_user_id: number
          description: string | null
          end_datetime: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: number
          location: string | null
          name: string
          organized_by_community_id: number | null
          start_datetime: string
        }
        Insert: {
          created_at?: string | null
          created_by_user_id: number
          description?: string | null
          end_datetime: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: never
          location?: string | null
          name: string
          organized_by_community_id?: number | null
          start_datetime: string
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: number
          description?: string | null
          end_datetime?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: never
          location?: string | null
          name?: string
          organized_by_community_id?: number | null
          start_datetime?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organized_by_community_id_fkey"
            columns: ["organized_by_community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: number
          question: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: never
          question: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: never
          question?: string
        }
        Relationships: []
      }
      health_screenings: {
        Row: {
          blood_pressure: string | null
          created_at: string | null
          donor_id: number
          hemoglobin_level: number | null
          id: number
          is_eligible: boolean
          notes: string | null
          screening_date: string
          temperature: number | null
        }
        Insert: {
          blood_pressure?: string | null
          created_at?: string | null
          donor_id: number
          hemoglobin_level?: number | null
          id?: never
          is_eligible: boolean
          notes?: string | null
          screening_date: string
          temperature?: number | null
        }
        Update: {
          blood_pressure?: string | null
          created_at?: string | null
          donor_id?: number
          hemoglobin_level?: number | null
          id?: never
          is_eligible?: boolean
          notes?: string | null
          screening_date?: string
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_screenings_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string
          city: string | null
          created_at: string | null
          id: number
          is_verified: boolean
          latitude: number | null
          longitude: number | null
          name: string
          operating_hours: string | null
          phone_number: string | null
          state: string | null
          type: Database["public"]["Enums"]["hospital_type"]
          zip_code: string | null
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string | null
          id?: never
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          operating_hours?: string | null
          phone_number?: string | null
          state?: string | null
          type: Database["public"]["Enums"]["hospital_type"]
          zip_code?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string | null
          id?: never
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          operating_hours?: string | null
          phone_number?: string | null
          state?: string | null
          type?: Database["public"]["Enums"]["hospital_type"]
          zip_code?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean
          message: string
          title: string
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: never
          is_read?: boolean
          message: string
          title: string
          user_id: number
        }
        Update: {
          created_at?: string
          id?: never
          is_read?: boolean
          message?: string
          title?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_resets: {
        Row: {
          created_at: string | null
          email: string
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          token?: string
        }
        Relationships: []
      }
      request_responses: {
        Row: {
          created_at: string | null
          donor_id: number
          id: number
          request_id: number
          response_status: Database["public"]["Enums"]["response_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donor_id: number
          id?: never
          request_id: number
          response_status?: Database["public"]["Enums"]["response_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donor_id?: number
          id?: never
          request_id?: number
          response_status?: Database["public"]["Enums"]["response_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_responses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: number
          earned_at: string | null
          id: number
          user_id: number
        }
        Insert: {
          achievement_id: number
          earned_at?: string | null
          id?: never
          user_id: number
        }
        Update: {
          achievement_id?: number
          earned_at?: string | null
          id?: never
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          blood_type: string | null
          date_of_birth: string | null
          emergency_contact: string | null
          last_donation_date: string | null
          latitude: number | null
          longitude: number | null
          medical_conditions: string | null
          profile_picture_url: string | null
          rh_factor: Database["public"]["Enums"]["rh_factor_type"]
          user_id: number
          weight_kg: number | null
        }
        Insert: {
          blood_type?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          last_donation_date?: string | null
          latitude?: number | null
          longitude?: number | null
          medical_conditions?: string | null
          profile_picture_url?: string | null
          rh_factor: Database["public"]["Enums"]["rh_factor_type"]
          user_id: number
          weight_kg?: number | null
        }
        Update: {
          blood_type?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          last_donation_date?: string | null
          latitude?: number | null
          longitude?: number | null
          medical_conditions?: string | null
          profile_picture_url?: string | null
          rh_factor?: Database["public"]["Enums"]["rh_factor_type"]
          user_id?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          availability_status: Database["public"]["Enums"]["availability_status"]
          created_at: string | null
          email: string
          id: number
          is_verified: boolean
          name: string
          password_hash: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          availability_status?: Database["public"]["Enums"]["availability_status"]
          created_at?: string | null
          email: string
          id?: never
          is_verified?: boolean
          name: string
          password_hash: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          availability_status?: Database["public"]["Enums"]["availability_status"]
          created_at?: string | null
          email?: string
          id?: never
          is_verified?: boolean
          name?: string
          password_hash?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      appointment_type: "donation" | "screening" | "consultation"
      availability_status: "available" | "unavailable"
      community_member_role: "member" | "admin"
      community_type: "local_group" | "corporate" | "family_network"
      donation_type: "whole_blood" | "platelets" | "plasma"
      event_type: "blood_drive" | "webinar" | "volunteer_opportunity"
      hospital_type: "hospital" | "blood_bank"
      journey_status: "donated" | "in_transit" | "at_hospital" | "transfused"
      registration_status: "registered" | "attended" | "cancelled"
      request_status: "active" | "fulfilled" | "expired" | "cancelled"
      request_urgency: "moderate" | "urgent" | "critical"
      response_status: "accepted" | "declined" | "pending"
      rh_factor_type: "+" | "-"
      user_role: "donor" | "recipient" | "both"
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
      appointment_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      appointment_type: ["donation", "screening", "consultation"],
      availability_status: ["available", "unavailable"],
      community_member_role: ["member", "admin"],
      community_type: ["local_group", "corporate", "family_network"],
      donation_type: ["whole_blood", "platelets", "plasma"],
      event_type: ["blood_drive", "webinar", "volunteer_opportunity"],
      hospital_type: ["hospital", "blood_bank"],
      journey_status: ["donated", "in_transit", "at_hospital", "transfused"],
      registration_status: ["registered", "attended", "cancelled"],
      request_status: ["active", "fulfilled", "expired", "cancelled"],
      request_urgency: ["moderate", "urgent", "critical"],
      response_status: ["accepted", "declined", "pending"],
      rh_factor_type: ["+", "-"],
      user_role: ["donor", "recipient", "both"],
    },
  },
} as const
