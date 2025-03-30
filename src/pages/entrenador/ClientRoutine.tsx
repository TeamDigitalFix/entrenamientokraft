
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Plus, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const ClientRoutine = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [routine, setRoutine] = useState<any[]>([]);
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
        
        // Obtener rutina del cliente (ejemplo de datos)
        // En una implementación real, estos datos vendrían de la base de datos
        setRoutine([
          { id: 1, nombre: "Press de banca", series: 4, repeticiones: 10, dia: "Lunes" },
          { id: 2, nombre: "Sentadillas", series: 3, repeticiones: 12, dia: "Lunes" },
          { id: 3, nombre: "Peso muerto", series: 3, repeticiones: 8, dia: "Miércoles" },
          { id: 4, nombre: "Pull-ups", series: 4, repeticiones: 8, dia: "Viernes" },
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ejercicio</TableHead>
                    <TableHead>Series</TableHead>
                    <TableHead>Repeticiones</TableHead>
                    <TableHead>Día</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routine.map((ejercicio) => (
                    <TableRow key={ejercicio.id}>
                      <TableCell className="font-medium">{ejercicio.nombre}</TableCell>
                      <TableCell>{ejercicio.series}</TableCell>
                      <TableCell>{ejercicio.repeticiones}</TableCell>
                      <TableCell>{ejercicio.dia}</TableCell>
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
