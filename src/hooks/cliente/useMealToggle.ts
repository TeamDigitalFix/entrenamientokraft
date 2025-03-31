
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type ToggleMealParams = {
  dietMealIds: string[];
  completed: boolean;
  clientId?: string; // Nuevo parámetro opcional para cuando el entrenador gestiona comidas de un cliente
};

export const useMealToggle = () => {
  const { user } = useAuth();

  const toggleMealMutation = useMutation({
    mutationFn: async ({ dietMealIds, completed, clientId }: ToggleMealParams) => {
      // Si no hay comidas para cambiar, retornar
      if (!dietMealIds.length) return;
      
      // Si se proporciona un clientId, usamos ese, de lo contrario usamos el user.id actual
      const targetUserId = clientId || user?.id;
      
      if (!targetUserId) {
        throw new Error("No se pudo determinar el usuario");
      }

      if (completed) {
        // Marcar como completado: Insertar registros en comidas_completadas
        const inserts = dietMealIds.map(mealId => ({
          dieta_comida_id: mealId,
          cliente_id: targetUserId
        }));

        const { error } = await supabase
          .from('comidas_completadas')
          .insert(inserts);

        if (error) throw error;
      } else {
        // Marcar como no completado: Eliminar registros de comidas_completadas
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
    isToggling: toggleMealMutation.isPending
  };
};
