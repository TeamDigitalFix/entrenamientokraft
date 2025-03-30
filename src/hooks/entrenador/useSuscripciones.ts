
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PlanPago } from "./usePlanesPago";

export type Cliente = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
};

export type Suscripcion = {
  id: string;
  cliente_id: string;
  plan_id: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  notas: string | null;
  activo: boolean;
  creado_en: string | null;
  // Estos campos son de la relación
  cliente: Cliente;
  plan: PlanPago;
};

export type SuscripcionInput = Omit<Suscripcion, "id" | "creado_en" | "cliente" | "plan">;

export const useSuscripciones = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentSuscripcion, setCurrentSuscripcion] = useState<Suscripcion | null>(null);

  // Fetch all subscriptions for the trainer's clients
  const { data: suscripciones, isLoading } = useQuery({
    queryKey: ["suscripciones", user?.id],
    queryFn: async () => {
      try {
        // First get all clients for this trainer
        const { data: clientes, error: clientesError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("entrenador_id", user?.id)
          .eq("role", "cliente")
          .eq("eliminado", false);

        if (clientesError) throw clientesError;
        
        // If no clients, return empty array
        if (!clientes?.length) return [];
        
        const clienteIds = clientes.map(cliente => cliente.id);
        
        const { data, error } = await supabase
          .from("suscripciones_cliente")
          .select(`
            *,
            cliente:cliente_id(id, nombre, email, telefono),
            plan:plan_id(*)
          `)
          .in("cliente_id", clienteIds)
          .order("fecha_inicio", { ascending: false });

        if (error) throw error;
        return data as Suscripcion[];
      } catch (error) {
        console.error("Error loading subscriptions:", error);
        toast.error("Error al cargar las suscripciones");
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Create a new subscription
  const { mutate: crearSuscripcion, isPending: isCreating } = useMutation({
    mutationFn: async (nuevaSuscripcion: SuscripcionInput) => {
      const { data, error } = await supabase
        .from("suscripciones_cliente")
        .insert(nuevaSuscripcion)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suscripciones", user?.id] });
      toast.success("Suscripción creada con éxito");
      setIsEditing(false);
      setCurrentSuscripcion(null);
    },
    onError: (error) => {
      console.error("Error creating subscription:", error);
      toast.error("Error al crear la suscripción");
    }
  });

  // Update an existing subscription
  const { mutate: actualizarSuscripcion, isPending: isUpdating } = useMutation({
    mutationFn: async (suscripcion: SuscripcionInput & { id: string }) => {
      const { id, ...updateData } = suscripcion;

      const { data, error } = await supabase
        .from("suscripciones_cliente")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suscripciones", user?.id] });
      toast.success("Suscripción actualizada con éxito");
      setIsEditing(false);
      setCurrentSuscripcion(null);
    },
    onError: (error) => {
      console.error("Error updating subscription:", error);
      toast.error("Error al actualizar la suscripción");
    }
  });

  // Toggle subscription active status
  const { mutate: toggleActivoSuscripcion } = useMutation({
    mutationFn: async (suscripcion: Suscripcion) => {
      const { data, error } = await supabase
        .from("suscripciones_cliente")
        .update({ activo: !suscripcion.activo })
        .eq("id", suscripcion.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suscripciones", user?.id] });
      toast.success("Estado de la suscripción actualizado");
    },
    onError: (error) => {
      console.error("Error toggling subscription status:", error);
      toast.error("Error al cambiar el estado de la suscripción");
    }
  });

  return {
    suscripciones,
    isLoading,
    isCreating,
    isUpdating,
    crearSuscripcion,
    actualizarSuscripcion,
    toggleActivoSuscripcion,
    isEditing,
    setIsEditing,
    currentSuscripcion,
    setCurrentSuscripcion
  };
};
