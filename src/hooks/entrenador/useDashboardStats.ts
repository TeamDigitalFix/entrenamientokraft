
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export type DashboardStats = {
  totalClients: number;
  activeClients: number;
  upcomingAppointments: number;
  unreadMessages: number;
  completedToday: number;
};

export const useDashboardStats = () => {
  const { user } = useAuth();

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["dashboard", "stats", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return null;

        // Total de clientes
        const { data: clientsData, error: clientsError } = await supabase
          .from("usuarios")
          .select("id, ultimo_ingreso")
          .eq("entrenador_id", user.id)
          .eq("role", "cliente")
          .eq("eliminado", false);
          
        if (clientsError) throw clientsError;

        // Clientes activos (con actividad en los últimos 7 días)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeClients = clientsData.filter(client => 
          client.ultimo_ingreso && new Date(client.ultimo_ingreso) >= sevenDaysAgo
        );

        // Citas próximas (próximos 7 días)
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("citas")
          .select("id")
          .eq("entrenador_id", user.id)
          .eq("estado", "programada")
          .gte("fecha", new Date().toISOString())
          .lte("fecha", new Date(new Date().setDate(new Date().getDate() + 7)).toISOString());
          
        if (appointmentsError) throw appointmentsError;

        // Mensajes sin leer
        const { data: messagesData, error: messagesError } = await supabase
          .from("mensajes")
          .select("id")
          .eq("receptor_id", user.id)
          .eq("leido", false);
          
        if (messagesError) throw messagesError;

        // Ejercicios completados hoy
        const today = new Date().toISOString().split('T')[0];
        
        // Extract client IDs safely
        const clientIds: string[] = [];
        if (clientsData && clientsData.length > 0) {
          clientsData.forEach(client => {
            if (client && client.id) {
              clientIds.push(client.id);
            }
          });
        }
        
        // Only proceed if we have client IDs
        let completedExercisesData: any[] = [];
        let completedExercisesError = null;
        
        if (clientIds.length > 0) {
          // Use explicit parameter types to avoid type inference issues
          const { data, error } = await supabase
            .from("ejercicios_completados")
            .select("id")
            .eq("fecha_completado::date", today)
            .in("cliente_id", clientIds as unknown as string[]);
            
          completedExercisesData = data || [];
          completedExercisesError = error;
        }
          
        if (completedExercisesError) throw completedExercisesError;

        return {
          totalClients: clientsData.length,
          activeClients: activeClients.length,
          upcomingAppointments: appointmentsData.length,
          unreadMessages: messagesData.length,
          completedToday: completedExercisesData.length
        } as DashboardStats;
      } catch (error) {
        console.error("Error al cargar estadísticas del dashboard:", error);
        toast.error("No se pudieron cargar las estadísticas del dashboard");
        return null;
      }
    },
    enabled: !!user?.id
  });

  return { dashboardStats, isLoading };
};
