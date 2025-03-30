
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { useClientRoutine } from "@/hooks/cliente/useClientRoutine";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useExerciseToggle } from "@/hooks/cliente/useExerciseToggle";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Función auxiliar para extraer el ID de video de YouTube
const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Patrones comunes de URL de YouTube
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

const ClientRoutine = () => {
  const { routine, isLoading, activeDay, setActiveDay, availableDays } = useClientRoutine();
  const { toggleExerciseCompletion, isToggling } = useExerciseToggle();

  const handleExerciseToggle = (id: string, currentStatus: boolean) => {
    toggleExerciseCompletion({ exerciseId: id, completed: currentStatus });
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mi Rutina</h1>
        <p className="text-muted-foreground">Aquí puedes ver y seguir tu rutina de ejercicios personalizada</p>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{routine?.name || "Rutina Actual"}</CardTitle>
              <CardDescription>Tu programa de entrenamiento personalizado</CardDescription>
            </div>
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Cargando rutina...</span>
              </div>
            ) : !routine || routine.exercises.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Estamos preparando tu rutina personalizada. Tu entrenador estará actualizándola pronto.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
                  <TabsList className="w-full grid grid-cols-7 mb-4">
                    {availableDays.map(day => (
                      <TabsTrigger 
                        key={day} 
                        value={day}
                        className="text-xs sm:text-sm"
                      >
                        {day}
                        {routine.exercisesByDay[day]?.length > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1.5 min-w-5 h-5 text-xs hidden sm:flex items-center justify-center">
                            {routine.exercisesByDay[day].length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {availableDays.map(day => (
                    <TabsContent key={day} value={day} className="space-y-4">
                      {routine.exercisesByDay[day]?.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          {routine.exercisesByDay[day].map((exercise) => (
                            <AccordionItem key={exercise.id} value={exercise.id}>
                              <AccordionTrigger className="hover:no-underline py-3 px-4 data-[state=open]:bg-accent/50 rounded-t-md">
                                <div className="flex justify-between w-full items-center">
                                  <div className="flex items-center">
                                    <span className="font-medium">{exercise.name}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {exercise.muscleGroup}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline">{exercise.sets} series</Badge>
                                    <Badge variant="outline">{exercise.reps} reps</Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="bg-accent/20 rounded-b-md px-4 pb-4 pt-2">
                                <div className="space-y-3">
                                  {/* Media Section */}
                                  {(exercise.imageUrl || exercise.videoUrl) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                      {exercise.imageUrl && (
                                        <div className="relative">
                                          <p className="text-sm font-medium mb-1">Imagen de referencia</p>
                                          <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                                            <img 
                                              src={exercise.imageUrl} 
                                              alt={`Imagen de ${exercise.name}`}
                                              className="object-cover w-full h-full"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "/placeholder.svg";
                                              }}
                                            />
                                          </AspectRatio>
                                        </div>
                                      )}
                                      
                                      {exercise.videoUrl && (
                                        <div className="relative">
                                          <p className="text-sm font-medium mb-1">Video tutorial</p>
                                          <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                                            {extractYouTubeVideoId(exercise.videoUrl) ? (
                                              <iframe
                                                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(exercise.videoUrl)}`}
                                                title={`Video de ${exercise.name}`}
                                                className="w-full h-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                              ></iframe>
                                            ) : (
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <a 
                                                  href={exercise.videoUrl} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="bg-primary text-white rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                                                >
                                                  <Play className="h-5 w-5" />
                                                </a>
                                                <img 
                                                  src={exercise.imageUrl || "/placeholder.svg"} 
                                                  alt={`Video de ${exercise.name}`}
                                                  className="object-cover w-full h-full opacity-70"
                                                />
                                              </div>
                                            )}
                                          </AspectRatio>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {exercise.weight && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-1">Peso</h4>
                                        <Badge variant="secondary">{exercise.weight} kg</Badge>
                                      </div>
                                    )}
                                    
                                    {exercise.notes && (
                                      <div className="col-span-full">
                                        <h4 className="text-sm font-medium mb-1">Notas</h4>
                                        <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex justify-end">
                                    <Button 
                                      variant={exercise.completed ? "default" : "outline"}
                                      className={`${exercise.completed ? "bg-green-500 hover:bg-green-600" : ""}`}
                                      size="sm"
                                      onClick={() => handleExerciseToggle(exercise.id, exercise.completed)}
                                      disabled={isToggling}
                                    >
                                      {isToggling ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Actualizando...
                                        </>
                                      ) : exercise.completed ? (
                                        "Completado"
                                      ) : (
                                        "Marcar como completado"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="text-center py-8">
                          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No hay ejercicios programados para {day}</p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientRoutine;
