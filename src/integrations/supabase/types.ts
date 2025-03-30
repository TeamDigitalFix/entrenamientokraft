export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alimentos: {
        Row: {
          calorias: number
          carbohidratos: number
          categoria: string
          creado_en: string | null
          creado_por: string
          grasas: number
          id: string
          imagen_url: string | null
          nombre: string
          proteinas: number
        }
        Insert: {
          calorias: number
          carbohidratos: number
          categoria: string
          creado_en?: string | null
          creado_por: string
          grasas: number
          id?: string
          imagen_url?: string | null
          nombre: string
          proteinas: number
        }
        Update: {
          calorias?: number
          carbohidratos?: number
          categoria?: string
          creado_en?: string | null
          creado_por?: string
          grasas?: number
          id?: string
          imagen_url?: string | null
          nombre?: string
          proteinas?: number
        }
        Relationships: [
          {
            foreignKeyName: "alimentos_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_mensajes: {
        Row: {
          contenido: string
          creado_en: string | null
          emisor_id: string
          id: string
          leido: boolean | null
          receptor_id: string
        }
        Insert: {
          contenido: string
          creado_en?: string | null
          emisor_id: string
          id?: string
          leido?: boolean | null
          receptor_id: string
        }
        Update: {
          contenido?: string
          creado_en?: string | null
          emisor_id?: string
          id?: string
          leido?: boolean | null
          receptor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensajes_emisor_id_fkey"
            columns: ["emisor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mensajes_receptor_id_fkey"
            columns: ["receptor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      citas: {
        Row: {
          actualizado_en: string | null
          cliente_id: string
          creado_en: string | null
          descripcion: string | null
          duracion: number
          entrenador_id: string
          estado: string
          fecha: string
          id: string
          tipo: string | null
          titulo: string
        }
        Insert: {
          actualizado_en?: string | null
          cliente_id: string
          creado_en?: string | null
          descripcion?: string | null
          duracion: number
          entrenador_id: string
          estado: string
          fecha: string
          id?: string
          tipo?: string | null
          titulo: string
        }
        Update: {
          actualizado_en?: string | null
          cliente_id?: string
          creado_en?: string | null
          descripcion?: string | null
          duracion?: number
          entrenador_id?: string
          estado?: string
          fecha?: string
          id?: string
          tipo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      dieta_comidas: {
        Row: {
          alimento_id: string
          cantidad: number
          dia: number
          dieta_id: string
          id: string
          tipo_comida: string
        }
        Insert: {
          alimento_id: string
          cantidad: number
          dia: number
          dieta_id: string
          id?: string
          tipo_comida: string
        }
        Update: {
          alimento_id?: string
          cantidad?: number
          dia?: number
          dieta_id?: string
          id?: string
          tipo_comida?: string
        }
        Relationships: [
          {
            foreignKeyName: "dieta_comidas_alimento_id_fkey"
            columns: ["alimento_id"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dieta_comidas_dieta_id_fkey"
            columns: ["dieta_id"]
            isOneToOne: false
            referencedRelation: "dietas"
            referencedColumns: ["id"]
          },
        ]
      }
      dietas: {
        Row: {
          actualizado_en: string | null
          cliente_id: string
          creado_en: string | null
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          nombre: string
        }
        Insert: {
          actualizado_en?: string | null
          cliente_id: string
          creado_en?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          nombre: string
        }
        Update: {
          actualizado_en?: string | null
          cliente_id?: string
          creado_en?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "dietas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      distribucion_clientes: {
        Row: {
          cantidad: number
          categoria: string
          creado_en: string | null
          entrenador_id: string
          fecha_calculo: string
          id: string
          porcentaje: number | null
        }
        Insert: {
          cantidad: number
          categoria: string
          creado_en?: string | null
          entrenador_id: string
          fecha_calculo?: string
          id?: string
          porcentaje?: number | null
        }
        Update: {
          cantidad?: number
          categoria?: string
          creado_en?: string | null
          entrenador_id?: string
          fecha_calculo?: string
          id?: string
          porcentaje?: number | null
        }
        Relationships: []
      }
      distribucion_ejercicios: {
        Row: {
          cantidad: number
          creado_en: string | null
          entrenador_id: string
          fecha_calculo: string
          grupo_muscular: string
          id: string
          porcentaje: number | null
        }
        Insert: {
          cantidad: number
          creado_en?: string | null
          entrenador_id: string
          fecha_calculo?: string
          grupo_muscular: string
          id?: string
          porcentaje?: number | null
        }
        Update: {
          cantidad?: number
          creado_en?: string | null
          entrenador_id?: string
          fecha_calculo?: string
          grupo_muscular?: string
          id?: string
          porcentaje?: number | null
        }
        Relationships: []
      }
      ejercicios: {
        Row: {
          creado_en: string | null
          creado_por: string
          descripcion: string | null
          dificultad: string | null
          grupo_muscular: string
          id: string
          imagen_url: string | null
          nombre: string
          tipo: string | null
          video_url: string | null
        }
        Insert: {
          creado_en?: string | null
          creado_por: string
          descripcion?: string | null
          dificultad?: string | null
          grupo_muscular: string
          id?: string
          imagen_url?: string | null
          nombre: string
          tipo?: string | null
          video_url?: string | null
        }
        Update: {
          creado_en?: string | null
          creado_por?: string
          descripcion?: string | null
          dificultad?: string | null
          grupo_muscular?: string
          id?: string
          imagen_url?: string | null
          nombre?: string
          tipo?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ejercicios_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ejercicios_completados: {
        Row: {
          cliente_id: string
          fecha_completado: string | null
          id: string
          notas: string | null
          peso_usado: number | null
          repeticiones_realizadas: number
          rutina_ejercicio_id: string
          series_realizadas: number
        }
        Insert: {
          cliente_id: string
          fecha_completado?: string | null
          id?: string
          notas?: string | null
          peso_usado?: number | null
          repeticiones_realizadas: number
          rutina_ejercicio_id: string
          series_realizadas: number
        }
        Update: {
          cliente_id?: string
          fecha_completado?: string | null
          id?: string
          notas?: string | null
          peso_usado?: number | null
          repeticiones_realizadas?: number
          rutina_ejercicio_id?: string
          series_realizadas?: number
        }
        Relationships: [
          {
            foreignKeyName: "ejercicios_completados_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ejercicios_completados_rutina_ejercicio_id_fkey"
            columns: ["rutina_ejercicio_id"]
            isOneToOne: false
            referencedRelation: "rutina_ejercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      ejercicios_diarios: {
        Row: {
          cantidad: number
          cliente_id: string
          creado_en: string | null
          dia_semana: string
          entrenador_id: string
          fecha: string
          id: string
        }
        Insert: {
          cantidad: number
          cliente_id: string
          creado_en?: string | null
          dia_semana: string
          entrenador_id: string
          fecha: string
          id?: string
        }
        Update: {
          cantidad?: number
          cliente_id?: string
          creado_en?: string | null
          dia_semana?: string
          entrenador_id?: string
          fecha?: string
          id?: string
        }
        Relationships: []
      }
      estadisticas_cliente: {
        Row: {
          actualizado_en: string | null
          cambio_asistencia_porcentaje: number | null
          cambio_ejercicios_porcentaje: number | null
          cambio_sesiones_porcentaje: number | null
          cliente_id: string
          creado_en: string | null
          entrenador_id: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          periodo: string
          porcentaje_asistencia: number | null
          total_ejercicios: number | null
          total_sesiones: number | null
        }
        Insert: {
          actualizado_en?: string | null
          cambio_asistencia_porcentaje?: number | null
          cambio_ejercicios_porcentaje?: number | null
          cambio_sesiones_porcentaje?: number | null
          cliente_id: string
          creado_en?: string | null
          entrenador_id: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          periodo: string
          porcentaje_asistencia?: number | null
          total_ejercicios?: number | null
          total_sesiones?: number | null
        }
        Update: {
          actualizado_en?: string | null
          cambio_asistencia_porcentaje?: number | null
          cambio_ejercicios_porcentaje?: number | null
          cambio_sesiones_porcentaje?: number | null
          cliente_id?: string
          creado_en?: string | null
          entrenador_id?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          periodo?: string
          porcentaje_asistencia?: number | null
          total_ejercicios?: number | null
          total_sesiones?: number | null
        }
        Relationships: []
      }
      mensajes: {
        Row: {
          contenido: string
          creado_en: string | null
          emisor_id: string
          id: string
          leido: boolean | null
          receptor_id: string
        }
        Insert: {
          contenido: string
          creado_en?: string | null
          emisor_id: string
          id?: string
          leido?: boolean | null
          receptor_id: string
        }
        Update: {
          contenido?: string
          creado_en?: string | null
          emisor_id?: string
          id?: string
          leido?: boolean | null
          receptor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_emisor_id_fkey"
            columns: ["emisor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_receptor_id_fkey"
            columns: ["receptor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      progreso: {
        Row: {
          cliente_id: string
          creado_en: string | null
          fecha: string
          grasa_corporal: number | null
          id: string
          masa_muscular: number | null
          notas: string | null
          peso: number
        }
        Insert: {
          cliente_id: string
          creado_en?: string | null
          fecha: string
          grasa_corporal?: number | null
          id?: string
          masa_muscular?: number | null
          notas?: string | null
          peso: number
        }
        Update: {
          cliente_id?: string
          creado_en?: string | null
          fecha?: string
          grasa_corporal?: number | null
          id?: string
          masa_muscular?: number | null
          notas?: string | null
          peso?: number
        }
        Relationships: [
          {
            foreignKeyName: "progreso_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      progreso_periodo: {
        Row: {
          cliente_id: string
          creado_en: string | null
          entrenador_id: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          masa_muscular: number | null
          periodo: string
          peso: number | null
          porcentaje_grasa: number | null
        }
        Insert: {
          cliente_id: string
          creado_en?: string | null
          entrenador_id: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          masa_muscular?: number | null
          periodo: string
          peso?: number | null
          porcentaje_grasa?: number | null
        }
        Update: {
          cliente_id?: string
          creado_en?: string | null
          entrenador_id?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          masa_muscular?: number | null
          periodo?: string
          peso?: number | null
          porcentaje_grasa?: number | null
        }
        Relationships: []
      }
      rutina_ejercicios: {
        Row: {
          dia: number
          ejercicio_id: string
          id: string
          notas: string | null
          peso: number | null
          repeticiones: number
          rutina_id: string
          series: number
          tiempo_descanso: number | null
        }
        Insert: {
          dia: number
          ejercicio_id: string
          id?: string
          notas?: string | null
          peso?: number | null
          repeticiones: number
          rutina_id: string
          series: number
          tiempo_descanso?: number | null
        }
        Update: {
          dia?: number
          ejercicio_id?: string
          id?: string
          notas?: string | null
          peso?: number | null
          repeticiones?: number
          rutina_id?: string
          series?: number
          tiempo_descanso?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rutina_ejercicios_ejercicio_id_fkey"
            columns: ["ejercicio_id"]
            isOneToOne: false
            referencedRelation: "ejercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutina_ejercicios_rutina_id_fkey"
            columns: ["rutina_id"]
            isOneToOne: false
            referencedRelation: "rutinas"
            referencedColumns: ["id"]
          },
        ]
      }
      rutinas: {
        Row: {
          actualizado_en: string | null
          cliente_id: string
          creado_en: string | null
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          nombre: string
        }
        Insert: {
          actualizado_en?: string | null
          cliente_id: string
          creado_en?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          nombre: string
        }
        Update: {
          actualizado_en?: string | null
          cliente_id?: string
          creado_en?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "rutinas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      sesiones_diarias: {
        Row: {
          cliente_id: string
          completada: boolean | null
          creado_en: string | null
          dia_semana: string
          duracion_minutos: number | null
          entrenador_id: string
          fecha: string
          id: string
        }
        Insert: {
          cliente_id: string
          completada?: boolean | null
          creado_en?: string | null
          dia_semana: string
          duracion_minutos?: number | null
          entrenador_id: string
          fecha: string
          id?: string
        }
        Update: {
          cliente_id?: string
          completada?: boolean | null
          creado_en?: string | null
          dia_semana?: string
          duracion_minutos?: number | null
          entrenador_id?: string
          fecha?: string
          id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          actualizado_en: string | null
          creado_en: string | null
          eliminado: boolean | null
          email: string | null
          entrenador_id: string | null
          id: string
          nombre: string
          password: string
          role: string
          telefono: string | null
          ultimo_ingreso: string | null
          username: string
        }
        Insert: {
          actualizado_en?: string | null
          creado_en?: string | null
          eliminado?: boolean | null
          email?: string | null
          entrenador_id?: string | null
          id?: string
          nombre: string
          password: string
          role: string
          telefono?: string | null
          ultimo_ingreso?: string | null
          username: string
        }
        Update: {
          actualizado_en?: string | null
          creado_en?: string | null
          eliminado?: boolean | null
          email?: string | null
          entrenador_id?: string | null
          id?: string
          nombre?: string
          password?: string
          role?: string
          telefono?: string | null
          ultimo_ingreso?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_entrenador_id_fkey"
            columns: ["entrenador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insertar_medicion_progreso: {
        Args: {
          p_cliente_id: string
          p_peso: number
          p_grasa_corporal: number
          p_masa_muscular: number
          p_notas: string
          p_fecha: string
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
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

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
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
