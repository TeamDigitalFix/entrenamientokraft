
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, startOfWeek, endOfWeek, isBefore, isToday } from "date-fns";
import { es } from "date-fns/locale";

// Define types for state
export type ActivityItem = {
  id: string;
  type: "exercise" | "meal" | "appointment";
  title: string;
  date: Date;
  status?: "completed" | "pending";
  details?: string;
};

export type ProgressSummary = {
  initialWeight?: number;
  currentWeight?: number;
  weightChange?: number;
  bodyFatChange?: number;
  muscleMassChange?: number;
  lastMeasurementDate?: Date;
};

export type TodaySchedule = {
  exercises: {
    id: string;
    name: string;
    muscleGroup: string;
    sets: number;
    reps: number;
    completed: boolean;
  }[];
  meals: {
    id: string;
    mealType: string;
    foodName: string;
    completed: boolean;
  }[];
  appointments: {
    id: string;
    title: string;
    time: string;
    duration: number;
  }[];
};

export const useClientDashboard = () => {
  const { user } = useAuth();
  const clientId = user?.id;
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("today");

  // Get recent activity
  const { data: recentActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ["client-recent-activity", clientId, timeframe],
    queryFn: async () => {
      try {
        if (!clientId) return [];

        // Get start and end dates for the selected timeframe
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        if (timeframe === "today") {
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
        } else if (timeframe === "week") {
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          endDate = endOfWeek(now, { weekStartsOn: 1 });
        } else {
          startDate.setDate(1);
          endDate.setMonth(endDate.getMonth() + 1, 0);
        }

        // Format dates for queries
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

        // Get routine and exercises
        const { data: routine } = await supabase
          .from("rutinas")
          .select("id, nombre")
          .eq("cliente_id", clientId)
          .order("fecha_inicio", { ascending: false })
          .limit(1);

        let exercises: ActivityItem[] = [];
        if (routine && routine.length > 0) {
          const { data: exercisesData } = await supabase
            .from("rutina_ejercicios")
            .select(`
              id,
              dia,
              ejercicios:ejercicio_id (nombre, grupo_muscular)
            `)
            .eq("rutina_id", routine[0].id);

          // Get completed exercises
          const { data: completedExercises } = await supabase
            .from("ejercicios_completados")
            .select("rutina_ejercicio_id, fecha_completado")
            .eq("cliente_id", clientId)
            .gte("fecha_completado", startDateStr)
            .lte("fecha_completado", endDateStr);

          const completedExerciseIds = new Set(
            completedExercises?.map(ex => ex.rutina_ejercicio_id) || []
          );

          // Convert exercises to activity items
          exercises = (exercisesData || [])
            .filter(ex => {
              // If the day is a number (1-7), convert it to a date for this week
              let exerciseDate: Date;
              if (ex.dia && /^[1-7]$/.test(ex.dia)) {
                const dayNum = parseInt(ex.dia) - 1; // 0 = Monday, 6 = Sunday
                exerciseDate = new Date(startOfWeek(now, { weekStartsOn: 1 }));
                exerciseDate.setDate(exerciseDate.getDate() + dayNum);
              } else if (ex.dia && ex.dia.includes("-")) {
                // If it's a date string (YYYY-MM-DD)
                exerciseDate = parseISO(ex.dia);
              } else {
                exerciseDate = new Date(); // Default to today
              }
              
              // Include the exercise if it falls within the timeframe
              return (
                exerciseDate >= startDate && 
                exerciseDate <= endDate
              );
            })
            .map(ex => ({
              id: ex.id,
              type: "exercise" as const,
              title: ex.ejercicios?.nombre || "Ejercicio",
              date: new Date(), // Default date
              status: completedExerciseIds.has(ex.id) ? "completed" : "pending",
              details: ex.ejercicios?.grupo_muscular,
            }));
        }

        // Get diet and meals
        const { data: diet } = await supabase
          .from("dietas")
          .select("id, nombre")
          .eq("cliente_id", clientId)
          .order("fecha_inicio", { ascending: false })
          .limit(1);

        let meals: ActivityItem[] = [];
        if (diet && diet.length > 0) {
          const { data: mealsData } = await supabase
            .from("dieta_comidas")
            .select(`
              id,
              tipo_comida,
              dia,
              alimentos:alimento_id (nombre)
            `)
            .eq("dieta_id", diet[0].id);

          // Convert meals to activity items
          meals = (mealsData || [])
            .filter(meal => {
              // If the day is a number (1-7), convert it to a date for this week
              let mealDate: Date;
              if (meal.dia && /^[1-7]$/.test(meal.dia)) {
                const dayNum = parseInt(meal.dia) - 1; // 0 = Monday, 6 = Sunday
                mealDate = new Date(startOfWeek(now, { weekStartsOn: 1 }));
                mealDate.setDate(mealDate.getDate() + dayNum);
              } else if (meal.dia && meal.dia.includes("-")) {
                // If it's a date string (YYYY-MM-DD)
                mealDate = parseISO(meal.dia);
              } else {
                mealDate = new Date(); // Default to today
              }
              
              // Include the meal if it falls within the timeframe
              return (
                mealDate >= startDate && 
                mealDate <= endDate
              );
            })
            .map(meal => ({
              id: meal.id,
              type: "meal" as const,
              title: `${meal.tipo_comida}: ${meal.alimentos?.nombre || "Alimento"}`,
              date: new Date(), // Default date
              status: "pending", // For now, assuming all meals are pending
            }));
        }

        // Get appointments
        const { data: appointments } = await supabase
          .from("citas")
          .select("id, titulo, fecha, tipo, descripcion")
          .eq("cliente_id", clientId)
          .gte("fecha", startDateStr)
          .lte("fecha", endDateStr)
          .order("fecha", { ascending: true });

        const appointmentItems: ActivityItem[] = (appointments || []).map(apt => ({
          id: apt.id,
          type: "appointment" as const,
          title: apt.titulo,
          date: new Date(apt.fecha),
          details: apt.descripcion || apt.tipo,
        }));

        // Combine and sort all activities
        const allActivities = [...exercises, ...meals, ...appointmentItems].sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );

        return allActivities;
      } catch (error) {
        console.error("Error fetching client activity:", error);
        toast.error("No se pudo cargar la actividad reciente");
        return [];
      }
    },
    enabled: !!clientId,
  });

  // Get today's schedule
  const { data: todaySchedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ["client-today-schedule", clientId],
    queryFn: async () => {
      try {
        if (!clientId) return { exercises: [], meals: [], appointments: [] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayWeekday = parseInt(format(today, "i", { locale: es })); // 1 = Monday, 7 = Sunday

        // Get routine exercises for today
        const { data: routine } = await supabase
          .from("rutinas")
          .select("id")
          .eq("cliente_id", clientId)
          .order("fecha_inicio", { ascending: false })
          .limit(1);

        let exercises: TodaySchedule["exercises"] = [];
        if (routine && routine.length > 0) {
          const { data: exercisesData } = await supabase
            .from("rutina_ejercicios")
            .select(`
              id,
              series,
              repeticiones,
              dia,
              ejercicio_id,
              ejercicios:ejercicio_id (nombre, grupo_muscular)
            `)
            .eq("rutina_id", routine[0].id);

          // Get completed exercises
          const { data: completedExercises } = await supabase
            .from("ejercicios_completados")
            .select("rutina_ejercicio_id")
            .eq("cliente_id", clientId);

          const completedExerciseIds = new Set(
            completedExercises?.map(ex => ex.rutina_ejercicio_id) || []
          );

          // Filter exercises for today (either by date or by weekday)
          exercises = (exercisesData || [])
            .filter(ex => {
              if (!ex.dia) return false;
              
              // Check if dia is a date string (YYYY-MM-DD)
              if (ex.dia.includes("-")) {
                const exDate = parseISO(ex.dia);
                return (
                  exDate.getDate() === today.getDate() &&
                  exDate.getMonth() === today.getMonth() &&
                  exDate.getFullYear() === today.getFullYear()
                );
              }
              
              // Check if dia is a weekday number (1-7)
              if (/^[1-7]$/.test(ex.dia)) {
                return parseInt(ex.dia) === todayWeekday;
              }
              
              return false;
            })
            .map(ex => ({
              id: ex.id,
              name: ex.ejercicios?.nombre || "Ejercicio sin nombre",
              muscleGroup: ex.ejercicios?.grupo_muscular || "Sin grupo",
              sets: ex.series,
              reps: ex.repeticiones,
              completed: completedExerciseIds.has(ex.id),
            }));
        }

        // Get meals for today
        const { data: diet } = await supabase
          .from("dietas")
          .select("id")
          .eq("cliente_id", clientId)
          .order("fecha_inicio", { ascending: false })
          .limit(1);

        let meals: TodaySchedule["meals"] = [];
        if (diet && diet.length > 0) {
          const { data: mealsData } = await supabase
            .from("dieta_comidas")
            .select(`
              id,
              tipo_comida,
              dia,
              alimentos:alimento_id (nombre)
            `)
            .eq("dieta_id", diet[0].id);

          // Filter meals for today (either by date or by weekday)
          meals = (mealsData || [])
            .filter(meal => {
              if (!meal.dia) return false;
              
              // Check if dia is a date string (YYYY-MM-DD)
              if (meal.dia.includes("-")) {
                const mealDate = parseISO(meal.dia);
                return (
                  mealDate.getDate() === today.getDate() &&
                  mealDate.getMonth() === today.getMonth() &&
                  mealDate.getFullYear() === today.getFullYear()
                );
              }
              
              // Check if dia is a weekday number (1-7)
              if (/^[1-7]$/.test(meal.dia)) {
                return parseInt(meal.dia) === todayWeekday;
              }
              
              return false;
            })
            .map(meal => ({
              id: meal.id,
              mealType: meal.tipo_comida,
              foodName: meal.alimentos?.nombre || "Alimento sin nombre",
              completed: false, // For now, assuming all meals are not completed
            }));
        }

        // Get today's appointments
        const { data: appointments } = await supabase
          .from("citas")
          .select("id, titulo, fecha, duracion")
          .eq("cliente_id", clientId)
          .gte("fecha", today.toISOString())
          .lt("fecha", tomorrow.toISOString())
          .order("fecha", { ascending: true });

        const appointmentItems: TodaySchedule["appointments"] = (appointments || []).map(apt => ({
          id: apt.id,
          title: apt.titulo,
          time: format(new Date(apt.fecha), "HH:mm"),
          duration: apt.duracion,
        }));

        return {
          exercises,
          meals,
          appointments: appointmentItems,
        };
      } catch (error) {
        console.error("Error fetching today's schedule:", error);
        toast.error("No se pudo cargar el horario de hoy");
        return { exercises: [], meals: [], appointments: [] };
      }
    },
    enabled: !!clientId,
  });

  // Get progress summary
  const { data: progressSummary, isLoading: loadingProgress } = useQuery({
    queryKey: ["client-progress-summary", clientId],
    queryFn: async () => {
      try {
        if (!clientId) return {};

        // Get most recent weight measurement
        const { data: latestMeasurement } = await supabase
          .from("progreso")
          .select("id, fecha, peso, grasa_corporal, masa_muscular")
          .eq("cliente_id", clientId)
          .order("fecha", { ascending: false })
          .limit(1);

        // Get the first measurement
        const { data: firstMeasurement } = await supabase
          .from("progreso")
          .select("id, fecha, peso, grasa_corporal, masa_muscular")
          .eq("cliente_id", clientId)
          .order("fecha", { ascending: true })
          .limit(1);

        if (!latestMeasurement || latestMeasurement.length === 0) {
          return {};
        }

        const latest = latestMeasurement[0];
        const first = firstMeasurement?.[0] || latest;

        // Calculate changes
        const weightChange = latest.peso - first.peso;
        const bodyFatChange = latest.grasa_corporal && first.grasa_corporal
          ? latest.grasa_corporal - first.grasa_corporal
          : undefined;
        const muscleMassChange = latest.masa_muscular && first.masa_muscular
          ? latest.masa_muscular - first.masa_muscular
          : undefined;

        return {
          initialWeight: first.peso,
          currentWeight: latest.peso,
          weightChange,
          bodyFatChange,
          muscleMassChange,
          lastMeasurementDate: new Date(latest.fecha),
        };
      } catch (error) {
        console.error("Error fetching progress summary:", error);
        toast.error("No se pudo cargar el resumen de progreso");
        return {};
      }
    },
    enabled: !!clientId,
  });

  return {
    clientId,
    recentActivity,
    todaySchedule,
    progressSummary,
    timeframe,
    setTimeframe,
    isLoading: loadingActivity || loadingSchedule || loadingProgress,
  };
};
