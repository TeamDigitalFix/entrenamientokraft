
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useClientRoutine } from "@/hooks/cliente/useClientRoutine";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface RoutineTabProps {
  clientId: string;
}

const RoutineTab: React.FC<RoutineTabProps> = ({ clientId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [routine, setRoutine] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>('Lunes');
  const [availableDays] = useState<string[]>(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
  
  // This is the hook approach that wasn't working consistently
  const routineHook = useClientRoutine(clientId);
  
  // Direct Supabase fetching to ensure we get data
  useEffect(() => {
    const fetchRoutineData = async () => {
      if (!clientId) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching routine data directly from Supabase for client:", clientId);
        
        // Get active routine
        const { data: routineData, error: routineError } = await supabase
          .from("rutinas")
          .select("*")
          .eq("cliente_id", clientId)
          .is("fecha_fin", null)
          .single();
        
        if (routineError) {
          if (routineError.code === 'PGRST116') {
            console.log("No active routine found for client.");
            setRoutine(null);
            setIsLoading(false);
            return;
          }
          throw routineError;
        }
        
        if (!routineData) {
          console.log("No routine data found.");
          setRoutine(null);
          setIsLoading(false);
          return;
        }
        
        console.log("Routine found:", routineData);
        
        // Get routine exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from("rutina_ejercicios")
          .select(`
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
          `)
          .eq("rutina_id", routineData.id);
        
        if (exercisesError) {
          throw exercisesError;
        }
        
        console.log("Exercises data fetched:", exercisesData);
        
        // Get completed exercises for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: completedExercises, error: completedError } = await supabase
          .from("ejercicios_completados")
          .select("rutina_ejercicio_id")
          .eq("cliente_id", clientId)
          .gte("fecha_completado", today.toISOString());
        
        if (completedError) {
          console.error("Error fetching completed exercises:", completedError);
        }
        
        console.log("Completed exercises:", completedExercises);
        
        // Create a map of completed exercises
        const completedExercisesMap = new Map();
        completedExercises?.forEach(item => {
          completedExercisesMap.set(item.rutina_ejercicio_id, true);
        });
        
        // Process the data to match the expected format
        const exercisesByDay: Record<string, any[]> = {};
        const exercises: any[] = [];
        
        // Initialize empty arrays for each day of the week
        availableDays.forEach(day => {
          exercisesByDay[day] = [];
        });
        
        // Process each exercise
        exercisesData?.forEach((exercise: any) => {
          if (!exercise.ejercicios) return;
          
          // Create the exercise object
          const exerciseObj = {
            id: exercise.id,
            name: exercise.ejercicios.nombre,
            muscleGroup: exercise.ejercicios.grupo_muscular,
            sets: exercise.series,
            reps: exercise.repeticiones,
            weight: exercise.peso ? `${exercise.peso}` : undefined,
            notes: exercise.notas,
            imageUrl: exercise.ejercicios.imagen_url,
            videoUrl: exercise.ejercicios.video_url,
            completed: completedExercisesMap.has(exercise.id)
          };
          
          exercises.push(exerciseObj);
          
          // Add to the correct day
          if (exercise.dia) {
            // Handle numeric day format (1-7 for Monday-Sunday)
            let day: string;
            
            if (/^[1-7]$/.test(exercise.dia)) {
              const dayIndex = parseInt(exercise.dia) - 1;
              day = availableDays[dayIndex];
            } 
            // Handle date format (YYYY-MM-DD)
            else if (exercise.dia.includes('-')) {
              try {
                // Format the day directly
                day = exercise.dia;
              } catch (error) {
                console.error("Error parsing date:", exercise.dia, error);
                return;
              }
            } else {
              // Default case, use the raw day value with first letter capitalized
              day = exercise.dia.charAt(0).toUpperCase() + exercise.dia.slice(1).toLowerCase();
            }
            
            if (exercisesByDay[day]) {
              exercisesByDay[day].push(exerciseObj);
            } else {
              // If the day doesn't exist in our structure (like a date), create it
              exercisesByDay[day] = [exerciseObj];
            }
          }
        });
        
        // Log the processed data
        console.log("Processed exercisesByDay:", exercisesByDay);
        
        // Check if there are any exercises in any day
        const hasExercises = Object.values(exercisesByDay).some(
          dayExercises => dayExercises && dayExercises.length > 0
        );
        
        if (!hasExercises) {
          console.log("No exercises found in any day.");
        }
        
        // Combine all the data
        const processedRoutine = {
          id: routineData.id,
          name: routineData.nombre,
          description: routineData.descripcion,
          startDate: routineData.fecha_inicio,
          endDate: routineData.fecha_fin,
          exercises,
          exercisesByDay
        };
        
        console.log("Final processed routine:", processedRoutine);
        setRoutine(processedRoutine);
      } catch (error: any) {
        console.error("Error fetching routine data:", error);
        setError(`Error al cargar la rutina: ${error.message}`);
        toast.error("Error al cargar la rutina del cliente");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoutineData();
  }, [clientId, availableDays]);
  
  // If hook data is available and our direct fetch isn't, use the hook data
  useEffect(() => {
    if (!routine && routineHook.routine && !isLoading) {
      console.log("Using routine data from hook as fallback:", routineHook.routine);
      setRoutine(routineHook.routine);
    }
  }, [routine, routineHook.routine, isLoading]);
  
  // Log data for debugging
  console.log("Routine data in RoutineTab:", routine);
  console.log("clientId in RoutineTab:", clientId);
  if (routine && routine.exercisesByDay) {
    console.log("Exercises by day:", routine.exercisesByDay);
    console.log("Has exercises:", Object.values(routine.exercisesByDay).some(exercises => 
      Array.isArray(exercises) && exercises.length > 0
    ));
  }
  
  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500 space-x-2">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay rutina asignada para este cliente</p>
      </div>
    );
  }

  // Check if there are any exercises in the routine
  const hasExercises = routine.exercisesByDay && 
    Object.values(routine.exercisesByDay).some(exercises => 
      Array.isArray(exercises) && exercises.length > 0
    );

  if (!hasExercises) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">El cliente tiene una rutina asignada pero no hay ejercicios programados</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{routine.name}</h2>
      <p className="mb-6">{routine.description}</p>
      
      <Accordion type="single" collapsible className="w-full">
        {availableDays.map((day) => {
          const hasExercisesForDay = 
            routine.exercisesByDay[day] && 
            Array.isArray(routine.exercisesByDay[day]) && 
            routine.exercisesByDay[day].length > 0;
            
          return (
            <AccordionItem key={day} value={day} disabled={!hasExercisesForDay}>
              <AccordionTrigger className="text-lg font-medium">
                {day}
                {hasExercisesForDay && (
                  <Badge variant="outline" className="ml-2">
                    {routine.exercisesByDay[day].length} ejercicios
                  </Badge>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {hasExercisesForDay ? (
                  <div className="space-y-4">
                    {routine.exercisesByDay[day].map((exercise: any) => (
                      <Card key={exercise.id} className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {exercise.imageUrl && (
                            <div className="md:col-span-1">
                              <AspectRatio ratio={1 / 1}>
                                <img
                                  src={exercise.imageUrl}
                                  alt={exercise.name}
                                  className="rounded-l object-cover h-full w-full"
                                />
                              </AspectRatio>
                            </div>
                          )}
                          <div className={`p-4 ${exercise.imageUrl ? 'md:col-span-4' : 'md:col-span-5'}`}>
                            <h3 className="text-lg font-semibold">{exercise.name}</h3>
                            <p className="text-sm text-muted-foreground">{exercise.muscleGroup}</p>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              <div>
                                <span className="text-xs text-muted-foreground">Series</span>
                                <p className="font-medium">{exercise.sets}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Repeticiones</span>
                                <p className="font-medium">{exercise.reps}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Peso</span>
                                <p className="font-medium">{exercise.weight || 'N/A'} kg</p>
                              </div>
                            </div>
                            {exercise.notes && (
                              <p className="mt-2 text-sm italic">{exercise.notes}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay ejercicios programados para este día</p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default RoutineTab;
