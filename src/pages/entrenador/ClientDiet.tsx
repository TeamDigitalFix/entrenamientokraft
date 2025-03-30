
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { supabase } from "@/integrations/supabase/client";
import { Utensils, Plus, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const ClientDiet = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [diet, setDiet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          { id: 1, nombre: "Desayuno", alimentos: ["Avena con frutas", "Claras de huevo"], hora: "8:00", calorias: 450 },
          { id: 2, nombre: "Media mañana", alimentos: ["Yogur griego", "Frutos secos"], hora: "11:00", calorias: 250 },
          { id: 3, nombre: "Almuerzo", alimentos: ["Pechuga de pollo", "Arroz integral", "Ensalada"], hora: "14:00", calorias: 650 },
          { id: 4, nombre: "Merienda", alimentos: ["Batido de proteínas", "Plátano"], hora: "17:00", calorias: 300 },
          { id: 5, nombre: "Cena", alimentos: ["Salmón", "Vegetales al vapor"], hora: "20:00", calorias: 550 },
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comida</TableHead>
                    <TableHead>Alimentos</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Calorías</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diet.map((comida) => (
                    <TableRow key={comida.id}>
                      <TableCell className="font-medium">{comida.nombre}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {comida.alimentos.map((alimento: string, idx: number) => (
                            <Badge key={idx} variant="outline">{alimento}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{comida.hora}</TableCell>
                      <TableCell>{comida.calorias} kcal</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">Editar</Button>
                          <Button variant="ghost" size="sm" className="text-destructive">Eliminar</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
