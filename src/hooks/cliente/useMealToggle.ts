
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export type ToggleMealParams = {
  dietMealIds: string[];
  completed: boolean;
  clientId?: string; // Optional parameter for when trainer manages a client's meals
};

export const useMealToggle = () => {
  const { user } = useAuth();

  const toggleMealMutation = useMutation({
    mutationFn: async ({ dietMealIds, completed, clientId }: ToggleMealParams) => {
      // If no meals to change, return
      if (!dietMealIds.length) return;
      
      // If clientId is provided, use that, otherwise use current user.id
      const targetUserId = clientId || user?.id;
      
      if (!targetUserId) {
        throw new Error("No se pudo determinar el usuario");
      }

      if (completed) {
        // Mark as completed: Insert records in comidas_completadas
        const inserts = dietMealIds.map(mealId => ({
          dieta_comida_id: mealId,
          cliente_id: targetUserId
        }));

        const { error } = await supabase
          .from('comidas_completadas')
          .insert(inserts);

        if (error) throw error;
      } else {
        // Mark as not completed: Delete records from comidas_completadas
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { error } = await supabase
          .from('comidas_completadas')
          .delete()
          .eq('cliente_id', targetUserId)
          .gte('fecha_completado', today.toISOString())
          .in('dieta_comida_id', dietMealIds);

        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      toast.success(variables.completed 
        ? "Comida marcada como completada" 
        : "Comida desmarcada");
    },
    onError: (error) => {
      console.error("Error al actualizar estado de comida:", error);
      toast.error("No se pudo actualizar el estado de la comida");
    }
  });

  return {
    toggleMealCompletion: toggleMealMutation.mutate,
    toggleMealTypeCompletion: toggleMealMutation.mutate, // Alias for toggleMealCompletion to match expected API
    isToggling: toggleMealMutation.isPending
  };
};
