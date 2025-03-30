
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type ToggleExerciseParams = {
  exerciseId: string;
  completed: boolean;
};

export const useExerciseToggle = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  const toggleExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, completed }: ToggleExerciseParams) => {
      if (!user?.id) {
        throw new Error("Usuario no autenticado");
      }

      setIsToggling(true);

      if (completed) {
        // If already completed, delete the record
        const { error } = await supabase
          .from("ejercicios_completados")
          .delete()
          .eq("cliente_id", user.id)
          .eq("rutina_ejercicio_id", exerciseId);

        if (error) throw error;
        return false;
      } else {
        // Get exercise details for the completion record
        const { data: exercise, error: exerciseError } = await supabase
          .from("rutina_ejercicios")
          .select("series, repeticiones, peso")
          .eq("id", exerciseId)
          .single();

        if (exerciseError) throw exerciseError;

        // Insert completion record
        const { error } = await supabase
          .from("ejercicios_completados")
          .insert({
            cliente_id: user.id,
            rutina_ejercicio_id: exerciseId,
            series_realizadas: exercise.series,
            repeticiones_realizadas: exercise.repeticiones,
            peso_usado: exercise.peso || null
          });

        if (error) throw error;
        return true;
      }
    },
    onSuccess: (_, variables) => {
      // Show success toast
      const message = variables.completed
        ? "Ejercicio desmarcado como completado"
        : "Ejercicio marcado como completado";
      toast.success(message);

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["client-dashboard", "exercises"] });
      queryClient.invalidateQueries({ queryKey: ["client-routine"] });
      
      setIsToggling(false);
    },
    onError: (error) => {
      console.error("Error toggling exercise completion:", error);
      toast.error("No se pudo actualizar el estado del ejercicio");
      setIsToggling(false);
    },
  });

  const toggleExerciseCompletion = (params: ToggleExerciseParams) => {
    toggleExerciseMutation.mutate(params);
  };

  return {
    toggleExerciseCompletion,
    isToggling: isToggling || toggleExerciseMutation.isPending,
  };
};
