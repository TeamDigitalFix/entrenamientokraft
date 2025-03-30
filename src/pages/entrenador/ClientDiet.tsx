
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { supabase } from "@/integrations/supabase/client";
import { Utensils, Plus, ArrowLeft, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Definir días de la semana
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const ClientDiet = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [diet, setDiet] = useState<any[]>([]);
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
        
        // Obtener dieta del cliente (ejemplo de datos)
        // En una implementación real, estos datos vendrían de la base de datos
        setDiet([
          { id: 1, nombre: "Desayuno", alimentos: ["Avena con frutas", "Claras de huevo"], hora: "8:00", calorias: 450, dia: "Lunes" },
          { id: 2, nombre: "Media mañana", alimentos: ["Yogur griego", "Frutos secos"], hora: "11:00", calorias: 250, dia: "Lunes" },
          { id: 3, nombre: "Almuerzo", alimentos: ["Pechuga de pollo", "Arroz integral", "Ensalada"], hora: "14:00", calorias: 650, dia: "Lunes" },
          { id: 4, nombre: "Merienda", alimentos: ["Batido de proteínas", "Plátano"], hora: "17:00", calorias: 300, dia: "Martes" },
          { id: 5, nombre: "Cena", alimentos: ["Salmón", "Vegetales al vapor"], hora: "20:00", calorias: 550, dia: "Martes" },
          { id: 6, nombre: "Desayuno", alimentos: ["Tostadas integrales", "Huevos revueltos"], hora: "8:00", calorias: 400, dia: "Miércoles" },
          { id: 7, nombre: "Almuerzo", alimentos: ["Lentejas", "Quinoa", "Tomate"], hora: "14:00", calorias: 580, dia: "Miércoles" },
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

  const handleAddMeal = () => {
    toast({
      title: "Función en desarrollo",
      description: "La función para añadir comidas está en desarrollo",
    });
  };

  // Agrupar comidas por día de la semana
  const comidasPorDia = diasSemana.reduce((acc, dia) => {
    acc[dia] = diet.filter(comida => comida.dia === dia);
    return acc;
  }, {} as Record<string, typeof diet>);

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
          <h1 className="text-3xl font-bold">Dieta de {clientName}</h1>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-2xl">Plan alimenticio</CardTitle>
            <Button onClick={handleAddMeal}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir comida
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando plan alimenticio...</div>
            ) : diet.length > 0 ? (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full flex mb-4 overflow-x-auto">
                  {diasSemana.map(dia => (
                    <TabsTrigger
                      key={dia}
                      value={dia}
                      className="flex-1"
                      disabled={comidasPorDia[dia]?.length === 0}
                    >
                      {dia}
                      {comidasPorDia[dia]?.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {comidasPorDia[dia].length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {diasSemana.map(dia => (
                  <TabsContent key={dia} value={dia} className="space-y-4">
                    {comidasPorDia[dia]?.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {comidasPorDia[dia].map((comida) => (
                          <AccordionItem key={comida.id} value={`comida-${comida.id}`}>
                            <AccordionTrigger className="hover:no-underline py-3 px-4 data-[state=open]:bg-accent/50 rounded-t-md">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{comida.nombre}</span>
                                  <Badge variant="outline">{comida.hora}</Badge>
                                </div>
                                <Badge>{comida.calorias} kcal</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-accent/20 rounded-b-md px-4 pb-4 pt-2">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Alimentos</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {comida.alimentos.map((alimento: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">
                                        {alimento}
                                      </Badge>
                                    ))}
                                  </div>
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
                        <Utensils className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No hay comidas programadas para {dia}</p>
                        <Button className="mt-4" onClick={handleAddMeal}>
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir comida para {dia}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 flex flex-col items-center">
                <Utensils className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Este cliente no tiene un plan alimenticio asignado</p>
                <Button className="mt-4" onClick={handleAddMeal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear plan alimenticio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDiet;
