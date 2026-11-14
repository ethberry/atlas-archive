
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "asset_ancestors": {
                  Row: {
                    "ancestor_id": string,"asset_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ancestor_id": string,"asset_id": string
                  }
                  Update: {
                    "ancestor_id"?: string,"asset_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "asset_ancestors_ancestor_id_fkey"
      columns: ["ancestor_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "asset_ancestors_asset_id_fkey"
      columns: ["asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"asset_grants": {
                  Row: {
                    "asset_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "asset_id": string,"user_id": string
                  }
                  Update: {
                    "asset_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "asset_grants_asset_id_fkey"
      columns: ["asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"asset_images": {
                  Row: {
                    "asset_id": string,"created_at": string,"id": string,"is_verified": boolean,"object_path": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "asset_id": string,"created_at"?: string,"id"?: string,"is_verified"?: boolean,"object_path": string,"user_id": string
                  }
                  Update: {
                    "asset_id"?: string,"created_at"?: string,"id"?: string,"is_verified"?: boolean,"object_path"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "asset_images_asset_id_fkey"
      columns: ["asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"assets": {
                  Row: {
                    "created_at": string,"created_by": string | null,"id": string,"kind": string,"locator": string | null,"name": string,"parent_id": string | null,"visibility": string,"like_count": number | null
                  }
                  ComputedFields: "like_count"
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"kind": string,"locator"?: string | null,"name": string,"parent_id"?: string | null,"visibility"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"kind"?: string,"locator"?: string | null,"name"?: string,"parent_id"?: string | null,"visibility"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "assets_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"bodies": {
                  Row: {
                    "activated_stellar": boolean,"ancient_bones": boolean | null,"biome": number,"dissonance": boolean,"gas_giant": boolean,"id": string,"resources": (string)[],"salvageable_scrap": boolean,"sentinels": string,"water": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "activated_stellar": boolean,"ancient_bones"?: boolean | null,"biome": number,"dissonance"?: boolean,"gas_giant": boolean,"id": string,"resources"?: (string)[],"salvageable_scrap": boolean,"sentinels": string,"water": boolean
                  }
                  Update: {
                    "activated_stellar"?: boolean,"ancient_bones"?: boolean | null,"biome"?: number,"dissonance"?: boolean,"gas_giant"?: boolean,"id"?: string,"resources"?: (string)[],"salvageable_scrap"?: boolean,"sentinels"?: string,"water"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "bodies_id_fkey"
      columns: ["id"]
isOneToOne: true
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"creatures": {
                  Row: {
                    "active_time": string,"affinity": string,"agility": string,"combat": string,"habitat": string,"health": string,"id": string,"verified": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "active_time": string,"affinity": string,"agility": string,"combat": string,"habitat": string,"health": string,"id": string,"verified"?: boolean
                  }
                  Update: {
                    "active_time"?: string,"affinity"?: string,"agility"?: string,"combat"?: string,"habitat"?: string,"health"?: string,"id"?: string,"verified"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "creatures_id_fkey"
      columns: ["id"]
isOneToOne: true
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"galaxies": {
                  Row: {
                    "featured": number | null,"id": string,"index": number,"type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "featured"?: number | null,"id": string,"index": number,"type": string
                  }
                  Update: {
                    "featured"?: number | null,"id"?: string,"index"?: number,"type"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "galaxies_id_fkey"
      columns: ["id"]
isOneToOne: true
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"likes": {
                  Row: {
                    "asset_id": string,"created_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "asset_id": string,"created_at"?: string,"user_id": string
                  }
                  Update: {
                    "asset_id"?: string,"created_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "likes_asset_id_fkey"
      columns: ["asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"poi_items": {
                  Row: {
                    "entry_planet": string | null,"entry_station": boolean,"item_id": string,"poi_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "entry_planet"?: string | null,"entry_station"?: boolean,"item_id": string,"poi_id": string
                  }
                  Update: {
                    "entry_planet"?: string | null,"entry_station"?: boolean,"item_id"?: string,"poi_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "poi_items_entry_planet_fkey"
      columns: ["entry_planet"]
isOneToOne: false
      referencedRelation: "bodies"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "poi_items_item_id_fkey"
      columns: ["item_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "poi_items_poi_id_fkey"
      columns: ["poi_id"]
isOneToOne: false
      referencedRelation: "pois"
      referencedColumns: ["id"]
    }
                  ]
                },"pois": {
                  Row: {
                    "building_type": string,"id": string,"latitude": number | null,"longitude": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "building_type": string,"id": string,"latitude"?: number | null,"longitude"?: number | null
                  }
                  Update: {
                    "building_type"?: string,"id"?: string,"latitude"?: number | null,"longitude"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "pois_id_fkey"
      columns: ["id"]
isOneToOne: true
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"search_requests": {
                  Row: {
                    "choice": NonNullable<Json>,"created_at": string,"form_key": string | null,"id": string,"kind": string,"paint": NonNullable<Json>,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "choice": NonNullable<Json>,"created_at"?: string,"form_key"?: never,"id"?: string,"kind": string,"paint": NonNullable<Json>,"user_id": string
                  }
                  Update: {
                    "choice"?: NonNullable<Json>,"created_at"?: string,"form_key"?: never,"id"?: string,"kind"?: string,"paint"?: NonNullable<Json>,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"ships": {
                  Row: {
                    "base_agile": number | null,"base_damage": number | null,"base_hyperdrive": number | null,"base_shield": number | null,"class": string,"hull": string,"id": string,"model_draw_1": number | null,"model_draw_2": number | null,"natural_supercharged": Json | null,"supercharged": NonNullable<Json>,"verified": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "base_agile"?: number | null,"base_damage"?: number | null,"base_hyperdrive"?: number | null,"base_shield"?: number | null,"class": string,"hull": string,"id": string,"model_draw_1"?: number | null,"model_draw_2"?: number | null,"natural_supercharged"?: Json | null,"supercharged"?: NonNullable<Json>,"verified"?: boolean
                  }
                  Update: {
                    "base_agile"?: number | null,"base_damage"?: number | null,"base_hyperdrive"?: number | null,"base_shield"?: number | null,"class"?: string,"hull"?: string,"id"?: string,"model_draw_1"?: number | null,"model_draw_2"?: number | null,"natural_supercharged"?: Json | null,"supercharged"?: NonNullable<Json>,"verified"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "ships_id_fkey"
      columns: ["id"]
isOneToOne: true
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"systems": {
                  Row: {
                    "address": string,"asteroid_belts": number,"conflict": string | null,"dissonance": boolean,"economy": string | null,"gas_giant": boolean,"hulks": number,"ice_fields": number,"id": string,"light_years": number,"population": string,"relic_gate": boolean,"star": string,"station": string,"water": boolean,"wealth": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address": string,"asteroid_belts"?: number,"conflict"?: string | null,"dissonance": boolean,"economy"?: string | null,"gas_giant": boolean,"hulks"?: number,"ice_fields"?: number,"id": string,"light_years": number,"population": string,"relic_gate"?: boolean,"star": string,"station": string,"water": boolean,"wealth"?: string | null
                  }
                  Update: {
                    "address"?: string,"asteroid_belts"?: number,"conflict"?: string | null,"dissonance"?: boolean,"economy"?: string | null,"gas_giant"?: boolean,"hulks"?: number,"ice_fields"?: number,"id"?: string,"light_years"?: number,"population"?: string,"relic_gate"?: boolean,"star"?: string,"station"?: string,"water"?: boolean,"wealth"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "systems_id_fkey"
      columns: ["id"]
isOneToOne: true
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                },"tools": {
                  Row: {
                    "base_damage": number | null,"base_mining": number | null,"base_scanner": number | null,"body": string,"class": string,"head_item": string | null,"head_sold_here": boolean | null,"id": string,"natural_supercharged": NonNullable<Json>,"supercharged": NonNullable<Json>,"verified": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "base_damage"?: number | null,"base_mining"?: number | null,"base_scanner"?: number | null,"body": string,"class": string,"head_item"?: string | null,"head_sold_here"?: boolean | null,"id": string,"natural_supercharged"?: NonNullable<Json>,"supercharged"?: NonNullable<Json>,"verified"?: boolean
                  }
                  Update: {
                    "base_damage"?: number | null,"base_mining"?: number | null,"base_scanner"?: number | null,"body"?: string,"class"?: string,"head_item"?: string | null,"head_sold_here"?: boolean | null,"id"?: string,"natural_supercharged"?: NonNullable<Json>,"supercharged"?: NonNullable<Json>,"verified"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "tools_id_fkey"
      columns: ["id"]
isOneToOne: true
      referencedRelation: "assets"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "can_read_asset":
{ Args: { "target": string }; Returns: boolean
                           },
"like_count":
{ Args: { "asset": Omit<Database["public"]['Tables']["assets"]['Row'], Database["public"]['Tables']["assets"]['ComputedFields']> }; Returns: number
                           },
"rebuild_ancestors":
{ Args: { "target": string }; Returns: undefined
                           },
"show_limit":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"show_trgm":
{ Args: { "": string }; Returns: (string)[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
