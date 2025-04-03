
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Alimento {
  id: string;
  nombre: string;
  categoria: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  imagen_url: string | null;
  creado_por: string;
  creado_en: string | null;
}

export interface NuevoAlimento {
  nombre: string;
  categoria: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  imagen_url?: string | null;
}

export const useAlimentos = (entrenadorId: string) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener alimentos de todos los entrenadores
  const { data: alimentos, isLoading } = useQuery({
    queryKey: ["alimentos"],
    queryFn: async () => {
      // Skip the query if entrenadorId is empty
      if (!entrenadorId) {
        return [];
      }

      const { data, error } = await supabase
        .from("alimentos")
        .select("*")
        .order("nombre");

      if (error) {
        console.error("Error al obtener alimentos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los alimentos",
          variant: "destructive",
        });
        throw error;
      }

      return data as Alimento[];
    },
  });

  // Filtrar alimentos según el término de búsqueda
  const filteredAlimentos = alimentos?.filter(
    (alimento) =>
      alimento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alimento.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear alimento
  const { mutate: crearAlimento } = useMutation({
    mutationFn: async (nuevoAlimento: NuevoAlimento) => {
      const { data, error } = await supabase
        .from("alimentos")
        .insert([
          {
            ...nuevoAlimento,
            creado_por: entrenadorId,
          },
        ])
        .select();

      if (error) {
        console.error("Error al crear alimento:", error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Alimento creado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["alimentos"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el alimento",
        variant: "destructive",
      });
    },
  });

  // Actualizar alimento
  const { mutate: actualizarAlimento } = useMutation({
    mutationFn: async ({ id, ...alimento }: Partial<Alimento>) => {
      const { data, error } = await supabase
        .from("alimentos")
        .update(alimento)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error al actualizar alimento:", error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Alimento actualizado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["alimentos"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el alimento",
        variant: "destructive",
      });
    },
  });

  // Verificar si un alimento está en uso
  const verificarAlimentoEnUso = async (id: string) => {
    const { data, error } = await supabase
      .from("dieta_comidas")
      .select("id")
      .eq("alimento_id", id)
      .limit(1);

    if (error) {
      console.error("Error al verificar uso de alimento:", error);
      throw error;
    }

    return data && data.length > 0;
  };

  // Eliminar alimento
  const { mutate: eliminarAlimento } = useMutation({
    mutationFn: async (id: string) => {
      // Verificar si el alimento está siendo utilizado en alguna dieta
      const enUso = await verificarAlimentoEnUso(id);
      
      if (enUso) {
        throw new Error("El alimento está siendo utilizado en una o más dietas. No se puede eliminar.");
      }

      const { error } = await supabase
        .from("alimentos")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar alimento:", error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Alimento eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["alimentos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el alimento",
        variant: "destructive",
      });
    },
  });

  return {
    alimentos,
    filteredAlimentos,
    isLoading,
    searchTerm,
    setSearchTerm,
    crearAlimento,
    actualizarAlimento,
    eliminarAlimento,
    verificarAlimentoEnUso,
  };
};
