
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, parseISO, subDays, startOfWeek, eachDayOfInterval } from "date-fns";
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
        const today = new Date().toISOString().split('T')[0];
        
        const { data: completedExercisesData, error: completedExercisesError } = await supabase
          .from("ejercicios_completados")
          .select("id")
          .eq("fecha_completado::date", today)
          .in("cliente_id", clientsData.map(client => client.id));
          
        if (completedExercisesError) throw completedExercisesError;

        return {
          totalClients: clientsData.length,
          activeClients: activeClients.length,
          upcomingAppointments: appointmentsData.length,
          unreadMessages: messagesData.length,
          completedToday: completedExercisesData.length
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
        const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Lunes como inicio de semana
        
        // Obtener todos los días de la semana actual
        const weekDates = eachDayOfInterval({
          start: startDate,
          end: today
        });
        
        // Formatear fechas para consultas
        const formattedDates = weekDates.map(date => format(date, 'yyyy-MM-dd'));
        
        // Obtener IDs de clientes del entrenador
        const { data: clientsData, error: clientsError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("entrenador_id", user.id)
          .eq("role", "cliente")
          .eq("eliminado", false);
          
        if (clientsError) throw clientsError;
        
        const clientIds = clientsData.map(c => c.id);
        
        // Obtener ejercicios completados por día
        const { data: completedExercises, error: exercisesError } = await supabase
          .from("ejercicios_completados")
          .select("fecha_completado")
          .in("cliente_id", clientIds)
          .gte("fecha_completado", formattedDates[0]);
          
        if (exercisesError) throw exercisesError;
        
        // Obtener sesiones diarias
        const { data: dailySessions, error: sessionsError } = await supabase
          .from("sesiones_diarias")
          .select("fecha, completada")
          .in("cliente_id", clientIds)
          .gte("fecha", formattedDates[0])
          .eq("completada", true);
          
        if (sessionsError) throw sessionsError;
        
        // Crear mapa para contar ejercicios y clientes activos por día
        const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        const activityMap = new Map(diasSemana.map(day => [day, { clientes: 0, ejercicios: 0 }]));
        
        // Contar ejercicios por día
        completedExercises.forEach(exercise => {
          const date = parseISO(exercise.fecha_completado);
          const dayOfWeek = format(date, 'EEE', { locale: es });
          const dayName = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1, 3);
          
          if (activityMap.has(dayName)) {
            const currentStats = activityMap.get(dayName)!;
            activityMap.set(dayName, { 
              ...currentStats, 
              ejercicios: currentStats.ejercicios + 1 
            });
          }
        });
        
        // Contar clientes activos por día
        dailySessions.forEach(session => {
          const date = parseISO(session.fecha);
          const dayOfWeek = format(date, 'EEE', { locale: es });
          const dayName = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1, 3);
          
          if (activityMap.has(dayName) && session.completada) {
            const currentStats = activityMap.get(dayName)!;
            activityMap.set(dayName, { 
              ...currentStats, 
              clientes: currentStats.clientes + 1 
            });
          }
        });
        
        // Convertir mapa a array para el gráfico
        return diasSemana.map(day => ({
          day,
          clientes: activityMap.get(day)?.clientes || 0,
          ejercicios: activityMap.get(day)?.ejercicios || 0
        }));
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
