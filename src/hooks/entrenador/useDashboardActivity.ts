
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, startOfWeek, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

export type WeeklyActivity = {
  day: string;
  clientes: number;
  ejercicios: number;
};

export const useDashboardActivity = () => {
  const { user } = useAuth();

  const { data: weeklyActivity, isLoading } = useQuery({
    queryKey: ["dashboard", "activity", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];

        const today = new Date();
        const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Lunes como inicio de semana
        
        // Obtener todos los días de la semana actual
        const weekDates = eachDayOfInterval({
          start: startDate,
          end: today
        });
        
        // Formatear fechas para consultas
        const formattedDates = weekDates.map(date => format(date, 'yyyy-MM-dd'));
        
        // Obtener IDs de clientes del entrenador
        const { data: clientsData, error: clientsError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("entrenador_id", user.id)
          .eq("role", "cliente")
          .eq("eliminado", false);
          
        if (clientsError) throw clientsError;
        
        // Extract client IDs safely
        const clientIds: string[] = [];
        if (clientsData && clientsData.length > 0) {
          clientsData.forEach(client => {
            if (client && client.id) {
              clientIds.push(client.id);
            }
          });
        }
        
        // Obtener ejercicios completados por día - only proceed if we have clients
        let completedExercises: any[] = [];
        let exercisesError = null;
        
        if (clientIds.length > 0) {
          const { data, error } = await supabase
            .from("ejercicios_completados")
            .select("fecha_completado")
            .in("cliente_id", clientIds as unknown as string[])
            .gte("fecha_completado", formattedDates[0]);
            
          completedExercises = data || [];
          exercisesError = error;
        }
          
        if (exercisesError) throw exercisesError;
        
        // Obtener sesiones diarias - only proceed if we have clients
        let dailySessions: any[] = [];
        let sessionsError = null;
        
        if (clientIds.length > 0) {
          const { data, error } = await supabase
            .from("sesiones_diarias")
            .select("fecha, completada")
            .in("cliente_id", clientIds as unknown as string[])
            .gte("fecha", formattedDates[0])
            .eq("completada", true);
            
          dailySessions = data || [];
          sessionsError = error;
        }
          
        if (sessionsError) throw sessionsError;
        
        // Crear mapa para contar ejercicios y clientes activos por día
        const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        const activityMap = new Map(diasSemana.map(day => [day, { clientes: 0, ejercicios: 0 }]));
        
        // Contar ejercicios por día
        completedExercises.forEach(exercise => {
          const date = parseISO(exercise.fecha_completado);
          const dayOfWeek = format(date, 'EEE', { locale: es });
          const dayName = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1, 3);
          
          if (activityMap.has(dayName)) {
            const currentStats = activityMap.get(dayName)!;
            activityMap.set(dayName, { 
              ...currentStats, 
              ejercicios: currentStats.ejercicios + 1 
            });
          }
        });
        
        // Contar clientes activos por día
        dailySessions.forEach(session => {
          const date = parseISO(session.fecha);
          const dayOfWeek = format(date, 'EEE', { locale: es });
          const dayName = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1, 3);
          
          if (activityMap.has(dayName) && session.completada) {
            const currentStats = activityMap.get(dayName)!;
            activityMap.set(dayName, { 
              ...currentStats, 
              clientes: currentStats.clientes + 1 
            });
          }
        });
        
        // Convertir mapa a array para el gráfico
        return diasSemana.map(day => ({
          day,
          clientes: activityMap.get(day)?.clientes || 0,
          ejercicios: activityMap.get(day)?.ejercicios || 0
        }));
      } catch (error) {
        console.error("Error al cargar actividad semanal:", error);
        toast.error("No se pudieron cargar los datos de actividad semanal");
        return [];
      }
    },
    enabled: !!user?.id
  });

  return { weeklyActivity, isLoading };
};
