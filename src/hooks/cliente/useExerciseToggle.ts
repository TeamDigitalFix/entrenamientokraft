
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const useExerciseToggle = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const clientId = user?.id;

  const { mutate: toggleExerciseCompletion, isPending } = useMutation({
    mutationFn: async ({ 
      exerciseId, 
      completed 
    }: { 
      exerciseId: string; 
      completed: boolean;
    }) => {
      if (!clientId) throw new Error("Usuario no autenticado");

      if (completed) {
        // If already completed, delete the record
        const { error } = await supabase
          .from("ejercicios_completados")
          .delete()
          .eq("cliente_id", clientId)
          .eq("rutina_ejercicio_id", exerciseId);

        if (error) throw error;
      } else {
        // If not completed, create a record
        const { error } = await supabase
          .from("ejercicios_completados")
          .insert({
            cliente_id: clientId,
            rutina_ejercicio_id: exerciseId,
            series_realizadas: 0, // These would be updated later with actual values
            repeticiones_realizadas: 0
          });

        if (error) throw error;
      }

      return { exerciseId, completed: !completed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-routine", clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-dashboard", "exercises"] });
      toast.success(
        data.completed 
          ? "Ejercicio marcado como completado" 
          : "Ejercicio marcado como no completado"
      );
    },
    onError: (error) => {
      console.error("Error al actualizar estado del ejercicio:", error);
      toast.error("No se pudo actualizar el estado del ejercicio");
    },
  });

  return {
    toggleExerciseCompletion,
    isPending
  };
};
