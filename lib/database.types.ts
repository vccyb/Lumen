export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
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
      }
      life_goals: {
        Row: {
          category: 'experiential' | 'financial' | 'legacy' | 'personal-growth' | 'relationship'
          created_at: string
          deleted_at: string | null
          description: string
          estimated_cost: number
          id: string
          depends_on: string[] | null
          milestones: string[]
          priority: 'critical' | 'high' | 'low' | 'medium' | null
          progress: number
          status: 'achieved' | 'dreaming' | 'in-progress' | 'planning'
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: 'experiential' | 'financial' | 'legacy' | 'personal-growth' | 'relationship'
          created_at?: string
          deleted_at?: string | null
          description: string
          estimated_cost?: number
          id?: string
          depends_on?: string[] | null
          milestones?: string[]
          priority?: 'critical' | 'high' | 'low' | 'medium' | null
          progress?: number
          status?: 'achieved' | 'dreaming' | 'in-progress' | 'planning'
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: 'experiential' | 'financial' | 'legacy' | 'personal-growth' | 'relationship'
          created_at?: string
          deleted_at?: string | null
          description?: string
          estimated_cost?: number
          id?: string
          depends_on?: string[] | null
          milestones?: string[]
          priority?: 'critical' | 'high' | 'low' | 'medium' | null
          progress?: number
          status?: 'achieved' | 'dreaming' | 'in-progress' | 'planning'
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
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
      }
      milestones: {
        Row: {
          asset_class: 'equities' | 'intangible-experiential' | 'real-estate' | 'tangible-shelter' | 'tangible-vehicle' | 'venture-autonomy' | 'venture-investment'
          capital_deployed: number
          category: 'experience' | 'foundation' | 'life-chapter' | 'strategic-asset' | 'vision-realized'
          connections: string[] | null
          created_at: string
          date: string
          deleted_at: string | null
          description: string
          emotional_yield: string[]
          id: string
          image_url: string | null
          impact_radius: number | null
          labels: string[] | null
          linked_people: string[] | null
          location: string | null
          media_attachments: Json | null
          recurrence: boolean | null
          search_vector: unknown | null
          status: 'compounding' | 'completed' | 'planned' | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_class: 'equities' | 'intangible-experiential' | 'real-estate' | 'tangible-shelter' | 'tangible-vehicle' | 'venture-autonomy' | 'venture-investment'
          capital_deployed?: number
          category: 'experience' | 'foundation' | 'life-chapter' | 'strategic-asset' | 'vision-realized'
          connections?: string[] | null
          created_at?: string
          date: string
          deleted_at?: string | null
          description: string
          emotional_yield?: string[]
          id?: string
          image_url?: string | null
          impact_radius?: number | null
          labels?: string[] | null
          linked_people?: string[] | null
          location?: string | null
          media_attachments?: Json | null
          recurrence?: boolean | null
          status?: 'compounding' | 'completed' | 'planned' | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_class?: 'equities' | 'intangible-experiential' | 'real-estate' | 'tangible-shelter' | 'tangible-vehicle' | 'venture-autonomy' | 'venture-investment'
          capital_deployed?: number
          category?: 'experience' | 'foundation' | 'life-chapter' | 'strategic-asset' | 'vision-realized'
          connections?: string[] | null
          created_at?: string
          date?: string
          deleted_at?: string | null
          description?: string
          emotional_yield?: string[]
          id?: string
          image_url?: string | null
          impact_radius?: number | null
          labels?: string[] | null
          linked_people?: string[] | null
          location?: string | null
          media_attachments?: Json | null
          recurrence?: boolean | null
          search_vector?: unknown | null
          status?: 'compounding' | 'completed' | 'planned' | null
          title?: string
          updated_at?: string
          user_id?: string
        }
      }
      project_links: {
        Row: {
          created_at: string
          id: string
          link_type: 'demo' | 'docs' | 'github' | 'other'
          project_id: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_type: 'demo' | 'docs' | 'github' | 'other'
          project_id: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          link_type?: 'demo' | 'docs' | 'github' | 'other'
          project_id?: string
          title?: string | null
          url?: string
        }
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
      }
      projects: {
        Row: {
          category: 'ai-ml' | 'desktop' | 'infrastructure' | 'mobile' | 'other' | 'web'
          cover_image: string | null
          created_at: string
          deleted_at: string | null
          description: string
          estimated_hours_invested: number | null
          featured: boolean
          id: string
          last_updated: string
          long_description: string | null
          monthly_cost: number | null
          milestones: Json | null
          name: string
          progress: number | null
          start_date: string
          status: 'active' | 'archived' | 'completed' | 'in-progress' | 'planning'
          tech_stack: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: 'ai-ml' | 'desktop' | 'infrastructure' | 'mobile' | 'other' | 'web'
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description: string
          estimated_hours_invested?: number | null
          featured?: boolean
          id?: string
          last_updated: string
          long_description?: string | null
          monthly_cost?: number | null
          milestones?: Json | null
          name: string
          progress?: number | null
          start_date: string
          status?: 'active' | 'archived' | 'completed' | 'in-progress' | 'planning'
          tech_stack?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: 'ai-ml' | 'desktop' | 'infrastructure' | 'mobile' | 'other' | 'web'
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          estimated_hours_invested?: number | null
          featured?: boolean
          id?: string
          last_updated?: string
          milestones?: Json | null
          name?: string
          progress?: number | null
          start_date?: string
          status?: 'active' | 'archived' | 'completed' | 'in-progress' | 'planning'
          long_description?: string | null
          monthly_cost?: number | null
          tech_stack?: string[] | null
          updated_at?: string
          user_id?: string
        }
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
          total_assets: number | null
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
          total_assets?: number | null
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
          total_assets?: number | null
          updated_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      _: {
        Row: never
      }
    }
    Functions: {
      _: {
        Args: never
        Returns: never
      }
    }
    Enums: {
      _: {
        Values: never
      }
    }
  }
}
