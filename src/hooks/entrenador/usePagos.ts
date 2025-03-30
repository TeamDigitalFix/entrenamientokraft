
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Suscripcion } from "./useSuscripciones";
import { addDays, format, isAfter, isBefore, parseISO } from "date-fns";

export type PagoEstado = "pendiente" | "pagado" | "atrasado" | "cancelado";

export type Pago = {
  id: string;
  suscripcion_id: string;
  fecha_programada: string;
  fecha_pago: string | null;
  monto: number;
  estado: PagoEstado;
  metodo_pago: string | null;
  notas: string | null;
  creado_en: string | null;
  // Relación
  suscripcion?: Suscripcion;
};

export type PagoInput = {
  suscripcion_id: string;
  fecha_programada: string;
  fecha_pago: string | null;
  monto: number;
  estado?: PagoEstado;
  metodo_pago?: string | null;
  notas?: string | null;
};

export type DashboardPagoStats = {
  pendientes: number;
  atrasados: number;
  proximosPagos: Pago[];
  pagosAtrasados: Pago[];
};

export const usePagos = (suscripcionId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPago, setCurrentPago] = useState<Pago | null>(null);

  // Fetch payments for a specific subscription or all for the trainer's clients
  const { data: pagos, isLoading } = useQuery({
    queryKey: ["pagos", user?.id, suscripcionId],
    queryFn: async () => {
      try {
        // First we need to get all client IDs for this trainer
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
        
        // Now get all subscriptions for these clients
        let subscriptionQuery = supabase
          .from("suscripciones_cliente")
          .select("id")
          .in("cliente_id", clienteIds);
        
        if (suscripcionId) {
          subscriptionQuery = subscriptionQuery.eq("id", suscripcionId);
        }
        
        const { data: suscripciones, error: subscriptionsError } = await subscriptionQuery;
        
        if (subscriptionsError) throw subscriptionsError;
        
        // If no subscriptions, return empty array
        if (!suscripciones?.length) return [];
        
        const suscripcionIds = suscripciones.map(s => s.id);
        
        // Finally get all payments for these subscriptions
        const { data, error } = await supabase
          .from("pagos")
          .select(`
            *,
            suscripcion:suscripcion_id(
              *,
              cliente:cliente_id(id, nombre, email, telefono),
              plan:plan_id(*)
            )
          `)
          .in("suscripcion_id", suscripcionIds)
          .order("fecha_programada", { ascending: true });

        if (error) throw error;
        
        // Update status for payments that should be marked as "atrasado"
        const today = new Date();
        const updatedPagos = data.map(pago => {
          if (pago.estado === "pendiente" && 
              isBefore(parseISO(pago.fecha_programada), today) && 
              !pago.fecha_pago) {
            return { ...pago, estado: "atrasado" };
          }
          return pago;
        });
        
        // Update any payments in DB that should be "atrasado"
        const atrasados = updatedPagos.filter(p => 
          p.estado === "atrasado" && data.find(d => d.id === p.id)?.estado === "pendiente"
        );
        
        if (atrasados.length > 0) {
          // Update all overdue payments
          const promises = atrasados.map(pago => 
            supabase
              .from("pagos")
              .update({ estado: "atrasado" })
              .eq("id", pago.id)
          );
          
          await Promise.all(promises);
        }
        
        return updatedPagos as Pago[];
      } catch (error) {
        console.error("Error loading payments:", error);
        toast.error("Error al cargar los pagos");
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Create a new payment
  const { mutate: crearPago, isPending: isCreating } = useMutation({
    mutationFn: async (nuevoPago: PagoInput) => {
      const { data, error } = await supabase
        .from("pagos")
        .insert({
          ...nuevoPago,
          estado: nuevoPago.fecha_pago ? "pagado" : "pendiente"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos", user?.id, suscripcionId] });
      queryClient.invalidateQueries({ queryKey: ["pagos-dashboard", user?.id] });
      toast.success("Pago creado con éxito");
      setIsEditing(false);
      setCurrentPago(null);
    },
    onError: (error) => {
      console.error("Error creating payment:", error);
      toast.error("Error al crear el pago");
    }
  });

  // Update an existing payment
  const { mutate: actualizarPago, isPending: isUpdating } = useMutation({
    mutationFn: async (pago: PagoInput & { id: string, estado?: string }) => {
      const { id, ...updateData } = pago;

      // If payment date is set, automatically set estado to "pagado"
      if (updateData.fecha_pago && (!pago.estado || pago.estado === "pendiente" || pago.estado === "atrasado")) {
        updateData.estado = "pagado";
      }

      const { data, error } = await supabase
        .from("pagos")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos", user?.id, suscripcionId] });
      queryClient.invalidateQueries({ queryKey: ["pagos-dashboard", user?.id] });
      toast.success("Pago actualizado con éxito");
      setIsEditing(false);
      setCurrentPago(null);
    },
    onError: (error) => {
      console.error("Error updating payment:", error);
      toast.error("Error al actualizar el pago");
    }
  });

  // Generate future payments for a subscription
  const { mutate: generarPagosFuturos } = useMutation({
    mutationFn: async ({ 
      suscripcion, 
      cantidadPagos 
    }: { 
      suscripcion: Suscripcion, 
      cantidadPagos: number 
    }) => {
      // Get the last payment date or use the subscription start date
      const { data: ultimoPago, error: ultimoPagoError } = await supabase
        .from("pagos")
        .select("fecha_programada")
        .eq("suscripcion_id", suscripcion.id)
        .order("fecha_programada", { ascending: false })
        .limit(1);

      if (ultimoPagoError) throw ultimoPagoError;

      let fechaInicio = parseISO(suscripcion.fecha_inicio);
      if (ultimoPago && ultimoPago.length > 0) {
        fechaInicio = addDays(parseISO(ultimoPago[0].fecha_programada), suscripcion.plan.intervalo_dias);
      }

      // Create array of future payments
      const nuevosPagos = [];
      for (let i = 0; i < cantidadPagos; i++) {
        const fechaPago = addDays(fechaInicio, i * suscripcion.plan.intervalo_dias);
        
        nuevosPagos.push({
          suscripcion_id: suscripcion.id,
          fecha_programada: format(fechaPago, 'yyyy-MM-dd'),
          monto: suscripcion.plan.precio,
          estado: "pendiente"
        });
      }

      // Insert all new payments
      const { data, error } = await supabase
        .from("pagos")
        .insert(nuevosPagos)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos", user?.id, suscripcionId] });
      queryClient.invalidateQueries({ queryKey: ["pagos-dashboard", user?.id] });
      toast.success("Pagos futuros generados con éxito");
    },
    onError: (error) => {
      console.error("Error generating future payments:", error);
      toast.error("Error al generar los pagos futuros");
    }
  });

  // Mark a payment as paid
  const { mutate: marcarComoPagado } = useMutation({
    mutationFn: async (pago: Pago) => {
      const { data, error } = await supabase
        .from("pagos")
        .update({ 
          estado: "pagado", 
          fecha_pago: format(new Date(), 'yyyy-MM-dd')
        })
        .eq("id", pago.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos", user?.id, suscripcionId] });
      queryClient.invalidateQueries({ queryKey: ["pagos-dashboard", user?.id] });
      toast.success("Pago marcado como pagado");
    },
    onError: (error) => {
      console.error("Error marking payment as paid:", error);
      toast.error("Error al marcar el pago como pagado");
    }
  });

  // Get dashboard payment stats (for alerts)
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["pagos-dashboard", user?.id],
    queryFn: async () => {
      try {
        // If we have pagos from above, use that data instead of making another request
        if (pagos && !suscripcionId) {
          const today = new Date();
          const in7Days = addDays(today, 7);
          
          const pendientes = pagos.filter(p => p.estado === "pendiente").length;
          const atrasados = pagos.filter(p => p.estado === "atrasado").length;
          
          // Get payments due in the next 7 days
          const proximosPagos = pagos.filter(p => 
            p.estado === "pendiente" &&
            isAfter(parseISO(p.fecha_programada), today) &&
            isBefore(parseISO(p.fecha_programada), in7Days)
          ).slice(0, 5); // Show only top 5
          
          // Get overdue payments
          const pagosAtrasados = pagos.filter(p => 
            p.estado === "atrasado"
          ).slice(0, 5); // Show only top 5
          
          return {
            pendientes,
            atrasados,
            proximosPagos,
            pagosAtrasados
          };
        }
        
        // Otherwise make a new query
        // This is basically a duplicate of the logic above for pagos query
        // First we need to get all client IDs for this trainer
        const { data: clientes, error: clientesError } = await supabase
          .from("usuarios")
          .select("id")
          .eq("entrenador_id", user?.id)
          .eq("role", "cliente")
          .eq("eliminado", false);

        if (clientesError) throw clientesError;
        if (!clientes?.length) return { pendientes: 0, atrasados: 0, proximosPagos: [], pagosAtrasados: [] };
        
        const clienteIds = clientes.map(cliente => cliente.id);
        
        // Now get all subscriptions for these clients
        const { data: suscripciones, error: subscriptionsError } = await supabase
          .from("suscripciones_cliente")
          .select("id")
          .in("cliente_id", clienteIds);
        
        if (subscriptionsError) throw subscriptionsError;
        if (!suscripciones?.length) return { pendientes: 0, atrasados: 0, proximosPagos: [], pagosAtrasados: [] };
        
        const suscripcionIds = suscripciones.map(s => s.id);
        
        // Get payment stats
        const { data, error } = await supabase
          .from("pagos")
          .select(`
            *,
            suscripcion:suscripcion_id(
              *,
              cliente:cliente_id(id, nombre, email, telefono),
              plan:plan_id(*)
            )
          `)
          .in("suscripcion_id", suscripcionIds)
          .order("fecha_programada", { ascending: true });

        if (error) throw error;
        
        const today = new Date();
        const in7Days = addDays(today, 7);
        
        // Update status for payments that should be marked as "atrasado"
        const updatedPagos = data.map(pago => {
          if (pago.estado === "pendiente" && 
              isBefore(parseISO(pago.fecha_programada), today) && 
              !pago.fecha_pago) {
            return { ...pago, estado: "atrasado" };
          }
          return pago;
        });
        
        // Count stats
        const pendientes = updatedPagos.filter(p => p.estado === "pendiente").length;
        const atrasados = updatedPagos.filter(p => p.estado === "atrasado").length;
        
        // Get payments due in the next 7 days
        const proximosPagos = updatedPagos
          .filter(p => 
            p.estado === "pendiente" &&
            isAfter(parseISO(p.fecha_programada), today) &&
            isBefore(parseISO(p.fecha_programada), in7Days)
          )
          .slice(0, 5); // Show only top 5
        
        // Get overdue payments
        const pagosAtrasados = updatedPagos
          .filter(p => p.estado === "atrasado")
          .slice(0, 5); // Show only top 5
        
        return {
          pendientes,
          atrasados,
          proximosPagos,
          pagosAtrasados
        };
      } catch (error) {
        console.error("Error loading dashboard payment stats:", error);
        return {
          pendientes: 0,
          atrasados: 0,
          proximosPagos: [],
          pagosAtrasados: []
        };
      }
    },
    enabled: !!user?.id
  });

  return {
    pagos,
    isLoading,
    isCreating,
    isUpdating,
    crearPago,
    actualizarPago,
    marcarComoPagado,
    generarPagosFuturos,
    isEditing,
    setIsEditing,
    currentPago,
    setCurrentPago,
    dashboardStats,
    isLoadingStats
  };
};
