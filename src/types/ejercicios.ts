
export interface Ejercicio {
  id: string;
  nombre: string;
  grupo_muscular: string;
  descripcion: string | null;
  imagen_url: string | null;
  video_url: string | null;
  creado_por: string;
  creado_en: string | null;
  dificultad?: string;
  tipo?: string;
  // Campos adicionales para los ejercicios en rutinas
  dia?: number;
  series?: number;
  repeticiones?: number;
  peso?: string | number | null; // Modificado para aceptar tanto string como number
  rutina_id?: string;
  ejercicio_id?: string;
  notas?: string | null;
  ejercicios?: {
    nombre: string;
    grupo_muscular: string;
    descripcion?: string | null;
  };
}

export interface NuevoEjercicio {
  nombre: string;
  grupo_muscular: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  video_url?: string | null;
  dificultad?: string;
  tipo?: string;
}
