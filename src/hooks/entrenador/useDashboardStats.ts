
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type DashboardStats = {
  totalClients: number;
  totalExercisesCreated: number;
  totalFoodsCreated: number;
  totalExercises: number;
  activeClients?: number;
  upcomingAppointments?: number;
  unreadMessages?: number;
  completedToday?: number;
};

export const useDashboardStats = () => {
  const { user } = useAuth();
  const trainerId = user?.id;

  // Total Clients
  const { data: totalClients, isLoading: clientsLoading } = useQuery({
    queryKey: ["trainer-clients-count"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("usuarios")
          .select("*", { count: "exact", head: true })
          .eq("entrenador_id", trainerId)
          .eq("role", "cliente")
          .eq("eliminado", false);

        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error("Error loading clients count:", error);
        return 0;
      }
    },
    enabled: !!trainerId,
  });

  // Total Exercises
  const { data: totalExercisesCreated, isLoading: exercisesCreatedLoading } = useQuery({
    queryKey: ["trainer-exercises-created-count"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("ejercicios")
          .select("*", { count: "exact", head: true })
          .eq("creado_por", trainerId);

        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error("Error loading exercises created count:", error);
        return 0;
      }
    },
    enabled: !!trainerId,
  });

  // Total Foods
  const { data: totalFoodsCreated, isLoading: foodsCreatedLoading } = useQuery({
    queryKey: ["trainer-foods-created-count"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("alimentos")
          .select("*", { count: "exact", head: true })
          .eq("creado_por", trainerId);

        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error("Error loading foods created count:", error);
        return 0;
      }
    },
    enabled: !!trainerId,
  });

  // Solucionar el error TS2589: Type instantiation is excessively deep and possibly infinite
  // Añadimos una anotación de tipo explícita para clientIds
  const { data: totalExercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["trainer-exercises-count"],
    queryFn: async () => {
      try {
        // Obtener los IDs de clientes del entrenador
        const { data: clients, error: clientsError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("entrenador_id", trainerId)
          .eq("role", "cliente")
          .eq("eliminado", false);

        if (clientsError) throw clientsError;
        
        // Crear una lista de IDs explícitamente tipada como string[]
        const clientIds: string[] = clients?.map(client => client.id) || [];

        // Si no hay clientes, devolver 0
        if (clientIds.length === 0) return 0;

        // Contar ejercicios completados para estos clientes
        const { count, error: exercisesError } = await supabase
          .from("ejercicios_completados")
          .select("*", { count: "exact", head: true })
          .in("cliente_id", clientIds);

        if (exercisesError) throw exercisesError;
        
        return count || 0;
      } catch (error) {
        console.error("Error loading exercises count:", error);
        return 0;
      }
    },
    enabled: !!trainerId,
  });

  // Create and return the stats object
  const stats: DashboardStats = {
    totalClients: totalClients || 0,
    totalExercisesCreated: totalExercisesCreated || 0,
    totalFoodsCreated: totalFoodsCreated || 0,
    totalExercises: totalExercises || 0,
  };

  return {
    stats,
    isLoading: clientsLoading || exercisesCreatedLoading || foodsCreatedLoading || exercisesLoading,
  };
};
