
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, parseISO, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";

export type Cita = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  duracion: number;
  entrenador_id: string;
  cliente_id: string;
  estado: "programada" | "completada" | "cancelada";
  tipo?: string | null;
  creado_en?: string | null;
  actualizado_en?: string | null;
  cliente?: {
    nombre: string;
  };
};

export type NuevaCita = Omit<Cita, "id" | "creado_en" | "actualizado_en">;

export const useCitas = (entrenadorId: string) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredCitas, setFilteredCitas] = useState<Cita[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const { toast } = useToast();

  // Cargar citas desde Supabase
  const fetchCitas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("citas")
        .select(`
          *,
          cliente:cliente_id(nombre)
        `)
        .eq("entrenador_id", entrenadorId)
        .order("fecha", { ascending: true });

      if (error) throw error;

      // Asegurar que los estados de las citas cumplan con el tipo esperado
      const citasWithValidStatus = (data || []).map(cita => ({
        ...cita,
        estado: validateCitaStatus(cita.estado)
      }));

      setCitas(citasWithValidStatus);
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

  // Validar el estado de la cita para que cumpla con el tipo "programada" | "completada" | "cancelada"
  const validateCitaStatus = (estado: string): "programada" | "completada" | "cancelada" => {
    if (estado === "programada" || estado === "completada" || estado === "cancelada") {
      return estado as "programada" | "completada" | "cancelada";
    }
    // Si el estado no es válido, devolver "programada" por defecto
    return "programada";
  };

  // Crear una nueva cita
  const crearCita = async (nuevaCita: NuevaCita) => {
    try {
      const { data, error } = await supabase
        .from("citas")
        .insert(nuevaCita)
        .select()
        .single();

      if (error) throw error;

      const citaWithValidStatus = {
        ...data,
        estado: validateCitaStatus(data.estado)
      };

      setCitas((prevCitas) => [...prevCitas, citaWithValidStatus]);
      toast({
        title: "Éxito",
        description: "Cita creada correctamente",
      });
      
      return citaWithValidStatus;
    } catch (error: any) {
      console.error("Error al crear cita:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la cita",
        variant: "destructive",
      });
      return null;
    }
  };

  // Actualizar una cita existente
  const actualizarCita = async (id: string, updates: Partial<Cita>) => {
    try {
      const { data, error } = await supabase
        .from("citas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const citaWithValidStatus = {
        ...data,
        estado: validateCitaStatus(data.estado)
      };

      setCitas((prevCitas) =>
        prevCitas.map((cita) => (cita.id === id ? citaWithValidStatus : cita))
      );
      
      toast({
        title: "Éxito",
        description: "Cita actualizada correctamente",
      });
      
      return citaWithValidStatus;
    } catch (error: any) {
      console.error("Error al actualizar cita:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cita",
        variant: "destructive",
      });
      return null;
    }
  };

  // Marcar una cita como completada
  const completarCita = async (id: string) => {
    return actualizarCita(id, { estado: "completada" });
  };

  // Cancelar una cita
  const cancelarCita = async (id: string) => {
    return actualizarCita(id, { estado: "cancelada" });
  };

  // Obtener citas para una fecha específica
  const getCitasPorFecha = (fecha?: Date) => {
    if (!fecha) return [];
    
    const startDay = startOfDay(fecha);
    const endDay = endOfDay(fecha);
    
    return citas.filter((cita) => {
      const citaFecha = parseISO(cita.fecha);
      return isAfter(citaFecha, startDay) && isBefore(citaFecha, endDay);
    });
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fechaISO: string) => {
    try {
      return format(parseISO(fechaISO), "dd/MM/yyyy", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Formatear hora para mostrar
  const formatearHora = (fechaISO: string) => {
    try {
      return format(parseISO(fechaISO), "HH:mm", { locale: es });
    } catch (error) {
      return "Hora inválida";
    }
  };

  // Filtrar citas según el término de búsqueda y la pestaña seleccionada
  useEffect(() => {
    let filtered = citas;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (cita) =>
          cita.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cita.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cita.tipo && cita.tipo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por pestaña
    switch (selectedTab) {
      case "today":
        filtered = filtered.filter(
          (cita) => isToday(parseISO(cita.fecha)) && cita.estado === "programada"
        );
        break;
      case "upcoming":
        filtered = filtered.filter(
          (cita) =>
            isAfter(parseISO(cita.fecha), new Date()) &&
            cita.estado === "programada"
        );
        break;
      case "past":
        filtered = filtered.filter(
          (cita) =>
            isBefore(parseISO(cita.fecha), startOfDay(new Date())) ||
            cita.estado === "completada" ||
            cita.estado === "cancelada"
        );
        break;
      default:
        // "all" - no additional filtering
        break;
    }

    setFilteredCitas(filtered);
  }, [citas, searchTerm, selectedTab]);

  // Refrescar las citas cuando cambie la fecha seleccionada
  useEffect(() => {
    fetchCitas();
  }, [entrenadorId]);

  return {
    citas,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedDate,
    setSelectedDate,
    filteredCitas,
    selectedTab,
    setSelectedTab,
    crearCita,
    actualizarCita,
    completarCita,
    cancelarCita,
    getCitasPorFecha,
    formatearFecha,
    formatearHora,
    fetchCitas,
  };
};
