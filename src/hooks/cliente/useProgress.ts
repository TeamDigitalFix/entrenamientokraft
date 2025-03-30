
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ProgressMeasurement, NewMeasurement } from "@/types/progress";
import { calculateChanges, formatChartData } from "@/utils/progressUtils";

export const useProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get all client measurements
  const { data: measurements, isLoading: isLoadingMeasurements } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];

        console.log("Consultando mediciones para usuario:", user.id);
        
        // Check for measurements in the database using the right column names
        const { data, error } = await supabase
          .from("progreso")
          .select("id, fecha, peso, grasa_corporal, masa_muscular, notas, cliente_id")
          .eq("cliente_id", user.id)
          .order("fecha", { ascending: false });

        if (error) {
          console.error("Error en la consulta:", error);
          throw error;
        }

        console.log("Mediciones obtenidas desde la BD:", data);
        console.log("Número de mediciones encontradas:", data ? data.length : 0);
        
        // If we have data, return it
        if (data && data.length > 0) {
          return data as ProgressMeasurement[];
        }
        
        // If no data found, log it
        console.log("No se encontraron mediciones para el usuario");
        return [];
      } catch (error) {
        console.error("Error al cargar mediciones:", error);
        toast.error("No se pudieron cargar las mediciones");
        return [];
      }
    },
    enabled: !!user?.id,
    // Add these options to ensure we always get fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Get the latest measurement
  const latestMeasurement = measurements && measurements.length > 0 
    ? measurements[0] 
    : null;

  // Get the first measurement to calculate changes
  const firstMeasurement = measurements && measurements.length > 0 
    ? measurements[measurements.length - 1] 
    : null;

  // Mutation to add a new measurement
  const { mutate: addMeasurement, isPending: isAddingMeasurement } = useMutation({
    mutationFn: async (newMeasurement: NewMeasurement) => {
      try {
        if (!user?.id) {
          console.error("Usuario no autenticado");
          toast.error("Debes iniciar sesión para registrar mediciones");
          throw new Error("Usuario no autenticado");
        }

        console.log("Añadiendo medición para usuario:", user.id);
        console.log("Datos de medición:", newMeasurement);
        
        // Verify values are valid before sending
        if (isNaN(newMeasurement.peso) || newMeasurement.peso <= 0) {
          toast.error("El peso debe ser un número positivo");
          throw new Error("El peso debe ser un número positivo");
        }
        
        // Use current date for the measurement
        const now = new Date();
        const currentDateString = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        console.log("Fecha formateada:", currentDateString);
        
        // Now insert directly into the progreso table
        const { data, error } = await supabase
          .from('progreso')
          .insert({
            cliente_id: user.id,
            peso: newMeasurement.peso,
            grasa_corporal: newMeasurement.grasa_corporal || null,
            masa_muscular: newMeasurement.masa_muscular || null,
            notas: newMeasurement.notas || null,
            fecha: currentDateString
          })
          .select()
          .single();
        
        if (error) {
          console.error("Error al insertar medición:", error);
          throw error;
        }
        
        console.log("Medición guardada con éxito:", data);
        return data;
      } catch (error) {
        console.error("Error al guardar medición:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Medición registrada con éxito:", data);
      toast.success("Medición registrada correctamente");
      
      // Force invalidation and immediate reload of data
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
      
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error al registrar medición:", error);
      const errorMessage = error?.message || "Error desconocido";
      toast.error(`No se pudo registrar la medición: ${errorMessage}`);
    },
  });

  return {
    measurements,
    isLoadingMeasurements,
    latestMeasurement,
    changes: calculateChanges(latestMeasurement, firstMeasurement),
    addMeasurement,
    isAddingMeasurement,
    chartData: formatChartData(measurements || []),
    isDialogOpen,
    setIsDialogOpen
  };
};
