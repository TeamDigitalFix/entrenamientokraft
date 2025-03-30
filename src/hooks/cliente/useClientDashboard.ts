
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, startOfWeek, endOfWeek, isBefore, isToday } from "date-fns";
import { es } from "date-fns/locale";

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

const defaultTodaySchedule: TodaySchedule = {
  exercises: [],
  meals: [],
  appointments: []
};

export const useClientDashboard = () => {
  const { user } = useAuth();
  const clientId = user?.id;
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("today");

  const { data: recentActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ["client-recent-activity", clientId, timeframe],
    queryFn: async () => {
      try {
        if (!clientId) return [];

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

        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

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

          const { data: completedExercises } = await supabase
            .from("ejercicios_completados")
            .select("rutina_ejercicio_id, fecha_completado")
            .eq("cliente_id", clientId)
            .gte("fecha_completado", startDateStr)
            .lte("fecha_completado", endDateStr);

          const completedExerciseIds = new Set(
            completedExercises?.map(ex => ex.rutina_ejercicio_id) || []
          );

          exercises = (exercisesData || [])
            .filter(ex => {
              let exerciseDate: Date;
              if (ex.dia && /^[1-7]$/.test(ex.dia)) {
                const dayNum = parseInt(ex.dia) - 1;
                exerciseDate = new Date(startOfWeek(now, { weekStartsOn: 1 }));
                exerciseDate.setDate(exerciseDate.getDate() + dayNum);
              } else if (ex.dia && ex.dia.includes("-")) {
                exerciseDate = parseISO(ex.dia);
              } else {
                exerciseDate = new Date();
              }
              
              return (
                exerciseDate >= startDate && 
                exerciseDate <= endDate
              );
            })
            .map(ex => ({
              id: ex.id,
              type: "exercise" as const,
              title: ex.ejercicios?.nombre || "Ejercicio",
              date: new Date(),
              status: completedExerciseIds.has(ex.id) ? "completed" : "pending",
              details: ex.ejercicios?.grupo_muscular,
            }));
        }

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

          const { data: completedMeals } = await supabase
            .from("comidas_completadas")
            .select("dieta_comida_id");

          const completedMealIds = new Set(
            completedMeals?.map(cm => cm.dieta_comida_id) || []
          );

          const currentDate = new Date();
          const todayWeekday = parseInt(format(currentDate, "i", { locale: es }));

          meals = (mealsData || [])
            .filter(meal => {
              if (!meal.dia) return false;
              
              if (meal.dia.includes("-")) {
                const mealDate = parseISO(meal.dia);
                return (
                  mealDate.getDate() === currentDate.getDate() &&
                  mealDate.getMonth() === currentDate.getMonth() &&
                  mealDate.getFullYear() === currentDate.getFullYear()
                );
              }
              
              if (/^[1-7]$/.test(meal.dia)) {
                return parseInt(meal.dia) === todayWeekday;
              }
              
              return false;
            })
            .map(meal => ({
              id: meal.id,
              type: "meal" as const,
              title: `${meal.tipo_comida}: ${meal.alimentos?.nombre || "Alimento"}`,
              date: new Date(),
              status: "pending",
            }));
        }

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

  const { data: todaySchedule = defaultTodaySchedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ["client-today-schedule", clientId],
    queryFn: async () => {
      try {
        if (!clientId) return defaultTodaySchedule;

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayWeekday = parseInt(format(currentDate, "i", { locale: es }));

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

          const { data: completedExercises } = await supabase
            .from("ejercicios_completados")
            .select("rutina_ejercicio_id")
            .eq("cliente_id", clientId);

          const completedExerciseIds = new Set(
            completedExercises?.map(ex => ex.rutina_ejercicio_id) || []
          );

          exercises = (exercisesData || [])
            .filter(ex => {
              if (!ex.dia) return false;
              
              if (ex.dia.includes("-")) {
                const exDate = parseISO(ex.dia);
                return (
                  exDate.getDate() === currentDate.getDate() &&
                  exDate.getMonth() === currentDate.getMonth() &&
                  exDate.getFullYear() === currentDate.getFullYear()
                );
              }
              
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

          const { data: completedMeals } = await supabase
            .from("comidas_completadas")
            .select("dieta_comida_id");

          const completedMealIds = new Set(
            completedMeals?.map(cm => cm.dieta_comida_id) || []
          );

          meals = (mealsData || [])
            .filter(meal => {
              if (!meal.dia) return false;
              
              if (meal.dia.includes("-")) {
                const mealDate = parseISO(meal.dia);
                return (
                  mealDate.getDate() === currentDate.getDate() &&
                  mealDate.getMonth() === currentDate.getMonth() &&
                  mealDate.getFullYear() === currentDate.getFullYear()
                );
              }
              
              if (/^[1-7]$/.test(meal.dia)) {
                return parseInt(meal.dia) === todayWeekday;
              }
              
              return false;
            })
            .map(meal => ({
              id: meal.id,
              mealType: meal.tipo_comida,
              foodName: meal.alimentos?.nombre || "Alimento sin nombre",
              completed: completedMealIds.has(meal.id),
            }));
        }

        const { data: appointments } = await supabase
          .from("citas")
          .select("id, titulo, fecha, duracion")
          .eq("cliente_id", clientId)
          .gte("fecha", currentDate.toISOString())
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
          meals: meals || [],
          appointments: appointmentItems || [],
        };
      } catch (error) {
        console.error("Error fetching today's schedule:", error);
        toast.error("No se pudo cargar el horario de hoy");
        return defaultTodaySchedule;
      }
    },
    enabled: !!clientId,
  });

  const { data: progressSummary, isLoading: loadingProgress } = useQuery({
    queryKey: ["client-progress-summary", clientId],
    queryFn: async () => {
      try {
        if (!clientId) return {};

        const { data: latestMeasurement } = await supabase
          .from("progreso")
          .select("id, fecha, peso, grasa_corporal, masa_muscular")
          .eq("cliente_id", clientId)
          .order("fecha", { ascending: false })
          .limit(1);

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

        const weightChange = latest.peso - first.peso;
        const bodyFatChange = latest.grasa_corporal && first.grasa_corporal
          ? latest.grasa_corporal - first.grasa_corporal
          : null;
        const muscleMassChange = latest.masa_muscular && first.masa_muscular
          ? latest.masa_muscular - first.masa_muscular
          : null;

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
