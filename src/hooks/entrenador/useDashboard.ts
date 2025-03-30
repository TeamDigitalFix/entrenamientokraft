
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";

export type DashboardStats = {
  totalClients: number;
  activeClients: number;
  upcomingAppointments: number;
  unreadMessages: number;
  completedToday: number;
};

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

export type DashboardMessage = {
  id: string;
  sender: {
    id: string;
    name: string;
    initials: string;
  };
  content: string;
  timeAgo: string;
  read: boolean;
};

export type WeeklyActivity = {
  day: string;
  clientes: number;
  ejercicios: number;
};

export const useDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Obtener estadísticas del dashboard
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard", "stats", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return null;

        // Total de clientes
        const { data: clientsData, error: clientsError } = await supabase
          .from("usuarios")
          .select("id, ultimo_ingreso")
          .eq("entrenador_id", user.id)
          .eq("role", "cliente")
          .eq("eliminado", false);
          
        if (clientsError) throw clientsError;

        // Clientes activos (con actividad en los últimos 7 días)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeClients = clientsData.filter(client => 
          client.ultimo_ingreso && new Date(client.ultimo_ingreso) >= sevenDaysAgo
        );

        // Citas próximas (próximos 7 días)
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("citas")
          .select("id")
          .eq("entrenador_id", user.id)
          .eq("estado", "programada")
          .gte("fecha", new Date().toISOString())
          .lte("fecha", new Date(new Date().setDate(new Date().getDate() + 7)).toISOString());
          
        if (appointmentsError) throw appointmentsError;

        // Mensajes sin leer
        const { data: messagesData, error: messagesError } = await supabase
          .from("mensajes")
          .select("id")
          .eq("receptor_id", user.id)
          .eq("leido", false);
          
        if (messagesError) throw messagesError;

        // Ejercicios completados hoy
        const { data: exercisesData, error: exercisesError } = await supabase
          .from("ejercicios_diarios")
          .select("cantidad")
          .eq("entrenador_id", user.id)
          .eq("fecha", format(new Date(), "yyyy-MM-dd"));
          
        if (exercisesError) throw exercisesError;

        const completedToday = exercisesData.length > 0 
          ? exercisesData.reduce((sum, item) => sum + item.cantidad, 0) 
          : 0;

        return {
          totalClients: clientsData.length,
          activeClients: activeClients.length,
          upcomingAppointments: appointmentsData.length,
          unreadMessages: messagesData.length,
          completedToday
        } as DashboardStats;
      } catch (error) {
        console.error("Error al cargar estadísticas del dashboard:", error);
        toast.error("No se pudieron cargar las estadísticas del dashboard");
        return null;
      }
    },
    enabled: !!user?.id
  });

  // Obtener citas de hoy
  const { data: todayAppointments, isLoading: isLoadingAppointments } = useQuery({
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

  // Obtener mensajes recientes
  const { data: recentMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["dashboard", "messages", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];

        // Mensajes recientes
        const { data, error } = await supabase
          .from("mensajes")
          .select("id, emisor_id, contenido, creado_en, leido")
          .eq("receptor_id", user.id)
          .order("creado_en", { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Obtener nombres de emisores
        const messages = await Promise.all(data.map(async (message) => {
          const { data: senderData, error: senderError } = await supabase
            .from("usuarios")
            .select("nombre")
            .eq("id", message.emisor_id)
            .single();
            
          if (senderError) {
            console.warn(`No se pudo obtener el emisor para el mensaje ${message.id}:`, senderError);
            return null;
          }
          
          const name = senderData?.nombre || "Usuario";
          const initials = name
            .split(" ")
            .map(n => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          
          // Formatear tiempo relativo
          const messageDate = parseISO(message.creado_en);
          let timeAgo = "hace un momento";
          
          const diffMinutes = Math.floor((new Date().getTime() - messageDate.getTime()) / (1000 * 60));
          
          if (diffMinutes < 1) {
            timeAgo = "hace un momento";
          } else if (diffMinutes < 60) {
            timeAgo = `Hace ${diffMinutes} minutos`;
          } else if (diffMinutes < 24 * 60) {
            const hours = Math.floor(diffMinutes / 60);
            timeAgo = `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
          } else {
            const days = Math.floor(diffMinutes / (60 * 24));
            timeAgo = `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
          }
          
          return {
            id: message.id,
            sender: {
              id: message.emisor_id,
              name,
              initials
            },
            content: message.contenido.length > 50 
              ? message.contenido.substring(0, 50) + "..." 
              : message.contenido,
            timeAgo,
            read: message.leido
          };
        }));
        
        return messages.filter(Boolean) as DashboardMessage[];
      } catch (error) {
        console.error("Error al cargar mensajes recientes:", error);
        toast.error("No se pudieron cargar los mensajes recientes");
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Obtener actividad semanal
  const { data: weeklyActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["dashboard", "activity", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];

        const today = new Date();
        const sevenDaysAgo = subDays(today, 6); // Para tener 7 días completos
        
        // Formatear fechas para la consulta
        const startDate = format(sevenDaysAgo, "yyyy-MM-dd");
        const endDate = format(today, "yyyy-MM-dd");
        
        // Obtener sesiones diarias
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("sesiones_diarias")
          .select("dia_semana, completada")
          .eq("entrenador_id", user.id)
          .gte("fecha", startDate)
          .lte("fecha", endDate)
          .order("fecha", { ascending: true });
          
        if (sessionsError) throw sessionsError;
        
        // Obtener ejercicios diarios
        const { data: exercisesData, error: exercisesError } = await supabase
          .from("ejercicios_diarios")
          .select("dia_semana, cantidad")
          .eq("entrenador_id", user.id)
          .gte("fecha", startDate)
          .lte("fecha", endDate)
          .order("fecha", { ascending: true });
          
        if (exercisesError) throw exercisesError;
        
        // Crear objeto para los días de la semana
        const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        const activityMap: Record<string, { clientes: number, ejercicios: number }> = {};
        
        // Inicializar todos los días
        diasSemana.forEach(dia => {
          activityMap[dia] = { clientes: 0, ejercicios: 0 };
        });
        
        // Llenar con datos de sesiones
        sessionsData.forEach(session => {
          if (session.dia_semana in activityMap && session.completada) {
            activityMap[session.dia_semana].clientes += 1;
          }
        });
        
        // Llenar con datos de ejercicios
        exercisesData.forEach(exercise => {
          if (exercise.dia_semana in activityMap) {
            activityMap[exercise.dia_semana].ejercicios += exercise.cantidad;
          }
        });
        
        // Convertir a array para el gráfico
        const activityData: WeeklyActivity[] = diasSemana.map(dia => ({
          day: dia,
          clientes: activityMap[dia].clientes,
          ejercicios: activityMap[dia].ejercicios
        }));
        
        return activityData;
      } catch (error) {
        console.error("Error al cargar actividad semanal:", error);
        toast.error("No se pudieron cargar los datos de actividad semanal");
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Efecto para combinar los estados de carga
  useEffect(() => {
    setIsLoading(isLoadingStats || isLoadingAppointments || isLoadingMessages || isLoadingActivity);
  }, [isLoadingStats, isLoadingAppointments, isLoadingMessages, isLoadingActivity]);

  return {
    dashboardStats,
    todayAppointments,
    recentMessages,
    weeklyActivity,
    isLoading
  };
};
