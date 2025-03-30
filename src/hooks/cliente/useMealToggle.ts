
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type ToggleMealParams = {
  mealId: string;
  completed: boolean;
};

export const useMealToggle = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  const toggleMealMutation = useMutation({
    mutationFn: async ({ mealId, completed }: ToggleMealParams) => {
      if (!user?.id) {
        throw new Error("Usuario no autenticado");
      }

      setIsToggling(true);

      // For now, just simulate API call since we don't have the table
      // In a real implementation, we would store this in the database
      await new Promise(resolve => setTimeout(resolve, 300));
      
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

  const toggleMealCompletion = (params: ToggleMealParams) => {
    toggleMealMutation.mutate(params);
  };

  return {
    toggleMealCompletion,
    isToggling: isToggling || toggleMealMutation.isPending,
  };
};
