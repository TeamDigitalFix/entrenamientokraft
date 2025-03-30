
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

export type WeeklyActivity = {
  day: string;
  clientes: number;
  ejercicios: number;
};

export const useDashboardActivity = () => {
  const { user } = useAuth();
  const trainerId = user?.id;

  const { data: weeklyActivity, isLoading } = useQuery({
    queryKey: ["weekly-activity", trainerId],
    queryFn: async () => {
      try {
        if (!trainerId) return [];

        const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), i);
          return {
            date,
            dayName: format(date, 'EEEE', { locale: es }),
            dayFormatted: format(date, 'yyyy-MM-dd')
          };
        }).reverse(); // Para que el día más antiguo esté primero

        // Primero obtenemos los IDs de los clientes de este entrenador
        const { data: clientsData, error: clientsError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("entrenador_id", trainerId)
          .eq("role", "cliente")
          .eq("eliminado", false);

        if (clientsError) throw clientsError;
        
        // Si no hay clientes, devolvemos un array vacío
        if (!clientsData?.length) {
          return lastSevenDays.map(day => ({
            day: day.dayName,
            clientes: 0,
            ejercicios: 0
          }));
        }
        
        const clientIds = clientsData.map(client => client.id);
        
        // Ahora obtenemos los datos de actividad para cada día
        const activityData: WeeklyActivity[] = await Promise.all(
          lastSevenDays.map(async (day) => {
            // Contar clientes activos para este día
            const { data: activeClients, error: activeError } = await supabase
              .from("ejercicios_completados")
              .select("cliente_id", { count: "exact", head: true, distinct: true })
              .in("cliente_id", clientIds)
              .gte("fecha_completado", `${day.dayFormatted}T00:00:00`)
              .lte("fecha_completado", `${day.dayFormatted}T23:59:59`);
              
            if (activeError) throw activeError;
            
            // Contar ejercicios completados para este día
            const { count: ejercicios, error: ejerciciosError } = await supabase
              .from("ejercicios_completados")
              .select("*", { count: "exact", head: true })
              .in("cliente_id", clientIds)
              .gte("fecha_completado", `${day.dayFormatted}T00:00:00`)
              .lte("fecha_completado", `${day.dayFormatted}T23:59:59`);
              
            if (ejerciciosError) throw ejerciciosError;
            
            return {
              day: day.dayName,
              clientes: activeClients?.length || 0,
              ejercicios: ejercicios || 0
            };
          })
        );
        
        return activityData;
      } catch (error) {
        console.error("Error loading weekly activity:", error);
        return [];
      }
    },
    enabled: !!trainerId
  });

  return { weeklyActivity, isLoading };
};
