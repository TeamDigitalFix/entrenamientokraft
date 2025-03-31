
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Tipos de datos
export type ExerciseDetails = {
  id: string;
  name: string;
  muscleGroup: string;
  reps: number;
  sets: number;
  weight?: string;
  notes?: string;
  imageUrl?: string;
  videoUrl?: string;
  completed: boolean;
};

export type ClientRoutine = {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  exercises: ExerciseDetails[];
  exercisesByDay: Record<string, ExerciseDetails[]>;
};

export const useClientRoutine = (clientId?: string) => {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState<string>('Lunes');
  const [availableDays] = useState<string[]>(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);

  // Consulta para obtener la rutina del cliente
  const { data: routine, isLoading } = useQuery({
    queryKey: ['clientRoutine', clientId || user?.id],
    queryFn: async () => {
      try {
        // Si se proporciona un clientId, usamos ese, de lo contrario usamos el user.id actual
        const targetUserId = clientId || user?.id;
        
        if (!targetUserId) return null;

        // Obtener la rutina activa del cliente
        const { data: rutina, error: rutinaError } = await supabase
          .from('rutinas')
          .select(`
            id, 
            nombre, 
            descripcion, 
            fecha_inicio, 
            fecha_fin,
            rutina_ejercicios (
              id,
              dia,
              series,
              repeticiones,
              peso,
              notas,
              ejercicio_id,
              ejercicios (
                id,
                nombre,
                grupo_muscular,
                imagen_url,
                video_url
              )
            )
          `)
          .eq('cliente_id', targetUserId)
          .is('fecha_fin', null)
          .single();

        if (rutinaError) {
          if (rutinaError.code === 'PGRST116') {
            console.log("No se encontró una rutina activa para el cliente.");
            return null;
          }
          throw rutinaError;
        }

        if (!rutina) return null;

        // Obtener los ejercicios completados para marcarlos en la rutina
        const { data: completados, error: completadosError } = await supabase
          .from('ejercicios_completados')
          .select('rutina_ejercicio_id')
          .eq('cliente_id', targetUserId)
          .gte('fecha_completado', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        if (completadosError) {
          console.error("Error al obtener ejercicios completados:", completadosError);
        }

        // Map de ejercicios completados para verificación rápida
        const completadosMap = new Map();
        completados?.forEach(item => {
          completadosMap.set(item.rutina_ejercicio_id, true);
        });

        // Convertir los datos al formato necesario para el cliente
        const clientRoutine: ClientRoutine = {
          id: rutina.id,
          name: rutina.nombre,
          description: rutina.descripcion,
          startDate: rutina.fecha_inicio,
          endDate: rutina.fecha_fin,
          exercises: [],
          exercisesByDay: {}
        };

        // Inicializar los días de la semana
        availableDays.forEach(day => {
          clientRoutine.exercisesByDay[day] = [];
        });

        // Procesar los ejercicios de la rutina
        rutina.rutina_ejercicios?.forEach((ejercicio: any) => {
          if (!ejercicio.ejercicios) return;
          
          const exercise: ExerciseDetails = {
            id: ejercicio.id,
            name: ejercicio.ejercicios.nombre,
            muscleGroup: ejercicio.ejercicios.grupo_muscular,
            sets: ejercicio.series,
            reps: ejercicio.repeticiones,
            weight: ejercicio.peso ? `${ejercicio.peso}` : undefined,
            notes: ejercicio.notas,
            imageUrl: ejercicio.ejercicios.imagen_url,
            videoUrl: ejercicio.ejercicios.video_url,
            completed: completadosMap.has(ejercicio.id)
          };
          
          clientRoutine.exercises.push(exercise);
          
          // Organizar por día
          if (ejercicio.dia) {
            // Capitalize first letter of day
            const day = ejercicio.dia.charAt(0).toUpperCase() + ejercicio.dia.slice(1).toLowerCase();
            if (clientRoutine.exercisesByDay[day]) {
              clientRoutine.exercisesByDay[day].push(exercise);
            }
          }
        });

        return clientRoutine;
      } catch (error) {
        console.error("Error al cargar la rutina:", error);
        toast.error("No se pudo cargar la rutina");
        return null;
      }
    },
    enabled: !!(clientId || user?.id),
  });

  // Set the active day to the first day that has exercises
  useEffect(() => {
    if (routine && routine.exercisesByDay) {
      const daysWithExercises = availableDays.filter(day => 
        routine.exercisesByDay[day] && routine.exercisesByDay[day].length > 0
      );
      
      if (daysWithExercises.length > 0 && !routine.exercisesByDay[activeDay]?.length) {
        setActiveDay(daysWithExercises[0]);
      }
    }
  }, [routine, availableDays, activeDay]);

  return {
    routine,
    isLoading,
    activeDay,
    setActiveDay,
    availableDays
  };
};
