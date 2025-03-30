
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export type TodayExercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
};

export type TodayMeal = {
  id: string;
  name: string;
  items: string[];
  completed: boolean;
};

export type ClientAppointment = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  formattedDate: string;
};

export type ProgressData = {
  weight: number;
  bodyFat: number | null;
  muscleMass: number | null;
  weightChange: number | null;
  bodyFatChange: number | null;
  muscleMassChange: number | null;
};

export const useClientDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const clientId = user?.id;

  // Fetch today's exercises (from current routine)
  const { data: todayExercises, isLoading: isLoadingExercises } = useQuery({
    queryKey: ["client-dashboard", "exercises", clientId],
    queryFn: async () => {
      try {
        if (!clientId) return [];

        // Get current day of week (1-7)
        const today = new Date().getDay() || 7; // Convert Sunday (0) to 7

        // Get active routine
        const { data: routines, error: routineError } = await supabase
          .from("rutinas")
          .select("id")
          .eq("cliente_id", clientId)
          .lte("fecha_inicio", new Date().toISOString())
          .gt("fecha_fin", new Date().toISOString())
          .order("fecha_inicio", { ascending: false })
          .limit(1);

        if (routineError) throw routineError;
        
        if (!routines || routines.length === 0) {
          return [];
        }

        const routineId = routines[0].id;

        // Get exercises for today
        const { data: exercises, error: exercisesError } = await supabase
          .from("rutina_ejercicios")
          .select(`
            id,
            series,
            repeticiones,
            ejercicio_id,
            ejercicios (
              nombre
            )
          `)
          .eq("rutina_id", routineId)
          .eq("dia", today);

        if (exercisesError) throw exercisesError;

        // Get completed exercises for today
        const { data: completedExercises, error: completedError } = await supabase
          .from("ejercicios_completados")
          .select("rutina_ejercicio_id")
          .eq("cliente_id", clientId)
          .gte("fecha_completado", new Date().setHours(0, 0, 0, 0).toISOString())
          .lte("fecha_completado", new Date().setHours(23, 59, 59, 999).toISOString());

        if (completedError) throw completedError;

        // Map completed exercise IDs
        const completedIds = new Set(completedExercises.map(e => e.rutina_ejercicio_id));

        // Format exercises
        return exercises.map(exercise => ({
          id: exercise.id,
          name: exercise.ejercicios?.nombre || "Ejercicio sin nombre",
          sets: exercise.series,
          reps: exercise.repeticiones,
          completed: completedIds.has(exercise.id)
        })) as TodayExercise[];
      } catch (error) {
        console.error("Error fetching today's exercises:", error);
        toast.error("No se pudieron cargar los ejercicios de hoy");
        return [];
      }
    },
    enabled: !!clientId
  });

  // Fetch today's meals (from current diet)
  const { data: todayMeals, isLoading: isLoadingMeals } = useQuery({
    queryKey: ["client-dashboard", "meals", clientId],
    queryFn: async () => {
      try {
        if (!clientId) return [];

        // Get current day of week (1-7)
        const today = new Date().getDay() || 7; // Convert Sunday (0) to 7

        // Get active diet
        const { data: diets, error: dietError } = await supabase
          .from("dietas")
          .select("id")
          .eq("cliente_id", clientId)
          .lte("fecha_inicio", new Date().toISOString())
          .gt("fecha_fin", new Date().toISOString())
          .order("fecha_inicio", { ascending: false })
          .limit(1);

        if (dietError) throw dietError;
        
        if (!diets || diets.length === 0) {
          return [];
        }

        const dietId = diets[0].id;

        // Get meals for today
        const { data: meals, error: mealsError } = await supabase
          .from("dieta_comidas")
          .select(`
            id,
            tipo_comida,
            alimento_id,
            alimentos (
              nombre
            )
          `)
          .eq("dieta_id", dietId)
          .eq("dia", today);

        if (mealsError) throw mealsError;

        // Group meals by type
        const mealsByType: Record<string, any[]> = {};
        meals.forEach(meal => {
          if (!mealsByType[meal.tipo_comida]) {
            mealsByType[meal.tipo_comida] = [];
          }
          mealsByType[meal.tipo_comida].push({
            id: meal.id,
            name: meal.alimentos?.nombre || "Alimento sin nombre"
          });
        });

        // Format meals
        return Object.entries(mealsByType).map(([type, foods]) => ({
          id: type,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          items: foods.map(food => food.name),
          completed: false // TODO: Implement meal completion tracking
        })) as TodayMeal[];
      } catch (error) {
        console.error("Error fetching today's meals:", error);
        toast.error("No se pudieron cargar las comidas de hoy");
        return [];
      }
    },
    enabled: !!clientId
  });

  // Fetch upcoming appointments
  const { data: upcomingAppointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["client-dashboard", "appointments", clientId],
    queryFn: async () => {
      try {
        if (!clientId) return [];

        const { data: appointments, error: appointmentsError } = await supabase
          .from("citas")
          .select("id, titulo, descripcion, fecha")
          .eq("cliente_id", clientId)
          .eq("estado", "programada")
          .gte("fecha", new Date().toISOString())
          .order("fecha", { ascending: true })
          .limit(5);

        if (appointmentsError) throw appointmentsError;

        return appointments.map(appointment => ({
          id: appointment.id,
          title: appointment.titulo,
          description: appointment.descripcion,
          date: parseISO(appointment.fecha),
          formattedDate: formatAppointmentDate(parseISO(appointment.fecha))
        })) as ClientAppointment[];
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error);
        toast.error("No se pudieron cargar las citas programadas");
        return [];
      }
    },
    enabled: !!clientId
  });

  // Fetch progress data
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["client-dashboard", "progress", clientId],
    queryFn: async () => {
      try {
        if (!clientId) return null;

        // Get latest progress entry
        const { data: latestProgress, error: latestError } = await supabase
          .from("progreso")
          .select("*")
          .eq("cliente_id", clientId)
          .order("fecha", { ascending: false })
          .limit(1);

        if (latestError) throw latestError;

        if (!latestProgress || latestProgress.length === 0) {
          return null;
        }

        // Get first progress entry
        const { data: firstProgress, error: firstError } = await supabase
          .from("progreso")
          .select("*")
          .eq("cliente_id", clientId)
          .order("fecha", { ascending: true })
          .limit(1);

        if (firstError) throw firstError;

        const latest = latestProgress[0];
        const first = firstProgress && firstProgress.length > 0 ? firstProgress[0] : null;

        return {
          weight: latest.peso,
          bodyFat: latest.grasa_corporal,
          muscleMass: latest.masa_muscular,
          weightChange: first ? latest.peso - first.peso : null,
          bodyFatChange: first && latest.grasa_corporal && first.grasa_corporal ? 
            latest.grasa_corporal - first.grasa_corporal : null,
          muscleMassChange: first && latest.masa_muscular && first.masa_muscular ? 
            latest.masa_muscular - first.masa_muscular : null
        } as ProgressData;
      } catch (error) {
        console.error("Error fetching progress data:", error);
        toast.error("No se pudieron cargar los datos de progreso");
        return null;
      }
    },
    enabled: !!clientId
  });

  // Helper function to format appointment date
  const formatAppointmentDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy - ${format(date, 'HH:mm')}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Mañana - ${format(date, 'HH:mm')}`;
    } else {
      return format(date, "EEEE - HH:mm", { locale: es });
    }
  };

  // Combine loading states
  useEffect(() => {
    setIsLoading(
      isLoadingExercises || 
      isLoadingMeals || 
      isLoadingAppointments || 
      isLoadingProgress
    );
  }, [isLoadingExercises, isLoadingMeals, isLoadingAppointments, isLoadingProgress]);

  return {
    todayExercises: todayExercises || [],
    todayMeals: todayMeals || [],
    upcomingAppointments: upcomingAppointments || [],
    progressData,
    isLoading
  };
};
