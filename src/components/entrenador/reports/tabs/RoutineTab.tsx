
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useClientRoutine } from "@/hooks/cliente/useClientRoutine";

interface RoutineTabProps {
  clientId: string;
}

const RoutineTab: React.FC<RoutineTabProps> = ({ clientId }) => {
  const { 
    routine, 
    isLoading,
    activeDay,
    setActiveDay,
    availableDays
  } = useClientRoutine(clientId);

  // Log routine data for debugging
  console.log("Routine data in RoutineTab:", routine);

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!routine) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay rutina asignada para este cliente</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{routine.name}</h2>
      <p className="mb-6">{routine.description}</p>
      
      <Accordion type="single" collapsible className="w-full">
        {availableDays.map((day) => (
          <AccordionItem key={day} value={day}>
            <AccordionTrigger className="text-lg font-medium">
              {day}
              {routine.exercisesByDay[day]?.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {routine.exercisesByDay[day].length} ejercicios
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              {routine.exercisesByDay[day]?.length > 0 ? (
                <div className="space-y-4">
                  {routine.exercisesByDay[day].map((exercise) => (
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
        ))}
      </Accordion>
    </div>
  );
};

export default RoutineTab;
