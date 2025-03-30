
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export type ClientRoutineExercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  muscleGroup: string;
  notes?: string;
  day: number;
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

type ExercisesByDay = {
  [key: string]: ClientRoutineExercise[];
};

const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

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

        // Format exercises by day
        const transformedExercises = exercises?.map(exercise => ({
          id: exercise.id,
          name: exercise.ejercicios?.nombre || "Ejercicio sin nombre",
          sets: exercise.series,
          reps: exercise.repeticiones,
          weight: exercise.peso,
          muscleGroup: exercise.ejercicios?.grupo_muscular || "Sin grupo",
          notes: exercise.notas,
          day: exercise.dia,
          completed: completedIds.has(exercise.id),
          imageUrl: exercise.ejercicios?.imagen_url,
          videoUrl: exercise.ejercicios?.video_url
        })) as ClientRoutineExercise[];

        // Group exercises by day
        const exercisesByDay: ExercisesByDay = {};
        dayNames.forEach((day, index) => {
          exercisesByDay[day] = transformedExercises.filter(
            exercise => exercise.day === index + 1
          );
        });

        // Find the first day with exercises
        if (!exercisesByDay[activeDay]?.length) {
          const firstDayWithExercises = dayNames.find(day => exercisesByDay[day]?.length > 0);
          if (firstDayWithExercises) {
            setActiveDay(firstDayWithExercises);
          }
        }

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

  return {
    routine,
    isLoading,
    activeDay,
    setActiveDay,
    dayNames
  };
};
