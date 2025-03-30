
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, parseISO, startOfDay, endOfDay, isAfter, isBefore, addDays, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

export type ClientAppointment = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  duracion: number;
  entrenador_id: string;
  estado: "programada" | "completada" | "cancelada";
  entrenador_nombre?: string;
  formattedDate?: string;
};

export type AppointmentRequest = {
  titulo: string;
  descripcion: string;
  fecha: string;
  duracion: number;
};

export const useClientAppointments = () => {
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<ClientAppointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<ClientAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar las citas del cliente
  const fetchAppointments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log("Buscando citas para cliente:", user.id);
      
      // Primero, obtener las citas
      const { data: appointmentsData, error } = await supabase
        .from("citas")
        .select("*")
        .eq("cliente_id", user.id)
        .order("fecha", { ascending: true });

      if (error) {
        console.error("Error obteniendo citas:", error);
        throw error;
      }

      console.log("Citas obtenidas:", appointmentsData);

      // Para cada cita, obtener el nombre del entrenador
      const processedAppointments = await Promise.all(
        appointmentsData.map(async (appointment) => {
          let entrenador_nombre = "Desconocido";
          
          // Obtener nombre del entrenador desde la tabla usuarios
          if (appointment.entrenador_id) {
            const { data: entrenadorData, error: entrenadorError } = await supabase
              .from("usuarios")
              .select("nombre")
              .eq("id", appointment.entrenador_id)
              .single();
            
            if (!entrenadorError && entrenadorData) {
              entrenador_nombre = entrenadorData.nombre;
            }
          }
          
          return {
            ...appointment,
            entrenador_nombre,
            formattedDate: formatAppointmentDate(parseISO(appointment.fecha))
          } as ClientAppointment;
        })
      );

      // Separamos en citas próximas y pasadas
      const now = new Date();
      const upcoming = processedAppointments.filter(
        app => isAfter(parseISO(app.fecha), now) && app.estado === "programada"
      );
      
      const past = processedAppointments.filter(
        app => isBefore(parseISO(app.fecha), now) || app.estado !== "programada"
      );

      setAppointments(processedAppointments);
      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    } catch (error: any) {
      console.error("Error al cargar citas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitar una nueva cita
  const requestAppointment = async (appointmentData: AppointmentRequest) => {
    if (!user) return null;
    
    setIsRequesting(true);
    try {
      // Primero obtenemos el ID del entrenador asignado al cliente
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("entrenador_id")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error obteniendo entrenador del cliente:", userError);
        throw userError;
      }

      if (!userData.entrenador_id) {
        throw new Error("No tienes un entrenador asignado");
      }

      const newAppointment = {
        cliente_id: user.id,
        entrenador_id: userData.entrenador_id,
        titulo: appointmentData.titulo,
        descripcion: appointmentData.descripcion,
        fecha: appointmentData.fecha,
        duracion: appointmentData.duracion,
        estado: "pendiente" as const
      };

      console.log("Solicitando cita:", newAppointment);

      const { data, error } = await supabase
        .from("citas")
        .insert(newAppointment)
        .select()
        .single();

      if (error) {
        console.error("Error al solicitar cita:", error);
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Cita solicitada correctamente",
      });

      // Actualizar la lista de citas
      await fetchAppointments();
      return data;
    } catch (error: any) {
      console.error("Error al solicitar cita:", error);
      toast({
        title: "Error",
        description: "No se pudo solicitar la cita: " + (error.message || "Error desconocido"),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRequesting(false);
    }
  };

  // Cancelar una cita
  const cancelAppointment = async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("citas")
        .update({ estado: "cancelada" })
        .eq("id", id)
        .eq("cliente_id", user.id);

      if (error) {
        console.error("Error al cancelar cita:", error);
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Cita cancelada correctamente",
      });

      // Actualizar la lista de citas
      await fetchAppointments();
      return true;
    } catch (error: any) {
      console.error("Error al cancelar cita:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita",
        variant: "destructive",
      });
      return false;
    }
  };

  // Helper function to format appointment date
  const formatAppointmentDate = (date: Date) => {
    const today = new Date();
    const tomorrow = addDays(today, 1);

    if (isToday(date)) {
      return `Hoy - ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Ayer - ${format(date, 'HH:mm')}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Mañana - ${format(date, 'HH:mm')}`;
    } else {
      return `${format(date, "dd/MM/yyyy - HH:mm", { locale: es })}`;
    }
  };

  // Cargar citas cuando se monta el componente
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    isLoading,
    isRequesting,
    requestAppointment,
    cancelAppointment,
    fetchAppointments,
  };
};
