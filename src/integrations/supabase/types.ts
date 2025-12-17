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
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          couple_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          couple_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          couple_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          closing_day: number | null
          couple_id: string
          created_at: string
          id: string
          is_active: boolean | null
          monthly_limit: number
          name: string
          updated_at: string
        }
        Insert: {
          closing_day?: number | null
          couple_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          monthly_limit?: number
          name: string
          updated_at?: string
        }
        Update: {
          closing_day?: number | null
          couple_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          monthly_limit?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      category_budgets: {
        Row: {
          category: string
          created_at: string
          id: string
          month_id: string
          planned_amount: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          month_id: string
          planned_amount?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          month_id?: string
          planned_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_budgets_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      imports: {
        Row: {
          couple_id: string
          created_at: string
          error_message: string | null
          file_hash: string | null
          file_name: string | null
          file_url: string | null
          id: string
          processed_at: string | null
          status: Database["public"]["Enums"]["import_status"]
          transactions_count: number | null
          type: Database["public"]["Enums"]["transaction_source"]
        }
        Insert: {
          couple_id: string
          created_at?: string
          error_message?: string | null
          file_hash?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          transactions_count?: number | null
          type: Database["public"]["Enums"]["transaction_source"]
        }
        Update: {
          couple_id?: string
          created_at?: string
          error_message?: string | null
          file_hash?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          transactions_count?: number | null
          type?: Database["public"]["Enums"]["transaction_source"]
        }
        Relationships: [
          {
            foreignKeyName: "imports_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_mappings: {
        Row: {
          category: string
          couple_id: string | null
          created_at: string
          id: string
          is_global: boolean | null
          merchant_normalized: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category: string
          couple_id?: string | null
          created_at?: string
          id?: string
          is_global?: boolean | null
          merchant_normalized: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          couple_id?: string | null
          created_at?: string
          id?: string
          is_global?: boolean | null
          merchant_normalized?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_mappings_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      months: {
        Row: {
          cloned_from: string | null
          closed_at: string | null
          couple_id: string
          created_at: string
          edited_after_close: boolean | null
          id: string
          updated_at: string
          year_month: string
        }
        Insert: {
          cloned_from?: string | null
          closed_at?: string | null
          couple_id: string
          created_at?: string
          edited_after_close?: boolean | null
          id?: string
          updated_at?: string
          year_month: string
        }
        Update: {
          cloned_from?: string | null
          closed_at?: string | null
          couple_id?: string
          created_at?: string
          edited_after_close?: boolean | null
          id?: string
          updated_at?: string
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "months_cloned_from_fkey"
            columns: ["cloned_from"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "months_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          couple_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          couple_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          couple_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_bills: {
        Row: {
          amount: number
          couple_id: string
          created_at: string
          due_day: number
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          amount: number
          couple_id: string
          created_at?: string
          due_day: number
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          couple_id?: string
          created_at?: string
          due_day?: number
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_bills_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          card_id: string | null
          category: string | null
          confidence:
            | Database["public"]["Enums"]["transaction_confidence"]
            | null
          created_at: string
          fingerprint: string | null
          id: string
          import_id: string | null
          is_card_payment: boolean | null
          is_internal_transfer: boolean | null
          merchant: string
          merchant_normalized: string | null
          month_id: string
          needs_review: boolean | null
          raw_data: Json | null
          source: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          card_id?: string | null
          category?: string | null
          confidence?:
            | Database["public"]["Enums"]["transaction_confidence"]
            | null
          created_at?: string
          fingerprint?: string | null
          id?: string
          import_id?: string | null
          is_card_payment?: boolean | null
          is_internal_transfer?: boolean | null
          merchant: string
          merchant_normalized?: string | null
          month_id: string
          needs_review?: boolean | null
          raw_data?: Json | null
          source: Database["public"]["Enums"]["transaction_source"]
          transaction_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          card_id?: string | null
          category?: string | null
          confidence?:
            | Database["public"]["Enums"]["transaction_confidence"]
            | null
          created_at?: string
          fingerprint?: string | null
          id?: string
          import_id?: string | null
          is_card_payment?: boolean | null
          is_internal_transfer?: boolean | null
          merchant?: string
          merchant_normalized?: string | null
          month_id?: string
          needs_review?: boolean | null
          raw_data?: Json | null
          source?: Database["public"]["Enums"]["transaction_source"]
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "months"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_couple_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "partner"
      import_status: "pending" | "processing" | "completed" | "failed"
      transaction_confidence: "high" | "medium" | "low"
      transaction_source: "print" | "ofx" | "manual"
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
      app_role: ["admin", "partner"],
      import_status: ["pending", "processing", "completed", "failed"],
      transaction_confidence: ["high", "medium", "low"],
      transaction_source: ["print", "ofx", "manual"],
    },
  },
} as const
