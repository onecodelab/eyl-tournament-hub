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
      match_events: {
        Row: {
          created_at: string
          created_by: string | null
          details: Json | null
          event_type: string
          id: string
          match_id: string
          minute: number
          player_id: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          details?: Json | null
          event_type: string
          id?: string
          match_id: string
          minute: number
          player_id?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          match_id?: string
          minute?: number
          player_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_lineups: {
        Row: {
          created_at: string
          goalkeeper_id: string | null
          id: string
          match_id: string
          player_ids: string[] | null
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goalkeeper_id?: string | null
          id?: string
          match_id: string
          player_ids?: string[] | null
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goalkeeper_id?: string | null
          id?: string
          match_id?: string
          player_ids?: string[] | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_lineups_goalkeeper_id_fkey"
            columns: ["goalkeeper_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_lineups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_reports: {
        Row: {
          assistant_referee_1: string | null
          assistant_referee_2: string | null
          attendance: number | null
          away_coach: string | null
          centre_referee: string | null
          created_at: string
          fourth_official: string | null
          half_time_away: number | null
          half_time_home: number | null
          home_coach: string | null
          id: string
          match_commissioner: string | null
          match_id: string
          notes: string | null
          referee_id: string
          submitted_at: string
          weather: string | null
        }
        Insert: {
          assistant_referee_1?: string | null
          assistant_referee_2?: string | null
          attendance?: number | null
          away_coach?: string | null
          centre_referee?: string | null
          created_at?: string
          fourth_official?: string | null
          half_time_away?: number | null
          half_time_home?: number | null
          home_coach?: string | null
          id?: string
          match_commissioner?: string | null
          match_id: string
          notes?: string | null
          referee_id: string
          submitted_at?: string
          weather?: string | null
        }
        Update: {
          assistant_referee_1?: string | null
          assistant_referee_2?: string | null
          attendance?: number | null
          away_coach?: string | null
          centre_referee?: string | null
          created_at?: string
          fourth_official?: string | null
          half_time_away?: number | null
          half_time_home?: number | null
          home_coach?: string | null
          id?: string
          match_commissioner?: string | null
          match_id?: string
          notes?: string | null
          referee_id?: string
          submitted_at?: string
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          created_at: string
          extra_time_option: string | null
          home_score: number | null
          home_team_id: string | null
          id: string
          match_date: string | null
          referee_id: string | null
          stage: string | null
          status: string | null
          tagline: string | null
          tournament_id: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          extra_time_option?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          match_date?: string | null
          referee_id?: string | null
          stage?: string | null
          status?: string | null
          tagline?: string | null
          tournament_id?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          extra_time_option?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          match_date?: string | null
          referee_id?: string | null
          stage?: string | null
          status?: string | null
          tagline?: string | null
          tournament_id?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string | null
          title: string
          tournament_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          title: string
          tournament_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          title?: string
          tournament_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          appearances: number | null
          assists: number | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          fayda_number: string | null
          goals: number | null
          height: number | null
          id: string
          jersey_number: number | null
          joined_date: string | null
          name: string
          nationality: string | null
          photo_url: string | null
          position: string | null
          preferred_foot: string | null
          social_instagram: string | null
          social_twitter: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          appearances?: number | null
          assists?: number | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          fayda_number?: string | null
          goals?: number | null
          height?: number | null
          id?: string
          jersey_number?: number | null
          joined_date?: string | null
          name: string
          nationality?: string | null
          photo_url?: string | null
          position?: string | null
          preferred_foot?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          appearances?: number | null
          assists?: number | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          fayda_number?: string | null
          goals?: number | null
          height?: number | null
          id?: string
          jersey_number?: number | null
          joined_date?: string | null
          name?: string
          nationality?: string | null
          photo_url?: string | null
          position?: string | null
          preferred_foot?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          position: string | null
          type: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          position?: string | null
          type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          position?: string | null
          type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          coach: string | null
          created_at: string
          draws: number | null
          founded_year: number | null
          goals_against: number | null
          goals_for: number | null
          group_name: string | null
          id: string
          logo_url: string | null
          losses: number | null
          name: string
          points: number | null
          short_name: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_tiktok: string | null
          social_twitter: string | null
          stadium: string | null
          tournament_id: string | null
          updated_at: string
          website_url: string | null
          wins: number | null
        }
        Insert: {
          coach?: string | null
          created_at?: string
          draws?: number | null
          founded_year?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_name?: string | null
          id?: string
          logo_url?: string | null
          losses?: number | null
          name: string
          points?: number | null
          short_name?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          stadium?: string | null
          tournament_id?: string | null
          updated_at?: string
          website_url?: string | null
          wins?: number | null
        }
        Update: {
          coach?: string | null
          created_at?: string
          draws?: number | null
          founded_year?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_name?: string | null
          id?: string
          logo_url?: string | null
          losses?: number | null
          name?: string
          points?: number | null
          short_name?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_twitter?: string | null
          stadium?: string | null
          tournament_id?: string | null
          updated_at?: string
          website_url?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_admins: {
        Row: {
          created_at: string
          id: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_admins_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          age_category: string | null
          created_at: string
          description: string | null
          end_date: string | null
          extra_time_duration_minutes: number | null
          format: string | null
          half_time_duration_minutes: number | null
          id: string
          logo_url: string | null
          match_duration_minutes: number | null
          max_substitutions: number | null
          max_teams: number | null
          name: string
          num_groups: number | null
          penalty_shootout: boolean | null
          start_date: string | null
          status: string | null
          teams_per_group: number | null
          teams_qualifying_per_group: number | null
          updated_at: string
          winner_team_id: string | null
        }
        Insert: {
          age_category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          extra_time_duration_minutes?: number | null
          format?: string | null
          half_time_duration_minutes?: number | null
          id?: string
          logo_url?: string | null
          match_duration_minutes?: number | null
          max_substitutions?: number | null
          max_teams?: number | null
          name: string
          num_groups?: number | null
          penalty_shootout?: boolean | null
          start_date?: string | null
          status?: string | null
          teams_per_group?: number | null
          teams_qualifying_per_group?: number | null
          updated_at?: string
          winner_team_id?: string | null
        }
        Update: {
          age_category?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          extra_time_duration_minutes?: number | null
          format?: string | null
          half_time_duration_minutes?: number | null
          id?: string
          logo_url?: string | null
          match_duration_minutes?: number | null
          max_substitutions?: number | null
          max_teams?: number | null
          name?: string
          num_groups?: number | null
          penalty_shootout?: boolean | null
          start_date?: string | null
          status?: string | null
          teams_per_group?: number | null
          teams_qualifying_per_group?: number | null
          updated_at?: string
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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
          role: Database["public"]["Enums"]["app_role"]
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
      videos: {
        Row: {
          created_at: string
          id: string
          is_featured: boolean | null
          published_at: string | null
          thumbnail_url: string | null
          title: string
          tournament_id: string | null
          updated_at: string
          views_count: number | null
          youtube_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          tournament_id?: string | null
          updated_at?: string
          views_count?: number | null
          youtube_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          tournament_id?: string | null
          updated_at?: string
          views_count?: number | null
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_team: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      get_player_appearances: { Args: { p_player_id: string }; Returns: number }
      get_player_assist_count: {
        Args: { p_player_id: string }
        Returns: number
      }
      get_player_goal_count: { Args: { p_player_id: string }; Returns: number }
      get_player_stats: {
        Args: { p_player_id: string }
        Returns: {
          appearances: number
          assists: number
          goals: number
        }[]
      }
      get_referees_with_email: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          role: string
          user_id: string
        }[]
      }
      get_user_email: { Args: { _user_id: string }; Returns: string }
      get_user_tournaments: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_tournament_admin: {
        Args: { _tournament_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "referee" | "user" | "tho_admin"
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
      app_role: ["admin", "referee", "user", "tho_admin"],
    },
  },
} as const
