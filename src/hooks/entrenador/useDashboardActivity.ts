
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export type DayActivity = {
  day: string;
  count: number;
};

export type WeeklyActivity = {
  workouts: DayActivity[];
  meals: DayActivity[];
};

export const useDashboardActivity = () => {
  const { user } = useAuth();
  const trainerId = user?.id;
  
  const { data: weeklyActivity, isLoading } = useQuery({
    queryKey: ["trainer-weekly-activity", trainerId],
    queryFn: async () => {
      try {
        if (!trainerId) return { workouts: [], meals: [] };
        
        // Get client IDs for this trainer
        const { data: clients, error: clientsError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("entrenador_id", trainerId)
          .eq("role", "cliente")
          .eq("eliminado", false);
          
        if (clientsError) throw clientsError;
        
        if (!clients?.length) return { workouts: [], meals: [] };
        
        const clientIds = clients.map(client => client.id);
        
        // Get current week boundaries
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
        
        const weekStartStr = format(weekStart, 'yyyy-MM-dd');
        const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
        
        // Initialize workouts array for all days of the week
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const workouts = days.map(day => ({ day, count: 0 }));
        const meals = days.map(day => ({ day, count: 0 }));
        
        // Get workout completion data for the week
        const { data: workoutData, error: workoutError } = await supabase
          .from("ejercicios_completados")
          .select("fecha_completado, cliente_id", { count: "exact", head: false })
          .in("cliente_id", clientIds)
          .gte("fecha_completado", `${weekStartStr}T00:00:00`)
          .lte("fecha_completado", `${weekEndStr}T23:59:59`);
          
        if (workoutError) throw workoutError;
        
        // Aggregate workout data by day
        workoutData?.forEach(workout => {
          const date = new Date(workout.fecha_completado);
          const dayIndex = (date.getDay() + 6) % 7; // Convert to 0 = Monday, 6 = Sunday
          workouts[dayIndex].count += 1;
        });
        
        // Get meal completion data for the week
        const { data: mealData, error: mealError } = await supabase
          .from("comidas_completadas")
          .select("fecha_completado, cliente_id", { count: "exact", head: false })
          .in("cliente_id", clientIds)
          .gte("fecha_completado", `${weekStartStr}T00:00:00`)
          .lte("fecha_completado", `${weekEndStr}T23:59:59`);
          
        if (mealError) throw mealError;
        
        // Aggregate meal data by day
        mealData?.forEach(meal => {
          const date = new Date(meal.fecha_completado);
          const dayIndex = (date.getDay() + 6) % 7; // Convert to 0 = Monday, 6 = Sunday
          meals[dayIndex].count += 1;
        });
        
        return { workouts, meals };
      } catch (error) {
        console.error("Error loading weekly activity:", error);
        const emptyDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const emptyData = emptyDays.map(day => ({ day, count: 0 }));
        return { workouts: emptyData, meals: emptyData };
      }
    },
    enabled: !!trainerId,
  });
  
  return {
    weeklyActivity: weeklyActivity || { 
      workouts: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => ({ day, count: 0 })),
      meals: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => ({ day, count: 0 }))
    },
    isLoading
  };
};
