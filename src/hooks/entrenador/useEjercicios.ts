
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ejercicio, NuevoEjercicio } from "@/types/ejercicios";
import { useToast } from "@/hooks/use-toast";

export const useEjercicios = (entrenadorId: string) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener ejercicios
  const { data: ejercicios, isLoading } = useQuery({
    queryKey: ["ejercicios", entrenadorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ejercicios")
        .select("*")
        .eq("creado_por", entrenadorId)
        .order("nombre");

      if (error) {
        console.error("Error al obtener ejercicios:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los ejercicios",
          variant: "destructive",
        });
        throw error;
      }

      return data as Ejercicio[];
    },
  });

  // Filtrar ejercicios según el término de búsqueda
  const filteredEjercicios = ejercicios?.filter(
    (ejercicio) =>
      ejercicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ejercicio.grupo_muscular.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear ejercicio
  const { mutate: crearEjercicio } = useMutation({
    mutationFn: async (nuevoEjercicio: NuevoEjercicio) => {
      const { data, error } = await supabase
        .from("ejercicios")
        .insert([
          {
            ...nuevoEjercicio,
            creado_por: entrenadorId,
          },
        ])
        .select();

      if (error) {
        console.error("Error al crear ejercicio:", error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Ejercicio creado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["ejercicios"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el ejercicio",
        variant: "destructive",
      });
    },
  });

  // Actualizar ejercicio
  const { mutate: actualizarEjercicio } = useMutation({
    mutationFn: async ({ id, ...ejercicio }: Partial<Ejercicio>) => {
      const { data, error } = await supabase
        .from("ejercicios")
        .update(ejercicio)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error al actualizar ejercicio:", error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Ejercicio actualizado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["ejercicios"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el ejercicio",
        variant: "destructive",
      });
    },
  });

  // Eliminar ejercicio
  const { mutate: eliminarEjercicio } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ejercicios")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar ejercicio:", error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Ejercicio eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["ejercicios"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el ejercicio",
        variant: "destructive",
      });
    },
  });

  return {
    ejercicios,
    filteredEjercicios,
    isLoading,
    searchTerm,
    setSearchTerm,
    crearEjercicio,
    actualizarEjercicio,
    eliminarEjercicio,
  };
};
