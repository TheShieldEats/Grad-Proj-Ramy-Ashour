export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string;
          name: string;
          location: string;
          address: string | null;
          is_members_only: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          address?: string | null;
          is_members_only?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          address?: string | null;
          is_members_only?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      coach_schedules: {
        Row: {
          id: string;
          coach_id: string;
          branch_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          session_duration: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          coach_id: string;
          branch_id: string;
          day_of_week: string;
          start_time: string;
          end_time: string;
          session_duration?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          coach_id?: string;
          branch_id?: string;
          day_of_week?: string;
          start_time?: string;
          end_time?: string;
          session_duration?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coach_schedules_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coach_schedules_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      coach_sessions: {
        Row: {
          id: string;
          coach_id: string;
          player_id: string | null;
          branch_id: string;
          session_date: string;
          start_time: string;
          end_time: string;
          status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          coach_id: string;
          player_id?: string | null;
          branch_id: string;
          session_date: string;
          start_time: string;
          end_time: string;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          coach_id?: string;
          player_id?: string | null;
          branch_id?: string;
          session_date?: string;
          start_time?: string;
          end_time?: string;
          status?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coach_sessions_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coach_sessions_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coach_sessions_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      coaches: {
        Row: {
          availability: Json | null;
          bio: string | null;
          created_at: string | null;
          hourly_rate: number | null;
          id: string;
          specialization: string | null;
          updated_at: string | null;
          years_experience: number | null;
          recommended_level: number | null;
        };
        Insert: {
          availability?: Json | null;
          bio?: string | null;
          created_at?: string | null;
          hourly_rate?: number | null;
          id: string;
          specialization?: string | null;
          updated_at?: string | null;
          years_experience?: number | null;
          recommended_level?: number | null;
        };
        Update: {
          availability?: Json | null;
          bio?: string | null;
          created_at?: string | null;
          hourly_rate?: number | null;
          id?: string;
          specialization?: string | null;
          updated_at?: string | null;
          years_experience?: number | null;
          recommended_level?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "coaches_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      player_videos: {
        Row: {
          analysis_result: Json | null;
          coach_feedback: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          status: string | null;
          updated_at: string | null;
          user_id: string;
          video_url: string;
          recommended_level: number | null;
        };
        Insert: {
          analysis_result?: Json | null;
          coach_feedback?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          status?: string | null;
          updated_at?: string | null;
          user_id: string;
          video_url: string;
          recommended_level?: number | null;
        };
        Update: {
          analysis_result?: Json | null;
          coach_feedback?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string;
          video_url?: string;
          recommended_level?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "player_videos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          created_at: string | null;
          goals: string | null;
          id: string;
          skill_level: string | null;
          updated_at: string | null;
          years_playing: number | null;
          recommended_level: number | null;
          preferred_branch_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          goals?: string | null;
          id: string;
          skill_level?: string | null;
          updated_at?: string | null;
          years_playing?: number | null;
          recommended_level?: number | null;
          preferred_branch_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          goals?: string | null;
          id?: string;
          skill_level?: string | null;
          updated_at?: string | null;
          years_playing?: number | null;
          recommended_level?: number | null;
          preferred_branch_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "players_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "players_preferred_branch_id_fkey";
            columns: ["preferred_branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          credits: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          image: string | null;
          name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          subscription: string | null;
          token_identifier: string;
          updated_at: string | null;
          user_id: string | null;
          phone: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          credits?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          image?: string | null;
          name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          subscription?: string | null;
          token_identifier: string;
          updated_at?: string | null;
          user_id?: string | null;
          phone?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          credits?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          subscription?: string | null;
          token_identifier?: string;
          updated_at?: string | null;
          user_id?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "player" | "coach" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
