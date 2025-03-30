
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

// Definir días de la semana
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Mapear números de día a nombres de día
const mapDiaNumeroANombre = (diaNumero: number): string => {
  return diasSemana[diaNumero - 1] || "Desconocido";
};

interface Ejercicio {
  id: string;
  nombre: string;
  series: number;
  repeticiones: number;
  dia: number;
  notas?: string;
  peso?: string;
  rutina_id: string;
  ejercicio_id: string;
  ejercicio?: {
    nombre: string;
    grupo_muscular: string;
    descripcion?: string;
  };
}

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
        
        // Obtener datos del cliente
        const { data: clientData, error: clientError } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", clientId)
          .single();
        
        if (clientError) throw clientError;
        setClientName(clientData?.nombre || "Cliente");
        
        // Obtener la rutina más reciente del cliente
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
          
          // Obtener ejercicios de la rutina con detalles del ejercicio
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
            // Transformar los datos para que sean más fáciles de usar
            const ejerciciosTransformados = ejerciciosData.map(ej => ({
              ...ej,
              nombre: ej.ejercicios?.nombre || "Ejercicio sin nombre",
              dia: ej.dia,
            }));
            
            setEjercicios(ejerciciosTransformados as Ejercicio[]);
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

  // Agrupar ejercicios por día de la semana
  const ejerciciosPorDia = diasSemana.reduce((acc, dia, index) => {
    const diaNumero = index + 1;
    acc[dia] = ejercicios.filter(ejercicio => ejercicio.dia === diaNumero);
    return acc;
  }, {} as Record<string, Ejercicio[]>);

  // Determinar qué pestaña debe estar activa por defecto (la primera que tenga ejercicios)
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
            <CardTitle className="text-2xl">Programa de entrenamiento</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleAddExercise}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir ejercicio
                </Button>
              </DialogTrigger>
              <RutinaEjercicioForm 
                clienteId={clientId || ""} 
                rutinaId={rutina?.id || null}
                onCancel={() => setShowAddDialog(false)}
                onSuccess={handleAddSuccess}
              />
            </Dialog>
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
                                  
                                  {ejercicio.ejercicio && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Grupo muscular</h4>
                                      <Badge variant="outline">{ejercicio.ejercicio.grupo_muscular}</Badge>
                                    </div>
                                  )}
                                  
                                  {ejercicio.notas && (
                                    <div className="col-span-full">
                                      <h4 className="text-sm font-medium mb-1">Notas</h4>
                                      <p className="text-sm text-muted-foreground">{ejercicio.notas}</p>
                                    </div>
                                  )}
                                  
                                  {ejercicio.ejercicio?.descripcion && (
                                    <div className="col-span-full">
                                      <h4 className="text-sm font-medium mb-1">Descripción</h4>
                                      <p className="text-sm text-muted-foreground">{ejercicio.ejercicio.descripcion}</p>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir primer ejercicio
                    </Button>
                  </DialogTrigger>
                  <RutinaEjercicioForm 
                    clienteId={clientId || ""} 
                    rutinaId={null}
                    onCancel={() => setShowAddDialog(false)}
                    onSuccess={handleAddSuccess}
                  />
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientRoutine;
