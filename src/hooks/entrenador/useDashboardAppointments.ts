
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export type DashboardAppointment = {
  id: string;
  title: string;
  description: string | null;
  client: {
    id: string;
    name: string;
    initials: string;
  };
  time: string;
};

export const useDashboardAppointments = () => {
  const { user } = useAuth();

  const { data: todayAppointments, isLoading } = useQuery({
    queryKey: ["dashboard", "appointments", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];

        const today = new Date();
        const todayIso = format(today, "yyyy-MM-dd");
        
        // Citas de hoy
        const { data, error } = await supabase
          .from("citas")
          .select("id, titulo, descripcion, fecha, cliente_id")
          .eq("entrenador_id", user.id)
          .eq("estado", "programada")
          .gte("fecha", `${todayIso}T00:00:00`)
          .lte("fecha", `${todayIso}T23:59:59`)
          .order("fecha", { ascending: true });
          
        if (error) throw error;
        
        // Obtener nombres de clientes
        const appointments = await Promise.all(data.map(async (appointment) => {
          const { data: clientData, error: clientError } = await supabase
            .from("usuarios")
            .select("nombre")
            .eq("id", appointment.cliente_id)
            .single();
            
          if (clientError) {
            console.warn(`No se pudo obtener el cliente para la cita ${appointment.id}:`, clientError);
            return null;
          }
          
          const name = clientData?.nombre || "Cliente";
          const initials = name
            .split(" ")
            .map(n => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          
          return {
            id: appointment.id,
            title: appointment.titulo,
            description: appointment.descripcion,
            client: {
              id: appointment.cliente_id,
              name,
              initials
            },
            time: format(parseISO(appointment.fecha), "HH:mm", { locale: es })
          };
        }));
        
        return appointments.filter(Boolean) as DashboardAppointment[];
      } catch (error) {
        console.error("Error al cargar citas de hoy:", error);
        toast.error("No se pudieron cargar las citas de hoy");
        return [];
      }
    },
    enabled: !!user?.id
  });

  return { todayAppointments, isLoading };
};
