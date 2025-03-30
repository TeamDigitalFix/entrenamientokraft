
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

        const { data, error } = await supabase
          .from("progreso")
          .select("*")
          .eq("cliente_id", user.id)
          .order("fecha", { ascending: false });

        if (error) {
          console.error("Error en la consulta:", error);
          throw error;
        }

        return data as ProgressMeasurement[];
      } catch (error) {
        console.error("Error al cargar mediciones:", error);
        toast.error("No se pudieron cargar las mediciones");
        return [];
      }
    },
    enabled: !!user?.id,
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

  // Mutación para añadir una nueva medición
  const { mutate: addMeasurement, isPending: isAddingMeasurement } = useMutation({
    mutationFn: async (newMeasurement: NewMeasurement) => {
      console.log("Añadiendo medición:", newMeasurement);
      
      if (!user?.id) {
        console.error("Usuario no autenticado");
        throw new Error("Usuario no autenticado");
      }

      const measurementData = {
        cliente_id: user.id,
        peso: newMeasurement.peso,
        grasa_corporal: newMeasurement.grasa_corporal || null,
        masa_muscular: newMeasurement.masa_muscular || null,
        notas: newMeasurement.notas || null,
        fecha: new Date().toISOString(),
      };
      
      console.log("Datos a insertar:", measurementData);
      
      const { data, error } = await supabase
        .from("progreso")
        .insert(measurementData)
        .select();

      if (error) {
        console.error("Error al insertar:", error);
        throw error;
      }
      
      console.log("Medición registrada:", data);
      return data;
    },
    onSuccess: () => {
      toast.success("Medición registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error al registrar medición:", error);
      toast.error("No se pudo registrar la medición");
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
