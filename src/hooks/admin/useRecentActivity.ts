
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
        
        return recentUsers.map(user => ({
          type: 'user',
          title: `Nuevo ${user.role === 'entrenador' ? 'entrenador' : user.role === 'cliente' ? 'cliente' : 'administrador'} registrado`,
          description: `${user.nombre} se unió al sistema`,
          date: new Date(user.creado_en)
        }));
      } catch (error) {
        console.error("Error al obtener actividad reciente:", error);
        toast.error("Error al cargar actividad reciente");
        return [];
      }
    }
  });

  return { activity, isLoading, refetch };
};
