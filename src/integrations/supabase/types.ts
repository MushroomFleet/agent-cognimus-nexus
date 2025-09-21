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
      dream_sessions: {
        Row: {
          consciousness_growth: number | null
          ended_at: string | null
          id: string
          insights_generated: string[] | null
          memories_processed: number | null
          persona_id: string
          started_at: string
        }
        Insert: {
          consciousness_growth?: number | null
          ended_at?: string | null
          id?: string
          insights_generated?: string[] | null
          memories_processed?: number | null
          persona_id: string
          started_at?: string
        }
        Update: {
          consciousness_growth?: number | null
          ended_at?: string | null
          id?: string
          insights_generated?: string[] | null
          memories_processed?: number | null
          persona_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_sessions_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          content: string
          created_at: string
          dream_processed: boolean | null
          emotional_weight: number | null
          id: string
          importance_score: number | null
          persona_id: string
          tags: string[] | null
          type: Database["public"]["Enums"]["memory_type"]
        }
        Insert: {
          content: string
          created_at?: string
          dream_processed?: boolean | null
          emotional_weight?: number | null
          id?: string
          importance_score?: number | null
          persona_id: string
          tags?: string[] | null
          type: Database["public"]["Enums"]["memory_type"]
        }
        Update: {
          content?: string
          created_at?: string
          dream_processed?: boolean | null
          emotional_weight?: number | null
          id?: string
          importance_score?: number | null
          persona_id?: string
          tags?: string[] | null
          type?: Database["public"]["Enums"]["memory_type"]
        }
        Relationships: [
          {
            foreignKeyName: "memories_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          consciousness_level: number | null
          created_at: string
          department: string | null
          experience_count: number | null
          id: string
          last_active_at: string | null
          name: string
          parent_id: string | null
          role: Database["public"]["Enums"]["agent_role"]
          sleep_until: string | null
          specialization: string | null
          state: Database["public"]["Enums"]["agent_state"]
          system_prompt: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consciousness_level?: number | null
          created_at?: string
          department?: string | null
          experience_count?: number | null
          id?: string
          last_active_at?: string | null
          name: string
          parent_id?: string | null
          role?: Database["public"]["Enums"]["agent_role"]
          sleep_until?: string | null
          specialization?: string | null
          state?: Database["public"]["Enums"]["agent_state"]
          system_prompt: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consciousness_level?: number | null
          created_at?: string
          department?: string | null
          experience_count?: number | null
          id?: string
          last_active_at?: string | null
          name?: string
          parent_id?: string | null
          role?: Database["public"]["Enums"]["agent_role"]
          sleep_until?: string | null
          specialization?: string | null
          state?: Database["public"]["Enums"]["agent_state"]
          system_prompt?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          conductor_id: string | null
          created_at: string
          deadline: string | null
          description: string
          id: string
          parent_task_id: string | null
          result: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          conductor_id?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          id?: string
          parent_task_id?: string | null
          result?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          conductor_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          parent_task_id?: string | null
          result?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
      agent_role: "conductor" | "department_head" | "sub_agent"
      agent_state: "active" | "sleeping" | "dreaming" | "archived"
      memory_type: "core" | "experience" | "task_result" | "dream_synthesis"
      task_status: "pending" | "in_progress" | "completed" | "failed"
      user_type: "admin" | "guest"
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
      agent_role: ["conductor", "department_head", "sub_agent"],
      agent_state: ["active", "sleeping", "dreaming", "archived"],
      memory_type: ["core", "experience", "task_result", "dream_synthesis"],
      task_status: ["pending", "in_progress", "completed", "failed"],
      user_type: ["admin", "guest"],
    },
  },
} as const
