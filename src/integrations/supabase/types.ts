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
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          avaliador_nome: string
          ciclo: string
          colaborador_nome: string
          comentario: string | null
          created_at: string | null
          d1: number | null
          d2: number | null
          d3: number | null
          d4: number | null
          d5: number | null
          i1: number | null
          i2: number | null
          i3: number | null
          i4: number | null
          i5: number | null
          id: string
          p1: number | null
          p2: number | null
          p3: number | null
          p4: number | null
          p5: number | null
          tipo_avaliador: string
        }
        Insert: {
          avaliador_nome: string
          ciclo?: string
          colaborador_nome: string
          comentario?: string | null
          created_at?: string | null
          d1?: number | null
          d2?: number | null
          d3?: number | null
          d4?: number | null
          d5?: number | null
          i1?: number | null
          i2?: number | null
          i3?: number | null
          i4?: number | null
          i5?: number | null
          id?: string
          p1?: number | null
          p2?: number | null
          p3?: number | null
          p4?: number | null
          p5?: number | null
          tipo_avaliador: string
        }
        Update: {
          avaliador_nome?: string
          ciclo?: string
          colaborador_nome?: string
          comentario?: string | null
          created_at?: string | null
          d1?: number | null
          d2?: number | null
          d3?: number | null
          d4?: number | null
          d5?: number | null
          i1?: number | null
          i2?: number | null
          i3?: number | null
          i4?: number | null
          i5?: number | null
          id?: string
          p1?: number | null
          p2?: number | null
          p3?: number | null
          p4?: number | null
          p5?: number | null
          tipo_avaliador?: string
        }
        Relationships: []
      }
      ciclos: {
        Row: {
          ativo: boolean
          created_at: string
          criado_por: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          criado_por?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          criado_por?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      declaracoes: {
        Row: {
          ciclo: string
          created_at: string
          declaracao: string | null
          id: string
          metas: string | null
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          ciclo?: string
          created_at?: string
          declaracao?: string | null
          id?: string
          metas?: string | null
          updated_at?: string
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          ciclo?: string
          created_at?: string
          declaracao?: string | null
          id?: string
          metas?: string | null
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      equipes: {
        Row: {
          ciclo: string
          colaborador_email: string
          colaborador_nome: string
          created_at: string
          id: string
          lider_email: string
          lider_nome: string
          lider_user_id: string
          updated_at: string
        }
        Insert: {
          ciclo?: string
          colaborador_email?: string
          colaborador_nome: string
          created_at?: string
          id?: string
          lider_email?: string
          lider_nome?: string
          lider_user_id: string
          updated_at?: string
        }
        Update: {
          ciclo?: string
          colaborador_email?: string
          colaborador_nome?: string
          created_at?: string
          id?: string
          lider_email?: string
          lider_nome?: string
          lider_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          ciclo: string
          created_at: string
          from_user_email: string
          from_user_id: string
          from_user_name: string
          id: string
          mensagem: string
          to_user_email: string
          to_user_name: string
        }
        Insert: {
          ciclo?: string
          created_at?: string
          from_user_email: string
          from_user_id: string
          from_user_name: string
          id?: string
          mensagem: string
          to_user_email: string
          to_user_name: string
        }
        Update: {
          ciclo?: string
          created_at?: string
          from_user_email?: string
          from_user_id?: string
          from_user_name?: string
          id?: string
          mensagem?: string
          to_user_email?: string
          to_user_name?: string
        }
        Relationships: []
      }
      janela_declaracoes: {
        Row: {
          ciclo: string
          created_at: string
          data_abertura: string
          data_fechamento: string
          id: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ciclo?: string
          created_at?: string
          data_abertura: string
          data_fechamento: string
          id?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          ciclo?: string
          created_at?: string
          data_abertura?: string
          data_fechamento?: string
          id?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "lideranca"
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
      app_role: ["admin", "lideranca"],
    },
  },
} as const
