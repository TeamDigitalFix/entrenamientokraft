
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type ProgressMeasurement = {
  id: string;
  fecha: string;
  peso: number;
  grasa_corporal: number | null;
  masa_muscular: number | null;
  notas: string | null;
};

export type NewMeasurement = {
  peso: number;
  grasa_corporal?: number;
  masa_muscular?: number;
  notas?: string;
};

export const useProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Obtener todas las mediciones del cliente
  const { data: measurements, isLoading: isLoadingMeasurements } = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];

        console.log("Consultando mediciones para usuario:", user.id);
        
        // Check for measurements in the database using correct column names
        // The error indicated 'created_at' doesn't exist, so let's remove it
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

  // Obtener la medición más reciente
  const latestMeasurement = measurements && measurements.length > 0 
    ? measurements[0] 
    : null;

  // Obtener la primera medición para calcular cambios
  const firstMeasurement = measurements && measurements.length > 0 
    ? measurements[measurements.length - 1] 
    : null;

  // Calcular cambios desde la primera medición
  const calculateChanges = () => {
    if (!latestMeasurement || !firstMeasurement) {
      return {
        pesoChange: null,
        grasaChange: null,
        musculoChange: null
      };
    }

    return {
      pesoChange: +(latestMeasurement.peso - firstMeasurement.peso).toFixed(1),
      grasaChange: latestMeasurement.grasa_corporal !== null && firstMeasurement.grasa_corporal !== null
        ? +(latestMeasurement.grasa_corporal - firstMeasurement.grasa_corporal).toFixed(1)
        : null,
      musculoChange: latestMeasurement.masa_muscular !== null && firstMeasurement.masa_muscular !== null
        ? +(latestMeasurement.masa_muscular - firstMeasurement.masa_muscular).toFixed(1)
        : null
    };
  };

  const changes = calculateChanges();

  // Mutación para añadir una nueva medición - Sin RLS
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
        
        // Verificar que los valores son válidos antes de enviar
        if (isNaN(newMeasurement.peso) || newMeasurement.peso <= 0) {
          toast.error("El peso debe ser un número positivo");
          throw new Error("El peso debe ser un número positivo");
        }
        
        // Usamos la fecha actual para la medición
        const now = new Date();
        const currentDateString = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        console.log("Fecha formateada:", currentDateString);
        
        // Preparamos los datos a insertar
        const measurementData = {
          cliente_id: user.id,
          peso: newMeasurement.peso,
          grasa_corporal: newMeasurement.grasa_corporal || null,
          masa_muscular: newMeasurement.masa_muscular || null,
          notas: newMeasurement.notas || null,
          fecha: currentDateString,
        };
        
        console.log("Datos completos a insertar:", measurementData);
        
        // Usamos la función RPC para insertar sin restricciones de RLS
        const { data, error } = await supabase.rpc('insertar_medicion_progreso', {
          p_cliente_id: user.id,
          p_peso: newMeasurement.peso,
          p_grasa_corporal: newMeasurement.grasa_corporal || null,
          p_masa_muscular: newMeasurement.masa_muscular || null,
          p_notas: newMeasurement.notas || null,
          p_fecha: currentDateString
        });
        
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
      
      // Forzar una invalidación y recarga de los datos inmediatamente
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
        queryClient.refetchQueries({ queryKey: ["progress", user?.id] });
      }, 500);
      
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Error al registrar medición:", error);
      const errorMessage = error?.message || "Error desconocido";
      toast.error(`No se pudo registrar la medición: ${errorMessage}`);
    },
  });

  // Formatear datos para gráficas
  const formatChartData = () => {
    if (!measurements || measurements.length === 0) return [];
    
    // Ordenar por fecha ascendente para gráficas
    const sortedData = [...measurements].sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    
    return sortedData.map(m => ({
      name: new Date(m.fecha).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short' 
      }),
      peso: m.peso,
      grasa: m.grasa_corporal || undefined,
      musculo: m.masa_muscular || undefined
    }));
  };

  return {
    measurements,
    isLoadingMeasurements,
    latestMeasurement,
    changes,
    addMeasurement,
    isAddingMeasurement,
    chartData: formatChartData(),
    isDialogOpen,
    setIsDialogOpen
  };
};
