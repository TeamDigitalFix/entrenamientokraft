
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Activity } from "@/types/admin";

export const useRecentActivity = () => {
  // Consulta de actividad reciente (últimos 5 registros)
  const { data: activity, isLoading, refetch } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      try {
        // Obtener los últimos 5 usuarios creados (de cualquier rol)
        const { data: recentUsers, error: usersError } = await supabase
          .from('usuarios')
          .select('id, nombre, role, creado_en')
          .order('creado_en', { ascending: false })
          .limit(5);
        
        if (usersError) throw usersError;
        
        // Obtener recientes cambios de estado (eliminación/restauración)
        const { data: recentStatusChanges, error: statusError } = await supabase
          .from('usuarios')
          .select('id, nombre, role, actualizado_en, eliminado')
          .or('eliminado.eq.true,eliminado.eq.false')
          .order('actualizado_en', { ascending: false })
          .limit(5);
          
        if (statusError) throw statusError;
        
        // Combinar ambos tipos de actividad
        const userActivities = recentUsers.map(user => ({
          type: 'user',
          title: `Nuevo ${user.role === 'entrenador' ? 'entrenador' : user.role === 'cliente' ? 'cliente' : 'administrador'} registrado`,
          description: `${user.nombre} se unió al sistema`,
          date: new Date(user.creado_en)
        }));
        
        const statusActivities = recentStatusChanges.map(user => ({
          type: 'status',
          title: user.eliminado 
            ? `${user.role === 'entrenador' ? 'Entrenador' : user.role === 'cliente' ? 'Cliente' : 'Administrador'} enviado a papelera` 
            : `${user.role === 'entrenador' ? 'Entrenador' : user.role === 'cliente' ? 'Cliente' : 'Administrador'} restaurado`,
          description: `${user.nombre} fue ${user.eliminado ? 'eliminado' : 'restaurado'}`,
          date: new Date(user.actualizado_en)
        }));
        
        // Combinar y ordenar por fecha (más reciente primero)
        const allActivities = [...userActivities, ...statusActivities]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);
          
        return allActivities;
      } catch (error) {
        console.error("Error al obtener actividad reciente:", error);
        toast.error("Error al cargar actividad reciente");
        return [];
      }
    }
  });

  return { activity, isLoading, refetch };
};
