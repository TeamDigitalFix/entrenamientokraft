
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, parseISO, startOfDay, endOfDay, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  // Validar el estado de la cita para que cumpla con el tipo "programada" | "completada" | "cancelada"
  const validateCitaStatus = (estado: string): "programada" | "completada" | "cancelada" => {
    if (estado === "programada" || estado === "completada" || estado === "cancelada") {
      return estado as "programada" | "completada" | "cancelada";
    }
    // Si el estado no es válido, devolver "programada" por defecto
    return "programada";
  };

  // Validar el cliente para asegurar que tiene la propiedad nombre
  const validateCliente = (cliente: any): { nombre: string } | undefined => {
    if (cliente && typeof cliente === 'object' && 'nombre' in cliente) {
      return { nombre: cliente.nombre };
    }
    return undefined;
  };

  // Cargar citas desde Supabase
  const fetchCitas = async () => {
    setIsLoading(true);
    try {
      console.log("Buscando citas para entrenador:", entrenadorId);
      
      // Obtener primero las citas sin el join
      const { data: citasData, error: citasError } = await supabase
        .from("citas")
        .select("*")
        .eq("entrenador_id", entrenadorId)
        .order("fecha", { ascending: true });

      if (citasError) {
        console.error("Error obteniendo citas:", citasError);
        throw citasError;
      }

      console.log("Citas obtenidas:", citasData);

      // Para cada cita, obtener el nombre del cliente
      const citasConCliente = await Promise.all((citasData || []).map(async (cita) => {
        try {
          const { data: clienteData, error: clienteError } = await supabase
            .from("usuarios")
            .select("nombre")
            .eq("id", cita.cliente_id)
            .single();

          if (clienteError) {
            console.warn(`No se pudo obtener el cliente para la cita ${cita.id}:`, clienteError);
            return {
              ...cita,
              estado: validateCitaStatus(cita.estado),
              cliente: undefined
            };
          }

          return {
            ...cita,
            estado: validateCitaStatus(cita.estado),
            cliente: clienteData ? { nombre: clienteData.nombre } : undefined
          };
        } catch (error) {
          console.error(`Error procesando cita ${cita.id}:`, error);
          return {
            ...cita,
            estado: validateCitaStatus(cita.estado),
            cliente: undefined
          };
        }
      }));

      setCitas(citasConCliente as Cita[]);
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

  // Crear una nueva cita
  const crearCita = async (nuevaCita: NuevaCita) => {
    try {
      console.log("Creando cita con datos:", nuevaCita);
      
      // Asegurarse de que el estado sea válido
      const validatedCita = {
        ...nuevaCita,
        estado: validateCitaStatus(nuevaCita.estado)
      };
      
      console.log("Cita validada para inserción:", validatedCita);
      
      // Inserción de la cita
      const { data, error } = await supabase
        .from("citas")
        .insert(validatedCita)
        .select()
        .single();

      if (error) {
        console.error("Error al crear cita:", error);
        throw error;
      }

      console.log("Cita creada exitosamente:", data);

      // Obtener el nombre del cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from("usuarios")
        .select("nombre")
        .eq("id", nuevaCita.cliente_id)
        .single();

      if (clienteError) {
        console.warn("No se pudo obtener el nombre del cliente:", clienteError);
      }

      // Crear objeto completo con cliente si está disponible
      const citaWithValidTypes = {
        ...data,
        estado: validateCitaStatus(data.estado),
        cliente: clienteData ? { nombre: clienteData.nombre } : undefined
      } as Cita;

      setCitas((prevCitas) => [...prevCitas, citaWithValidTypes]);
      toast({
        title: "Éxito",
        description: "Cita creada correctamente",
      });
      
      return citaWithValidTypes;
    } catch (error: any) {
      console.error("Error al crear cita:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la cita: " + (error.message || "Error desconocido"),
        variant: "destructive",
      });
      return null;
    }
  };

  // Actualizar una cita existente
  const actualizarCita = async (id: string, updates: Partial<Cita>) => {
    try {
      // Asegurarse de que el estado sea válido si se está actualizando
      const validatedUpdates = {
        ...updates,
        estado: updates.estado ? validateCitaStatus(updates.estado) : undefined
      };
      
      // Realizar la actualización
      const { data, error } = await supabase
        .from("citas")
        .update(validatedUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Obtener información del cliente (si es necesario)
      let clienteData;
      // Solo consultamos el cliente si no cambiamos el cliente_id o si no hay cliente en la actualización
      if (!updates.cliente) {
        const { data: cliente, error: clienteError } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", data.cliente_id)
          .single();
        
        if (!clienteError) {
          clienteData = cliente;
        }
      }

      // Objeto completo con validación
      const citaWithValidTypes = {
        ...data,
        estado: validateCitaStatus(data.estado),
        cliente: clienteData ? { nombre: clienteData.nombre } : updates.cliente
      } as Cita;

      setCitas((prevCitas) =>
        prevCitas.map((cita) => (cita.id === id ? citaWithValidTypes : cita))
      );
      
      toast({
        title: "Éxito",
        description: "Cita actualizada correctamente",
      });
      
      return citaWithValidTypes;
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
          cita.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Refrescar las citas cuando cambie la fecha seleccionada o el entrenador
  useEffect(() => {
    if (entrenadorId) {
      fetchCitas();
    }
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
