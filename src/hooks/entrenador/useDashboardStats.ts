
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { addDays, format } from "date-fns";

export type DashboardStats = {
  totalClients: number;
  totalExercisesCreated: number;
  totalFoodsCreated: number;
  totalExercises: number;
  activeClients: number;
  upcomingAppointments: number;
  unreadMessages: number;
  completedToday: number;
};

export const useDashboardStats = () => {
  const { user } = useAuth();
  const trainerId = user?.id;
  const today = new Date();
  const todayFormatted = format(today, 'yyyy-MM-dd');
  const nextWeek = addDays(today, 7);
  const nextWeekFormatted = format(nextWeek, 'yyyy-MM-dd');

  // Total Clients
  const { data: totalClients, isLoading: clientsLoading } = useQuery({
    queryKey: ["trainer-clients-count", trainerId],
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

  // Active Clients (clients who completed exercises in the last 7 days)
  const { data: activeClients, isLoading: activeClientsLoading } = useQuery({
    queryKey: ["active-clients-count", trainerId],
    queryFn: async () => {
      try {
        // Get active clients
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoFormatted = format(sevenDaysAgo, 'yyyy-MM-dd');

        // First get client IDs that belong to this trainer
        const { data: clients, error: clientsError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("entrenador_id", trainerId)
          .eq("role", "cliente")
          .eq("eliminado", false);

        if (clientsError) throw clientsError;
        
        if (!clients?.length) return 0;
        
        const clientIds = clients.map(client => client.id);
        
        // Count unique client IDs who have completed exercises in the last 7 days
        const { count, error } = await supabase
          .from("ejercicios_completados")
          .select("cliente_id", { count: "exact", head: true })
          .in("cliente_id", clientIds)
          .gte("fecha_completado", sevenDaysAgoFormatted);
          
        if (error) throw error;
        
        return count || 0;
      } catch (error) {
        console.error("Error loading active clients count:", error);
        return 0;
      }
    },
    enabled: !!trainerId,
  });

  // Upcoming Appointments
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["upcoming-appointments-count", trainerId],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("citas")
          .select("*", { count: "exact", head: true })
          .eq("entrenador_id", trainerId)
          .eq("estado", "programada")
          .gte("fecha", todayFormatted)
          .lte("fecha", nextWeekFormatted);

        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error("Error loading upcoming appointments count:", error);
        return 0;
      }
    },
    enabled: !!trainerId,
  });

  // Unread Messages
  const { data: unreadMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ["unread-messages-count", trainerId],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("mensajes")
          .select("*", { count: "exact", head: true })
          .eq("receptor_id", trainerId)
          .eq("leido", false);

        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error("Error loading unread messages count:", error);
        return 0;
      }
    },
    enabled: !!trainerId,
  });

  // Exercises Completed Today
  const { data: completedToday, isLoading: completedTodayLoading } = useQuery({
    queryKey: ["completed-today-count", trainerId],
    queryFn: async () => {
      try {
        // First get client IDs that belong to this trainer
        const { data: clients, error: clientsError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("entrenador_id", trainerId)
          .eq("role", "cliente")
          .eq("eliminado", false);

        if (clientsError) throw clientsError;
        
        if (!clients?.length) return 0;
        
        const clientIds = clients.map(client => client.id);
        
        // Now count exercises completed today by these clients
        const { count, error } = await supabase
          .from("ejercicios_completados")
          .select("*", { count: "exact", head: true })
          .in("cliente_id", clientIds)
          .gte("fecha_completado", `${todayFormatted}T00:00:00`)
          .lte("fecha_completado", `${todayFormatted}T23:59:59`);
          
        if (error) throw error;
        
        return count || 0;
      } catch (error) {
        console.error("Error loading completed today count:", error);
        return 0;
      }
    },
    enabled: !!trainerId,
  });

  // Total Exercises
  const { data: totalExercisesCreated, isLoading: exercisesCreatedLoading } = useQuery({
    queryKey: ["trainer-exercises-created-count", trainerId],
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
    queryKey: ["trainer-foods-created-count", trainerId],
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

  // Total exercises completed by clients
  const { data: totalExercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["trainer-exercises-count", trainerId],
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
    activeClients: activeClients || 0,
    upcomingAppointments: upcomingAppointments || 0,
    unreadMessages: unreadMessages || 0,
    completedToday: completedToday || 0
  };

  return {
    stats,
    isLoading: clientsLoading || exercisesCreatedLoading || foodsCreatedLoading || exercisesLoading || 
               activeClientsLoading || appointmentsLoading || messagesLoading || completedTodayLoading,
  };
};
