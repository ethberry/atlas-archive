export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          like_count: number
          locator: string | null
          name: string
          parent_id: string | null
          visibility: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          like_count?: number
          locator?: string | null
          name: string
          parent_id?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          like_count?: number
          locator?: string | null
          name?: string
          parent_id?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "galaxies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "galaxies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "systems_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bodies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "bodies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pois_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "pois"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ships_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "ships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tools_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatures_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_ancestors: {
        Row: { ancestor_id: string; asset_id: string }
        Insert: { ancestor_id: string; asset_id: string }
        Update: { ancestor_id?: string; asset_id?: string }
        Relationships: []
      }
      asset_grants: {
        Row: { asset_id: string; user_id: string }
        Insert: { asset_id: string; user_id: string }
        Update: { asset_id?: string; user_id?: string }
        Relationships: []
      }
      likes: {
        Row: { asset_id: string; created_at: string; user_id: string }
        Insert: { asset_id: string; created_at?: string; user_id: string }
        Update: { asset_id?: string; created_at?: string; user_id?: string }
        Relationships: []
      }
      galaxies: {
        Row: { id: string }
        Insert: { id: string }
        Update: { id?: string }
        Relationships: [
          {
            foreignKeyName: "galaxies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      systems: {
        Row: {
          address: string
          conflict: string | null
          dissonance: boolean | null
          economy: string | null
          gas_giant: boolean | null
          id: string
          light_years: number
          population: string | null
          star: string
          station: string
          water: boolean | null
          wealth: string | null
        }
        Insert: {
          address: string
          conflict?: string | null
          dissonance?: boolean | null
          economy?: string | null
          gas_giant?: boolean | null
          id: string
          light_years: number
          population?: string | null
          star: string
          station: string
          water?: boolean | null
          wealth?: string | null
        }
        Update: {
          address?: string
          conflict?: string | null
          dissonance?: boolean | null
          economy?: string | null
          gas_giant?: boolean | null
          id?: string
          light_years?: number
          population?: string | null
          star?: string
          station?: string
          water?: boolean | null
          wealth?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "systems_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      bodies: {
        Row: {
          activated_stellar: boolean | null
          ancient_bones: boolean | null
          biome: number | null
          dissonance: boolean
          glyphs: string | null
          id: string
          phrase: string
          resources: string[]
          salvageable_scrap: boolean | null
          sentinels: string | null
        }
        Insert: {
          activated_stellar?: boolean | null
          ancient_bones?: boolean | null
          biome?: number | null
          dissonance?: boolean
          glyphs?: string | null
          id: string
          phrase?: string
          resources?: string[]
          salvageable_scrap?: boolean | null
          sentinels?: string | null
        }
        Update: {
          activated_stellar?: boolean | null
          ancient_bones?: boolean | null
          biome?: number | null
          dissonance?: boolean
          glyphs?: string | null
          id?: string
          phrase?: string
          resources?: string[]
          salvageable_scrap?: boolean | null
          sentinels?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bodies_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      pois: {
        Row: {
          building_type: string
          face: number | null
          i: number | null
          id: string
          j: number | null
        }
        Insert: {
          building_type: string
          face?: number | null
          i?: number | null
          id: string
          j?: number | null
        }
        Update: {
          building_type?: string
          face?: number | null
          i?: number | null
          id?: string
          j?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pois_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      ships: {
        Row: {
          class: string | null
          hull: string | null
          id: string
          supercharged: Json
        }
        Insert: {
          class?: string | null
          hull?: string | null
          id: string
          supercharged?: Json
        }
        Update: {
          class?: string | null
          hull?: string | null
          id?: string
          supercharged?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ships_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          body: string | null
          class: string | null
          id: string
          supercharged: Json
        }
        Insert: {
          body?: string | null
          class?: string | null
          id: string
          supercharged?: Json
        }
        Update: {
          body?: string | null
          class?: string | null
          id?: string
          supercharged?: Json
        }
        Relationships: [
          {
            foreignKeyName: "tools_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      creatures: {
        Row: {
          aggression: string | null
          helpfulness: string | null
          id: string
          independence: string | null
        }
        Insert: {
          aggression?: string | null
          helpfulness?: string | null
          id: string
          independence?: string | null
        }
        Update: {
          aggression?: string | null
          helpfulness?: string | null
          id?: string
          independence?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creatures_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "assets"
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
  public: {
    Enums: {},
  },
} as const
