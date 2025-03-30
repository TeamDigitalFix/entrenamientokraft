
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ProgressMeasurement } from "@/types/progress";
import { calculateChanges, formatChartData } from "@/utils/progressUtils";

export const useMeasurementQueries = () => {
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
          .select("id, fecha, peso, grasa_corporal, masa_muscular, notas, cliente_id, altura, circunferencia_cuello, circunferencia_cintura, circunferencia_cadera, sexo")
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

  // Get the latest measurement - ensure we're getting the first one in the array 
  // since they're already ordered by date descending
  const latestMeasurement = measurements && measurements.length > 0 
    ? measurements[0] 
    : null;

  // Get the first measurement (chronologically oldest) to calculate changes
  const firstMeasurement = measurements && measurements.length > 0 
    ? measurements[measurements.length - 1] 
    : null;

  // Calculate the changes and format chart data
  const changes = calculateChanges(latestMeasurement, firstMeasurement);
  const chartData = formatChartData(measurements || []);

  return {
    measurements,
    isLoadingMeasurements,
    latestMeasurement,
    firstMeasurement,
    changes,
    chartData,
    isDialogOpen,
    setIsDialogOpen
  };
};
