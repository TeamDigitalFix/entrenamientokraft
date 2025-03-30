
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
  date: string; // Changed to be consistently a string (YYYY-MM-DD format)
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

type ExercisesByDate = {
  [key: string]: ClientRoutineExercise[];
};

export const useClientRoutine = () => {
  const { user } = useAuth();
  const clientId = user?.id;
  const [activeDate, setActiveDate] = useState<string>("");

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
          date: exercise.dia.toString(), // Ensure it's always a string
          completed: completedIds.has(exercise.id),
          imageUrl: exercise.ejercicios?.imagen_url,
          videoUrl: exercise.ejercicios?.video_url
        }));

        // Group exercises by date
        const exercisesByDate: ExercisesByDate = {};
        const uniqueDates = [...new Set(transformedExercises.map(ex => ex.date))].sort();
        
        uniqueDates.forEach(date => {
          exercisesByDate[date] = transformedExercises.filter(
            exercise => exercise.date === date
          );
        });

        // Set initial active date if not set already
        if (!activeDate && uniqueDates.length > 0) {
          setActiveDate(uniqueDates[0]);
        }

        return {
          id: routineData.id,
          name: routineData.nombre,
          description: routineData.descripcion,
          startDate: new Date(routineData.fecha_inicio),
          endDate: routineData.fecha_fin ? new Date(routineData.fecha_fin) : null,
          exercises: transformedExercises,
          exercisesByDate,
        };
      } catch (error) {
        console.error("Error fetching routine:", error);
        toast.error("No se pudo cargar la rutina");
        return null;
      }
    },
    enabled: !!clientId
  });

  const availableDates = routine ? Object.keys(routine.exercisesByDate).sort() : [];

  return {
    routine,
    isLoading,
    activeDate: activeDate || (availableDates.length > 0 ? availableDates[0] : ""),
    setActiveDate,
    availableDates
  };
};
