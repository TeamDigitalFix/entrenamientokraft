
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Stats } from "@/types/admin";

export const useStats = () => {
  // Consulta de estadísticas generales
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // Contar entrenadores
        const { data: trainers, error: trainersError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('role', 'entrenador')
          .eq('eliminado', false);
        
        if (trainersError) throw trainersError;
        
        // Contar clientes
        const { data: clients, error: clientsError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('role', 'cliente')
          .eq('eliminado', false);
        
        if (clientsError) throw clientsError;
        
        // Contar clientes con dietas (usando un enfoque diferente sin .distinct())
        const { data: dietas, error: dietsError } = await supabase
          .from('dietas')
          .select('cliente_id');
        
        if (dietsError) throw dietsError;
        
        // Obtener una lista única de clientes con dietas
        const clientesConDietas = [...new Set(dietas?.map(d => d.cliente_id))];
        
        // Contar clientes con rutinas (usando un enfoque diferente sin .distinct())
        const { data: rutinas, error: routinesError } = await supabase
          .from('rutinas')
          .select('cliente_id');
        
        if (routinesError) throw routinesError;
        
        // Obtener una lista única de clientes con rutinas
        const clientesConRutinas = [...new Set(rutinas?.map(r => r.cliente_id))];
        
        // Contar ejercicios
        const { data: exercises, error: exercisesError } = await supabase
          .from('ejercicios')
          .select('id');
        
        if (exercisesError) throw exercisesError;
        
        // Contar alimentos
        const { data: foods, error: foodsError } = await supabase
          .from('alimentos')
          .select('id');
        
        if (foodsError) throw foodsError;
        
        const stats: Stats = {
          totalTrainers: trainers?.length || 0,
          activeTrainers: trainers?.length || 0, // Todos los no eliminados se consideran activos
          totalClients: clients?.length || 0,
          clientsWithDiets: clientesConDietas.length || 0,
          clientsWithRoutines: clientesConRutinas.length || 0,
          totalExercises: exercises?.length || 0,
          totalFoods: foods?.length || 0
        };
        
        return stats;
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        toast.error("Error al cargar estadísticas");
        return {
          totalTrainers: 0,
          activeTrainers: 0,
          totalClients: 0,
          clientsWithDiets: 0,
          clientsWithRoutines: 0,
          totalExercises: 0,
          totalFoods: 0
        };
      }
    }
  });

  return { stats, isLoading, refetch };
};
