
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const useMealToggle = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const clientId = user?.id;

  // Note: This is a placeholder since we don't have a meal completion table yet
  // We'll create a simple implementation for toggling the state in the UI
  const { mutate: toggleMealCompletion, isPending } = useMutation({
    mutationFn: async ({ 
      mealId, 
      completed 
    }: { 
      mealId: string; 
      completed: boolean;
    }) => {
      // This would be implemented when we have a meal completion table
      // For now, we'll just return the toggled state
      return { mealId, completed: !completed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-dashboard", "meals"] });
      toast.success(
        data.completed 
          ? "Comida marcada como completada" 
          : "Comida marcada como no completada"
      );
    }
  });

  return {
    toggleMealCompletion,
    isPending
  };
};
