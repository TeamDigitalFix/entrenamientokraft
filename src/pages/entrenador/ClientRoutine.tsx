
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Plus, ArrowLeft, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// Definir días de la semana
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const ClientRoutine = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [routine, setRoutine] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Lunes");

  useEffect(() => {
    const fetchClientDetails = async () => {
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
        
        // Obtener rutina del cliente (ejemplo de datos)
        // En una implementación real, estos datos vendrían de la base de datos
        setRoutine([
          { id: 1, nombre: "Press de banca", series: 4, repeticiones: 10, dia: "Lunes", notas: "Mantener codos a 45 grados", peso: "70 kg" },
          { id: 2, nombre: "Sentadillas", series: 3, repeticiones: 12, dia: "Lunes", notas: "Profundidad completa", peso: "90 kg" },
          { id: 3, nombre: "Peso muerto", series: 3, repeticiones: 8, dia: "Miércoles", notas: "Mantener espalda recta", peso: "100 kg" },
          { id: 4, nombre: "Pull-ups", series: 4, repeticiones: 8, dia: "Viernes", notas: "Agarre amplio", peso: "Peso corporal" },
          { id: 5, nombre: "Press militar", series: 3, repeticiones: 10, dia: "Viernes", notas: "Evitar arquear espalda", peso: "40 kg" },
          { id: 6, nombre: "Curl de bíceps", series: 3, repeticiones: 12, dia: "Martes", notas: "Movimiento controlado", peso: "15 kg por brazo" },
        ]);
        
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
  }, [clientId, toast]);

  const handleAddExercise = () => {
    toast({
      title: "Función en desarrollo",
      description: "La función para añadir ejercicios está en desarrollo",
    });
  };

  // Agrupar ejercicios por día de la semana
  const ejerciciosPorDia = diasSemana.reduce((acc, dia) => {
    acc[dia] = routine.filter(ejercicio => ejercicio.dia === dia);
    return acc;
  }, {} as Record<string, typeof routine>);

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
            <Button onClick={handleAddExercise}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir ejercicio
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando rutina...</div>
            ) : routine.length > 0 ? (
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
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Peso</h4>
                                    <Badge variant="secondary">{ejercicio.peso}</Badge>
                                  </div>
                                  
                                  {ejercicio.notas && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Notas</h4>
                                      <p className="text-sm text-muted-foreground">{ejercicio.notas}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm">Editar</Button>
                                  <Button variant="outline" size="sm" className="text-destructive">
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
                        <Button className="mt-4" onClick={handleAddExercise}>
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir ejercicio para {dia}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 flex flex-col items-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Este cliente no tiene ejercicios asignados</p>
                <Button className="mt-4" onClick={handleAddExercise}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir primer ejercicio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientRoutine;
