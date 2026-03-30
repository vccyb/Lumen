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
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      goal_milestones: {
        Row: {
          created_at: string
          goal_id: string
          milestone_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          milestone_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          milestone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "life_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      life_goals: {
        Row: {
          category: string
          created_at: string
          deleted_at: string | null
          description: string
          estimated_cost: number
          id: string
          priority: string | null
          progress: number
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          deleted_at?: string | null
          description: string
          estimated_cost?: number
          id?: string
          priority?: string | null
          progress?: number
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          estimated_cost?: number
          id?: string
          priority?: string | null
          progress?: number
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestone_tags: {
        Row: {
          created_at: string
          id: string
          milestone_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          milestone_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          milestone_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_tags_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          asset_class: string
          capital_deployed: number
          category: string
          created_at: string
          date: string
          deleted_at: string | null
          description: string
          id: string
          image_url: string | null
          impact_radius: number | null
          location: string | null
          recurrence: boolean
          search_vector: unknown
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_class: string
          capital_deployed?: number
          category: string
          created_at?: string
          date: string
          deleted_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          impact_radius?: number | null
          location?: string | null
          recurrence?: boolean
          search_vector?: unknown
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_class?: string
          capital_deployed?: number
          category?: string
          created_at?: string
          date?: string
          deleted_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          impact_radius?: number | null
          location?: string | null
          recurrence?: boolean
          search_vector?: unknown
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_links: {
        Row: {
          created_at: string
          id: string
          link_type: string
          project_id: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_type: string
          project_id: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          link_type?: string
          project_id?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tech_stack: {
        Row: {
          created_at: string
          id: string
          project_id: string
          technology: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          technology: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          technology?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tech_stack_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string
          cover_image: string | null
          created_at: string
          deleted_at: string | null
          description: string
          emotional_yield: Json | null
          estimated_hours_invested: number | null
          featured: boolean
          id: string
          last_updated: string
          learnings: Json | null
          long_description: string | null
          milestones: Json | null
          monthly_cost: number | null
          name: string
          progress: number | null
          start_date: string
          status: string
          tech_stack: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description: string
          emotional_yield?: Json | null
          estimated_hours_invested?: number | null
          featured?: boolean
          id?: string
          last_updated: string
          learnings?: Json | null
          long_description?: string | null
          milestones?: Json | null
          monthly_cost?: number | null
          name: string
          progress?: number | null
          start_date: string
          status: string
          tech_stack?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          emotional_yield?: Json | null
          estimated_hours_invested?: number | null
          featured?: boolean
          id?: string
          last_updated?: string
          learnings?: Json | null
          long_description?: string | null
          milestones?: Json | null
          monthly_cost?: number | null
          name?: string
          progress?: number | null
          start_date?: string
          status?: string
          tech_stack?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      wealth_records: {
        Row: {
          breakdown: Json
          change_amount: number
          change_reason: string
          created_at: string
          date: string
          deleted_at: string | null
          id: string
          total_assets: number
          updated_at: string
          user_id: string
        }
        Insert: {
          breakdown: Json
          change_amount: number
          change_reason: string
          created_at?: string
          date: string
          deleted_at?: string | null
          id?: string
          total_assets: number
          updated_at?: string
          user_id: string
        }
        Update: {
          breakdown?: Json
          change_amount?: number
          change_reason?: string
          created_at?: string
          date?: string
          deleted_at?: string | null
          id?: string
          total_assets?: number
          updated_at?: string
          user_id?: string
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
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
