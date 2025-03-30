
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Plus, ArrowLeft, Info, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import RutinaEjercicioForm from "@/components/entrenador/RutinaEjercicioForm";
import { Ejercicio } from "@/types/ejercicios";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Función para obtener el día de la semana a partir de una fecha en formato YYYY-MM-DD
const obtenerDiaSemana = (fechaStr: string): string => {
  try {
    // Parsear la fecha
    const fecha = parseISO(fechaStr);
    // Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
    // Ajustamos para que 0 = lunes (formato español)
    const diaSemanaNum = parseInt(format(fecha, "i", { locale: es })) - 1;
    return diasSemana[diaSemanaNum] || "Desconocido";
  } catch (error) {
    console.error("Error al procesar la fecha:", fechaStr, error);
    return "Desconocido";
  }
};

interface Rutina {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
}

const ClientRoutine = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Lunes");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        
        // Only select 'nombre' since 'ultimo_ingreso' might not exist in the table
        const { data: clientData, error: clientError } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", clientId)
          .single();
        
        if (clientError) throw clientError;
        setClientName(clientData?.nombre || "Cliente");
        
        const { data: rutinasData, error: rutinasError } = await supabase
          .from("rutinas")
          .select("*")
          .eq("cliente_id", clientId)
          .order("fecha_inicio", { ascending: false })
          .limit(1);
        
        if (rutinasError) throw rutinasError;
        
        if (rutinasData && rutinasData.length > 0) {
          const rutinaActual = rutinasData[0];
          setRutina(rutinaActual);
          
          const { data: ejerciciosData, error: ejerciciosError } = await supabase
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
              ejercicios:ejercicio_id (nombre, grupo_muscular, descripcion)
            `)
            .eq("rutina_id", rutinaActual.id);
          
          if (ejerciciosError) throw ejerciciosError;
          
          if (ejerciciosData) {
            const ejerciciosTransformados = ejerciciosData.map(ej => ({
              ...ej,
              nombre: ej.ejercicios?.nombre || "Ejercicio sin nombre",
              dia: ej.dia, // Ahora dia es una fecha en formato texto YYYY-MM-DD
            }));
            
            setEjercicios(ejerciciosTransformados as unknown as Ejercicio[]);
          }
        } else {
          setRutina(null);
          setEjercicios([]);
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

  const handleDeleteExercise = async (ejercicioId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este ejercicio?")) {
      try {
        // First check if the exercise is completed
        const { data: completados } = await supabase
          .from("ejercicios_completados")
          .select("id")
          .eq("rutina_ejercicio_id", ejercicioId);
          
        // If completed, delete the completed exercises first
        if (completados && completados.length > 0) {
          const { error: deleteCompletadosError } = await supabase
            .from("ejercicios_completados")
            .delete()
            .eq("rutina_ejercicio_id", ejercicioId);
            
          if (deleteCompletadosError) throw deleteCompletadosError;
        }
        
        // Now delete the exercise from the routine
        const { error } = await supabase
          .from("rutina_ejercicios")
          .delete()
          .eq("id", ejercicioId);

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

  // Agrupar ejercicios por día de la semana basado en la fecha (formato texto YYYY-MM-DD)
  const ejerciciosPorDia = diasSemana.reduce((acc, dia) => {
    acc[dia] = ejercicios.filter(ejercicio => {
      const diaEjercicio = obtenerDiaSemana(ejercicio.dia as string);
      return diaEjercicio === dia;
    });
    return acc;
  }, {} as Record<string, Ejercicio[]>);

  useEffect(() => {
    if (!loading && ejercicios.length > 0) {
      for (const dia of diasSemana) {
        if (ejerciciosPorDia[dia]?.length > 0) {
          setActiveTab(dia);
          break;
        }
      }
    }
  }, [loading, ejercicios]);

  // Función para mostrar la fecha formateada
  const formatearFecha = (fechaStr: string) => {
    try {
      return format(parseISO(fechaStr), "d 'de' MMMM", { locale: es });
    } catch (error) {
      return fechaStr;
    }
  };

  const handleCreateRoutine = async () => {
    if (!clientId) return;
    
    try {
      const { data, error } = await supabase
        .from("rutinas")
        .insert({
          cliente_id: clientId,
          nombre: "Nueva rutina",
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
              <CardTitle className="text-2xl">Programa de entrenamiento</CardTitle>
              {rutina && (
                <p className="text-sm text-muted-foreground">
                  {rutina.nombre} - Inicio: {formatearFecha(rutina.fecha_inicio)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {rutina && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddExercise}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir ejercicio
                    </Button>
                  </DialogTrigger>
                  <RutinaEjercicioForm 
                    clienteId={clientId || ""} 
                    rutinaId={rutina.id || null}
                    onCancel={() => setShowAddDialog(false)}
                    onSuccess={handleAddSuccess}
                  />
                </Dialog>
              )}
              {!rutina && (
                <Button onClick={handleCreateRoutine}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear nueva rutina
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando rutina...</div>
            ) : ejercicios.length > 0 ? (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full flex mb-4 overflow-x-auto">
                  {diasSemana.map(dia => (
                    <TabsTrigger
                      key={dia}
                      value={dia}
                      className="flex-1"
                      disabled={ejerciciosPorDia[dia]?.length === 0}
                    >
                      {dia}
                      {ejerciciosPorDia[dia]?.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {ejerciciosPorDia[dia].length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {diasSemana.map(dia => (
                  <TabsContent key={dia} value={dia} className="space-y-4">
                    {ejerciciosPorDia[dia]?.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {ejerciciosPorDia[dia].map((ejercicio) => (
                          <AccordionItem key={ejercicio.id} value={`ejercicio-${ejercicio.id}`}>
                            <AccordionTrigger className="hover:no-underline py-3 px-4 data-[state=open]:bg-accent/50 rounded-t-md">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{ejercicio.nombre}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{formatearFecha(ejercicio.dia as string)}</Badge>
                                  <Badge variant="outline">{ejercicio.series} series</Badge>
                                  <Badge variant="outline">{ejercicio.repeticiones} reps</Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-accent/20 rounded-b-md px-4 pb-4 pt-2">
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {ejercicio.peso && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Peso</h4>
                                      <Badge variant="secondary">{ejercicio.peso}</Badge>
                                    </div>
                                  )}
                                  
                                  {ejercicio.ejercicios && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Grupo muscular</h4>
                                      <Badge variant="outline">{ejercicio.ejercicios.grupo_muscular}</Badge>
                                    </div>
                                  )}
                                  
                                  {ejercicio.notas && (
                                    <div className="col-span-full">
                                      <h4 className="text-sm font-medium mb-1">Notas</h4>
                                      <p className="text-sm text-muted-foreground">{ejercicio.notas}</p>
                                    </div>
                                  )}
                                  
                                  {ejercicio.ejercicios?.descripcion && (
                                    <div className="col-span-full">
                                      <h4 className="text-sm font-medium mb-1">Descripción</h4>
                                      <p className="text-sm text-muted-foreground">{ejercicio.ejercicios.descripcion}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => handleDeleteExercise(ejercicio.id)}
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
                          <RutinaEjercicioForm 
                            clienteId={clientId || ""} 
                            rutinaId={rutina?.id || null}
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
                <p className="text-muted-foreground">Este cliente no tiene ejercicios asignados</p>
                {rutina ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir primer ejercicio
                      </Button>
                    </DialogTrigger>
                    <RutinaEjercicioForm 
                      clienteId={clientId || ""} 
                      rutinaId={rutina.id}
                      onCancel={() => setShowAddDialog(false)}
                      onSuccess={handleAddSuccess}
                    />
                  </Dialog>
                ) : (
                  <Button className="mt-4" onClick={handleCreateRoutine}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear nueva rutina
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
