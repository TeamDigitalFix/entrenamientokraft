
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
