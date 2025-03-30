
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ToggleMealParams = {
  mealId: string;
  completed: boolean;
  clientId: string; // Now we'll pass the client ID directly
};

type ToggleMealTypeParams = {
  mealIds: string[];
  completed: boolean;
  clientId: string; // Now we'll pass the client ID directly
};

export const useMealToggle = () => {
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  const toggleMealMutation = useMutation({
    mutationFn: async ({ mealId, completed, clientId }: ToggleMealParams) => {
      if (!clientId) {
        throw new Error("ID de cliente no proporcionado");
      }

      setIsToggling(true);

      if (completed) {
        // Si está completada, la desmarcamos (eliminamos el registro)
        const { error } = await supabase
          .from("comidas_completadas")
          .delete()
          .eq("cliente_id", clientId)
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
            cliente_id: clientId,
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

  // New mutation to toggle all meals in a meal type
  const toggleMealTypeMutation = useMutation({
    mutationFn: async ({ mealIds, completed, clientId }: ToggleMealTypeParams) => {
      if (!clientId || mealIds.length === 0) {
        throw new Error("ID de cliente no proporcionado o no hay comidas seleccionadas");
      }

      setIsToggling(true);

      // Process all meals in the meal type
      if (completed) {
        // If they're completed, unmark them all (delete records)
        const { error } = await supabase
          .from("comidas_completadas")
          .delete()
          .eq("cliente_id", clientId)
          .in("dieta_comida_id", mealIds);

        if (error) {
          console.error("Error al desmarcar comidas:", error);
          throw error;
        }
      } else {
        // If they're not completed, mark them all (insert records)
        const recordsToInsert = mealIds.map(mealId => ({
          cliente_id: clientId,
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
