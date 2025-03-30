import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { supabase } from "@/integrations/supabase/client";
import { Utensils, Plus, ArrowLeft, Info, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import DietaComidaForm from "@/components/entrenador/DietaComidaForm";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const mapDiaNumeroANombre = (diaNumero: number): string => {
  return diasSemana[diaNumero - 1] || "Desconocido";
};

interface Comida {
  id: string;
  tipo_comida: string;
  dia: string;
  cantidad: number;
  alimento_id: string;
  dieta_id: string;
  alimentos?: {
    nombre: string;
    categoria: string;
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
  };
}

interface Dieta {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
}

const ClientDiet = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [dieta, setDieta] = useState<Dieta | null>(null);
  const [comidas, setComidas] = useState<Comida[]>([]);
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
        
        const { data: dietasData, error: dietasError } = await supabase
          .from("dietas")
          .select("*")
          .eq("cliente_id", clientId)
          .order("fecha_inicio", { ascending: false })
          .limit(1);
        
        if (dietasError) throw dietasError;
        
        if (dietasData && dietasData.length > 0) {
          const dietaActual = dietasData[0];
          setDieta(dietaActual);
          
          const { data: comidasData, error: comidasError } = await supabase
            .from("dieta_comidas")
            .select(`
              id, 
              tipo_comida, 
              cantidad, 
              dia, 
              alimento_id, 
              dieta_id,
              alimentos:alimento_id (nombre, categoria, calorias, proteinas, carbohidratos, grasas)
            `)
            .eq("dieta_id", dietaActual.id);
          
          if (comidasError) throw comidasError;
          
          if (comidasData) {
            setComidas(comidasData);
          }
        } else {
          setDieta(null);
          setComidas([]);
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

  const handleAddMeal = () => {
    setShowAddDialog(true);
  };

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteMeal = async (comidaId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta comida?")) {
      try {
        const { error } = await supabase
          .from("dieta_comidas")
          .delete()
          .eq("id", comidaId);

        if (error) throw error;

        toast({
          title: "Comida eliminada",
          description: "La comida ha sido eliminada correctamente de la dieta."
        });

        setRefreshTrigger(prev => prev + 1);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `No se pudo eliminar la comida: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const comidasPorDia = diasSemana.reduce((acc, dia, index) => {
    const diaNumero = (index + 1).toString();
    acc[dia] = comidas.filter(comida => {
      if (/^[1-7]$/.test(comida.dia)) {
        return comida.dia === diaNumero;
      } else if (comida.dia.includes("-")) {
        const diaSemana = mapDiaNumeroANombre(parseInt(format(parseISO(comida.dia), "i", { locale: es })));
        return diaSemana === dia;
      }
      return false;
    });
    return acc;
  }, {} as Record<string, Comida[]>);

  const ordenComidas = {
    "Desayuno": 1,
    "Media mañana": 2,
    "Almuerzo": 3,
    "Merienda": 4,
    "Cena": 5,
    "Pre-entrenamiento": 6,
    "Post-entrenamiento": 7
  };

  const ordenarComidas = (comidas: Comida[]) => {
    return [...comidas].sort((a, b) => {
      const ordenA = ordenComidas[a.tipo_comida as keyof typeof ordenComidas] || 99;
      const ordenB = ordenComidas[b.tipo_comida as keyof typeof ordenComidas] || 99;
      return ordenA - ordenB;
    });
  };

  useEffect(() => {
    if (!loading && comidas.length > 0) {
      for (const dia of diasSemana) {
        if (comidasPorDia[dia]?.length > 0) {
          setActiveTab(dia);
          break;
        }
      }
    }
  }, [loading, comidas]);

  const calcularCalorias = (comida: Comida): number => {
    if (!comida.alimentos) return 0;
    return Math.round((comida.alimentos.calorias * comida.cantidad) / 100);
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
          <h1 className="text-3xl font-bold">Dieta de {clientName}</h1>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-2xl">Plan alimenticio</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleAddMeal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir comida
                </Button>
              </DialogTrigger>
              <DietaComidaForm 
                clienteId={clientId || ""} 
                dietaId={dieta?.id || null}
                onCancel={() => setShowAddDialog(false)}
                onSuccess={handleAddSuccess}
              />
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando plan alimenticio...</div>
            ) : comidas.length > 0 ? (
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
                        {ordenarComidas(comidasPorDia[dia]).map((comida) => (
                          <AccordionItem key={comida.id} value={`comida-${comida.id}`}>
                            <AccordionTrigger className="hover:no-underline py-3 px-4 data-[state=open]:bg-accent/50 rounded-t-md">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{comida.tipo_comida}</span>
                                  {comida.alimentos && (
                                    <span className="text-sm text-muted-foreground">
                                      {comida.alimentos.nombre}
                                    </span>
                                  )}
                                </div>
                                <Badge>{calcularCalorias(comida)} kcal</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-accent/20 rounded-b-md px-4 pb-4 pt-2">
                              <div className="space-y-3">
                                {comida.alimentos && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Alimento</h4>
                                      <div className="flex flex-col">
                                        <span className="text-sm">
                                          {comida.alimentos.nombre} ({comida.alimentos.categoria})
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {comida.cantidad}g ({comida.alimentos.calorias} kcal/100g)
                                        </span>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Macronutrientes</h4>
                                      <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">
                                          P: {Math.round((comida.alimentos.proteinas * comida.cantidad) / 100)}g
                                        </Badge>
                                        <Badge variant="outline">
                                          C: {Math.round((comida.alimentos.carbohidratos * comida.cantidad) / 100)}g
                                        </Badge>
                                        <Badge variant="outline">
                                          G: {Math.round((comida.alimentos.grasas * comida.cantidad) / 100)}g
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => handleDeleteMeal(comida.id)}
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
                        <Utensils className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No hay comidas programadas para {dia}</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="mt-4" onClick={handleAddMeal}>
                              <Plus className="h-4 w-4 mr-2" />
                              Añadir comida para {dia}
                            </Button>
                          </DialogTrigger>
                          <DietaComidaForm 
                            clienteId={clientId || ""} 
                            dietaId={dieta?.id || null}
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
                <Utensils className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Este cliente no tiene un plan alimenticio asignado</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear plan alimenticio
                    </Button>
                  </DialogTrigger>
                  <DietaComidaForm 
                    clienteId={clientId || ""} 
                    dietaId={null}
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

export default ClientDiet;
