
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { NewMeasurement, calculateBodyFatPercentage, calculateMuscleMassPercentage } from "@/types/progress";
import { format } from "date-fns";

export const useMeasurementMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mutation to add a new measurement
  const { mutate: addMeasurement, isPending: isAddingMeasurement } = useMutation({
    mutationFn: async (newMeasurement: NewMeasurement) => {
      try {
        if (!user?.id) {
          console.error("Usuario no autenticado");
          toast.error("Debes iniciar sesión para registrar mediciones");
          throw new Error("Usuario no autenticado");
        }

        console.log("Procesando medición para usuario:", user.id);
        console.log("Datos de medición:", newMeasurement);
        
        // Verify values are valid before sending
        if (isNaN(newMeasurement.peso) || newMeasurement.peso <= 0) {
          toast.error("El peso debe ser un número positivo");
          throw new Error("El peso debe ser un número positivo");
        }
        
        // Use provided date or current date for the measurement
        const measurementDate = newMeasurement.fecha || new Date();
        // Format date as YYYY-MM-DD
        const dateString = format(measurementDate, 'yyyy-MM-dd');
        
        console.log("Fecha formateada:", dateString);
        
        // Check if there's already a measurement for this date
        const { data: existingMeasurement, error: queryError } = await supabase
          .from('progreso')
          .select('id')
          .eq('cliente_id', user.id)
          .eq('fecha', dateString)
          .maybeSingle();
        
        if (queryError) {
          console.error("Error al verificar mediciones existentes:", queryError);
          throw queryError;
        }
        
        let result;
        
        // Si se proporcionan suficientes datos para el método Navy, calcular los porcentajes
        let grasaCorpCalculada = newMeasurement.grasa_corporal;
        let masaMuscCalculada = newMeasurement.masa_muscular;
        
        // Calcular porcentajes si hay suficientes datos
        if (newMeasurement.altura && newMeasurement.circunferencia_cuello && 
            newMeasurement.circunferencia_cintura && newMeasurement.sexo) {
              
          if (grasaCorpCalculada === undefined) {
            const calculatedBF = calculateBodyFatPercentage(
              newMeasurement.altura,
              newMeasurement.circunferencia_cuello,
              newMeasurement.circunferencia_cintura,
              newMeasurement.circunferencia_cadera,
              newMeasurement.sexo
            );
            
            if (calculatedBF !== null) {
              grasaCorpCalculada = calculatedBF;
              
              // Si no se proporcionó masa muscular, calcularla
              if (masaMuscCalculada === undefined) {
                const calculatedMM = calculateMuscleMassPercentage(calculatedBF);
                if (calculatedMM !== null) {
                  masaMuscCalculada = calculatedMM;
                }
              }
            }
          }
        }
        
        if (existingMeasurement) {
          // Update the existing measurement for the selected date
          console.log("Actualizando medición existente para:", dateString);
          
          const { data, error } = await supabase
            .from('progreso')
            .update({
              peso: newMeasurement.peso,
              grasa_corporal: grasaCorpCalculada || null,
              masa_muscular: masaMuscCalculada || null,
              notas: newMeasurement.notas || null,
              altura: newMeasurement.altura || null,
              circunferencia_cuello: newMeasurement.circunferencia_cuello || null,
              circunferencia_cintura: newMeasurement.circunferencia_cintura || null,
              circunferencia_cadera: newMeasurement.circunferencia_cadera || null,
              sexo: newMeasurement.sexo || null
            })
            .eq('id', existingMeasurement.id)
            .select()
            .single();
          
          if (error) {
            console.error("Error al actualizar medición:", error);
            throw error;
          }
          
          result = data;
          console.log("Medición actualizada con éxito:", data);
        } else {
          // Insert a new measurement
          console.log("Creando nueva medición para:", dateString);
          
          const { data, error } = await supabase
            .from('progreso')
            .insert({
              cliente_id: user.id,
              peso: newMeasurement.peso,
              grasa_corporal: grasaCorpCalculada || null,
              masa_muscular: masaMuscCalculada || null,
              notas: newMeasurement.notas || null,
              fecha: dateString,
              altura: newMeasurement.altura || null,
              circunferencia_cuello: newMeasurement.circunferencia_cuello || null,
              circunferencia_cintura: newMeasurement.circunferencia_cintura || null,
              circunferencia_cadera: newMeasurement.circunferencia_cadera || null,
              sexo: newMeasurement.sexo || null
            })
            .select()
            .single();
          
          if (error) {
            console.error("Error al insertar medición:", error);
            throw error;
          }
          
          result = data;
          console.log("Medición guardada con éxito:", data);
        }
        
        return result;
      } catch (error) {
        console.error("Error al guardar medición:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Medición procesada con éxito:", data);
      toast.success("Medición registrada correctamente");
      
      // Force invalidation and immediate reload of data
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
    },
    onError: (error: any) => {
      console.error("Error al registrar medición:", error);
      const errorMessage = error?.message || "Error desconocido";
      toast.error(`No se pudo registrar la medición: ${errorMessage}`);
    },
  });

  // Mutation to delete a measurement
  const { mutate: deleteMeasurement, isPending: isDeletingMeasurement } = useMutation({
    mutationFn: async (measurementId: string) => {
      try {
        if (!user?.id) {
          throw new Error("Usuario no autenticado");
        }

        console.log("Eliminando medición con ID:", measurementId);
        
        const { error } = await supabase
          .from("progreso")
          .delete()
          .eq("id", measurementId)
          .eq("cliente_id", user.id); // Seguridad adicional para asegurar que solo elimine mediciones propias

        if (error) {
          console.error("Error al eliminar medición:", error);
          throw error;
        }

        return measurementId;
      } catch (error) {
        console.error("Error al eliminar medición:", error);
        throw error;
      }
    },
    onSuccess: (measurementId) => {
      console.log("Medición eliminada con éxito:", measurementId);
      toast.success("Medición eliminada correctamente");
      
      // Force invalidation and immediate reload of data
      queryClient.invalidateQueries({ queryKey: ["progress", user?.id] });
    },
    onError: (error: any) => {
      console.error("Error al eliminar medición:", error);
      const errorMessage = error?.message || "Error desconocido";
      toast.error(`No se pudo eliminar la medición: ${errorMessage}`);
    },
  });

  return {
    addMeasurement,
    isAddingMeasurement,
    deleteMeasurement,
    isDeletingMeasurement
  };
};
