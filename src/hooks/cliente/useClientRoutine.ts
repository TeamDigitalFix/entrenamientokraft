
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export type ClientRoutineExercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  muscleGroup: string;
  notes?: string;
  date: string; // YYYY-MM-DD format or day of week (1-7)
  completed: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

export type ClientRoutine = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  exercises: ClientRoutineExercise[];
};

// Mapeo de día numérico a nombre del día
const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Determinar el día de la semana a partir de la fecha o número de día
const getDayFromDateOrNumber = (dateOrDay: string): string => {
  // Si es un número del 1-7, convertirlo a nombre del día
  if (/^[1-7]$/.test(dateOrDay)) {
    return dayNames[parseInt(dateOrDay) - 1];
  }
  
  // Si es una fecha en formato YYYY-MM-DD, obtener el día de la semana
  try {
    if (dateOrDay.includes("-")) {
      const dayNumber = parseInt(format(parseISO(dateOrDay), "i", { locale: es })) - 1;
      return dayNames[dayNumber];
    }
  } catch (error) {
    console.error("Error parsing date:", error);
  }
  
  return "Desconocido";
};

export const useClientRoutine = () => {
  const { user } = useAuth();
  const clientId = user?.id;
  const [activeDay, setActiveDay] = useState<string>("Lunes");

  const { data: routine, isLoading } = useQuery({
    queryKey: ["client-routine", clientId],
    queryFn: async () => {
      try {
        if (!clientId) throw new Error("No hay usuario autenticado");

        // Get active routine
        const { data: routines, error: routineError } = await supabase
          .from("rutinas")
          .select("*")
          .eq("cliente_id", clientId)
          .lte("fecha_inicio", new Date().toISOString())
          .order("fecha_inicio", { ascending: false })
          .limit(1);

        if (routineError) throw routineError;
        
        if (!routines || routines.length === 0) {
          return null;
        }

        const routineData = routines[0];

        // Get exercises for the routine
        const { data: exercises, error: exercisesError } = await supabase
          .from("rutina_ejercicios")
          .select(`
            id,
            series,
            repeticiones,
            dia,
            notas,
            peso,
            rutina_id,
            ejercicio_id,
            ejercicios:ejercicio_id (
              nombre,
              grupo_muscular,
              descripcion,
              imagen_url,
              video_url
            )
          `)
          .eq("rutina_id", routineData.id);

        if (exercisesError) throw exercisesError;

        // Get completed exercises
        const { data: completedExercises, error: completedError } = await supabase
          .from("ejercicios_completados")
          .select("rutina_ejercicio_id")
          .eq("cliente_id", clientId);

        if (completedError) throw completedError;

        // Map completed exercise IDs
        const completedIds = new Set(completedExercises?.map(e => e.rutina_ejercicio_id) || []);

        // Format exercises by date
        const transformedExercises: ClientRoutineExercise[] = exercises?.map(exercise => ({
          id: exercise.id,
          name: exercise.ejercicios?.nombre || "Ejercicio sin nombre",
          sets: exercise.series,
          reps: exercise.repeticiones,
          weight: exercise.peso,
          muscleGroup: exercise.ejercicios?.grupo_muscular || "Sin grupo",
          notes: exercise.notas,
          date: exercise.dia || "1", // Si no tiene día, asignamos "1" (Lunes)
          completed: completedIds.has(exercise.id),
          imageUrl: exercise.ejercicios?.imagen_url,
          videoUrl: exercise.ejercicios?.video_url
        }));

        // Group exercises by day of week
        const exercisesByDay: { [key: string]: ClientRoutineExercise[] } = {};
        
        // Inicializar todos los días de la semana
        dayNames.forEach(day => {
          exercisesByDay[day] = [];
        });
        
        // Agrupar ejercicios por día
        transformedExercises.forEach(exercise => {
          const dayName = getDayFromDateOrNumber(exercise.date);
          if (!exercisesByDay[dayName]) {
            exercisesByDay[dayName] = [];
          }
          exercisesByDay[dayName].push(exercise);
        });

        return {
          id: routineData.id,
          name: routineData.nombre,
          description: routineData.descripcion,
          startDate: new Date(routineData.fecha_inicio),
          endDate: routineData.fecha_fin ? new Date(routineData.fecha_fin) : null,
          exercises: transformedExercises,
          exercisesByDay,
        };
      } catch (error) {
        console.error("Error fetching routine:", error);
        toast.error("No se pudo cargar la rutina");
        return null;
      }
    },
    enabled: !!clientId
  });

  // Todos los días de la semana siempre deben estar disponibles
  const availableDays = dayNames;

  return {
    routine,
    isLoading,
    activeDay,
    setActiveDay,
    availableDays
  };
};
