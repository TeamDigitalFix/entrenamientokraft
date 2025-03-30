
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ToggleMealParams = {
  mealId: string;
  completed: boolean;
  clientId: string; // We keep this parameter for compatibility
};

type ToggleMealTypeParams = {
  mealIds: string[];
  completed: boolean;
  clientId: string; // We keep this parameter for compatibility
};

export const useMealToggle = () => {
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  const toggleMealMutation = useMutation({
    mutationFn: async ({ mealId, completed, clientId }: ToggleMealParams) => {
      setIsToggling(true);

      if (completed) {
        // Si está completada, la desmarcamos (eliminamos el registro)
        const { error } = await supabase
          .from("comidas_completadas")
          .delete()
          .eq("dieta_comida_id", mealId);

        if (error) {
          console.error("Error al desmarcar comida:", error);
          throw error;
        }
      } else {
        // Si no está completada, la marcamos (insertamos un registro)
        const { error } = await supabase
          .from("comidas_completadas")
          .insert({
            cliente_id: clientId, // We still need to provide a value for this field
            dieta_comida_id: mealId
          });

        if (error) {
          console.error("Error al marcar comida:", error);
          throw error;
        }
      }
      
      return !completed;
    },
    onSuccess: (_, variables) => {
      // Show success toast
      const message = variables.completed
        ? "Comida desmarcada como completada"
        : "Comida marcada como completada";
      toast.success(message);

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["client-dashboard", "meals"] });
      queryClient.invalidateQueries({ queryKey: ["client-diet"] });
      
      setIsToggling(false);
    },
    onError: (error) => {
      console.error("Error toggling meal completion:", error);
      toast.error("No se pudo actualizar el estado de la comida");
      setIsToggling(false);
    },
  });

  // Simplified version of the mutation for meal types
  const toggleMealTypeMutation = useMutation({
    mutationFn: async ({ mealIds, completed, clientId }: ToggleMealTypeParams) => {
      if (mealIds.length === 0) {
        throw new Error("No hay comidas seleccionadas");
      }

      setIsToggling(true);

      // Process all meals in the meal type
      if (completed) {
        // If they're completed, unmark them all (delete records)
        const { error } = await supabase
          .from("comidas_completadas")
          .delete()
          .in("dieta_comida_id", mealIds);

        if (error) {
          console.error("Error al desmarcar comidas:", error);
          throw error;
        }
      } else {
        // If they're not completed, mark them all (insert records)
        const recordsToInsert = mealIds.map(mealId => ({
          cliente_id: clientId, // Still needed for the database schema
          dieta_comida_id: mealId
        }));

        const { error } = await supabase
          .from("comidas_completadas")
          .insert(recordsToInsert);

        if (error) {
          console.error("Error al marcar comidas:", error);
          throw error;
        }
      }
      
      return !completed;
    },
    onSuccess: (_, variables) => {
      // Show success toast
      const message = variables.completed
        ? "Comidas desmarcadas como completadas"
        : "Comidas marcadas como completadas";
      toast.success(message);

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["client-dashboard", "meals"] });
      queryClient.invalidateQueries({ queryKey: ["client-diet"] });
      
      setIsToggling(false);
    },
    onError: (error) => {
      console.error("Error toggling meal type completion:", error);
      toast.error("No se pudo actualizar el estado de las comidas");
      setIsToggling(false);
    },
  });

  const toggleMealCompletion = (params: ToggleMealParams) => {
    toggleMealMutation.mutate(params);
  };

  const toggleMealTypeCompletion = (params: ToggleMealTypeParams) => {
    toggleMealTypeMutation.mutate(params);
  };

  return {
    toggleMealCompletion,
    toggleMealTypeCompletion,
    isToggling: isToggling || toggleMealMutation.isPending || toggleMealTypeMutation.isPending,
  };
};
