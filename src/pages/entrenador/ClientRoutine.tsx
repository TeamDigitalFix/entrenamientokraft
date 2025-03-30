
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Plus, ArrowLeft, Info, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import RoutineExerciseForm from "@/components/entrenador/RoutineExerciseForm";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Helper function to map day number to name
const mapDiaNumeroANombre = (dayNumber: number): string => {
  return diasSemana[dayNumber - 1] || "Desconocido";
};

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface RoutineExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number | null;
  restTime?: number | null;
  notes?: string | null;
  date: string;
  exercise?: Exercise;
}

interface Routine {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
}

// Interface for Supabase database exercise response
interface DbExercise {
  id: string;
  ejercicio_id: string;
  series: number;
  repeticiones: number;
  peso: number | null;
  descanso: number | null;
  notas: string | null;
  dia: string;
  ejercicios: {
    id?: string;
    nombre: string;
    grupo_muscular: string;
    descripcion: string | null;
    imagen_url: string | null;
    video_url: string | null;
  };
}

const ClientRoutine = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Lunes");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId) return;

      try {
        setLoading(true);

        const { data: clientData, error: clientError } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", clientId)
          .single();

        if (clientError) throw clientError;
        setClientName(clientData?.nombre || "Cliente");

        const { data: routineData, error: routineError } = await supabase
          .from("rutinas")
          .select("*")
          .eq("cliente_id", clientId)
          .order("fecha_inicio", { ascending: false })
          .limit(1);

        if (routineError) throw routineError;

        if (routineData && routineData.length > 0) {
          const rutinaActual = routineData[0];
          
          // Transform to match our Routine interface
          const mappedRoutine: Routine = {
            id: rutinaActual.id,
            name: rutinaActual.nombre,
            description: rutinaActual.descripcion,
            startDate: rutinaActual.fecha_inicio,
            endDate: rutinaActual.fecha_fin
          };
          
          setRoutine(mappedRoutine);

          const { data: exercisesData, error: exercisesError } = await supabase
            .from("rutina_ejercicios")
            .select(`
              id, 
              ejercicio_id, 
              series, 
              repeticiones, 
              peso, 
              descanso, 
              notas, 
              dia,
              ejercicios:ejercicio_id (nombre, grupo_muscular, descripcion, imagen_url, video_url)
            `)
            .eq("rutina_id", rutinaActual.id);

          if (exercisesError) throw exercisesError;

          if (exercisesData) {
            // Safe type assertion
            const dbExercises = exercisesData as unknown as DbExercise[];
            
            // Map the data to the RoutineExercise interface
            const formattedExercises: RoutineExercise[] = dbExercises.map(item => ({
              id: item.id,
              exerciseId: item.ejercicio_id,
              sets: item.series,
              reps: item.repeticiones,
              weight: item.peso,
              restTime: item.descanso,
              notes: item.notas,
              date: item.dia,
              exercise: {
                id: item.ejercicios.id || item.ejercicio_id,
                name: item.ejercicios.nombre,
                muscleGroup: item.ejercicios.grupo_muscular,
                description: item.ejercicios.descripcion || "",
                imageUrl: item.ejercicios.imagen_url,
                videoUrl: item.ejercicios.video_url,
              }
            }));
            setExercises(formattedExercises);
          }
        } else {
          setRoutine(null);
          setExercises([]);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: `No se pudo cargar la información del cliente: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId, toast, refreshTrigger]);

  const handleAddExercise = () => {
    setShowAddDialog(true);
  };

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este ejercicio de la rutina?")) {
      try {
        const { error } = await supabase
          .from("rutina_ejercicios")
          .delete()
          .eq("id", exerciseId);

        if (error) throw error;

        toast({
          title: "Ejercicio eliminado",
          description: "El ejercicio ha sido eliminado correctamente de la rutina."
        });

        setRefreshTrigger(prev => prev + 1);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `No se pudo eliminar el ejercicio: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateRoutine = async () => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from("rutinas")
        .insert({
          cliente_id: clientId,
          nombre: "Rutina personalizada",
          fecha_inicio: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Rutina creada",
        description: "La nueva rutina ha sido creada correctamente."
      });

      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `No se pudo crear la rutina: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const exercisesPorDia = diasSemana.reduce((acc, dia, index) => {
    const diaNumero = index + 1;
    acc[dia] = exercises.filter(exercise => {
      if (typeof exercise.date === 'number') {
        // Convert number to string for comparison
        return String(exercise.date) === String(diaNumero);
      } else if (typeof exercise.date === 'string' && /^[1-7]$/.test(exercise.date)) {
        return exercise.date === String(diaNumero);
      } else if (exercise.date && exercise.date.includes("-")) {
        const diaSemana = mapDiaNumeroANombre(parseInt(format(parseISO(exercise.date), "i", { locale: es })));
        return diaSemana === dia;
      }
      return false;
    });
    return acc;
  }, {} as Record<string, RoutineExercise[]>);

  // Format the day display
  const formatDay = (day: number | string): string => {
    if (typeof day === 'number') {
      return diasSemana[day - 1] || "Desconocido";
    }
    return day.toString();
  };

  useEffect(() => {
    if (!loading && exercises.length > 0) {
      for (const dia of diasSemana) {
        if (exercisesPorDia[dia]?.length > 0) {
          setActiveTab(dia);
          break;
        }
      }
    }
  }, [loading, exercises]);

  // Function to format date
  const formatearFecha = (fechaStr: string) => {
    try {
      return format(parseISO(fechaStr), "d 'de' MMMM", { locale: es });
    } catch (error) {
      return fechaStr;
    }
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/entrenador/clientes')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Rutina de {clientName}</h1>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-2xl">Rutina de ejercicios</CardTitle>
              {routine && (
                <p className="text-sm text-muted-foreground">
                  {routine.name} - Inicio: {formatearFecha(routine.startDate)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {routine && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddExercise}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir ejercicio
                    </Button>
                  </DialogTrigger>
                  <RoutineExerciseForm
                    clienteId={clientId || ""}
                    rutinaId={routine.id || null}
                    onCancel={() => setShowAddDialog(false)}
                    onSuccess={handleAddSuccess}
                  />
                </Dialog>
              )}
              {!routine && (
                <Button onClick={handleCreateRoutine}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear rutina
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando rutina...</div>
            ) : exercises.length > 0 ? (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full flex mb-4 overflow-x-auto">
                  {diasSemana.map(dia => (
                    <TabsTrigger
                      key={dia}
                      value={dia}
                      className="flex-1"
                      disabled={exercisesPorDia[dia]?.length === 0}
                    >
                      {dia}
                      {exercisesPorDia[dia]?.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {exercisesPorDia[dia].length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {diasSemana.map(dia => (
                  <TabsContent key={dia} value={dia} className="space-y-4">
                    {exercisesPorDia[dia]?.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {exercisesPorDia[dia].map((exercise) => (
                          <AccordionItem key={exercise.id} value={`exercise-${exercise.id}`}>
                            <AccordionTrigger className="hover:no-underline py-3 px-4 data-[state=open]:bg-accent/50 rounded-t-md">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{exercise.exercise?.name}</span>
                                  {exercise.exercise && (
                                    <span className="text-sm text-muted-foreground">
                                      {exercise.exercise.muscleGroup}
                                    </span>
                                  )}
                                </div>
                                <Badge>{exercise.sets} x {exercise.reps}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-accent/20 rounded-b-md px-4 pb-4 pt-2">
                              <div className="space-y-3">
                                {exercise.exercise && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Ejercicio</h4>
                                      <div className="flex flex-col">
                                        <span className="text-sm">
                                          {exercise.exercise.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {exercise.exercise.description}
                                        </span>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Detalles</h4>
                                      <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">
                                          Sets: {exercise.sets}
                                        </Badge>
                                        <Badge variant="outline">
                                          Reps: {exercise.reps}
                                        </Badge>
                                        {exercise.weight && (
                                          <Badge variant="outline">
                                            Peso: {exercise.weight}kg
                                          </Badge>
                                        )}
                                        {exercise.restTime && (
                                          <Badge variant="outline">
                                            Descanso: {exercise.restTime}s
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => handleDeleteExercise(exercise.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Eliminar
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-8 flex flex-col items-center">
                        <Dumbbell className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No hay ejercicios programados para {dia}</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="mt-4" onClick={handleAddExercise}>
                              <Plus className="h-4 w-4 mr-2" />
                              Añadir ejercicio para {dia}
                            </Button>
                          </DialogTrigger>
                          <RoutineExerciseForm
                            clienteId={clientId || ""}
                            rutinaId={routine?.id || null}
                            onCancel={() => setShowAddDialog(false)}
                            onSuccess={handleAddSuccess}
                          />
                        </Dialog>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 flex flex-col items-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Este cliente no tiene una rutina asignada</p>
                {routine ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir primer ejercicio
                      </Button>
                    </DialogTrigger>
                    <RoutineExerciseForm
                      clienteId={clientId || ""}
                      rutinaId={routine.id}
                      onCancel={() => setShowAddDialog(false)}
                      onSuccess={handleAddSuccess}
                    />
                  </Dialog>
                ) : (
                  <Button onClick={handleCreateRoutine} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear rutina
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientRoutine;
