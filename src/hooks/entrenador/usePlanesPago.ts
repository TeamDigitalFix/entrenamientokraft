import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type PlanPago = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  intervalo_dias: number;
  activo: boolean;
  creado_por: string;
  creado_en: string | null;
};

export type PlanPagoInput = {
  nombre: string;
  descripcion: string | null;
  precio: number;
  intervalo_dias: number;
  activo: boolean;
};

export const usePlanesPago = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<PlanPago | null>(null);

  const { data: planes, isLoading } = useQuery({
    queryKey: ["planes-pago", user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("planes_pago")
          .select("*")
          .eq("creado_por", user?.id)
          .order("nombre", { ascending: true });

        if (error) throw error;
        return data as PlanPago[];
      } catch (error) {
        console.error("Error loading payment plans:", error);
        toast.error("Error al cargar los planes de pago");
        return [];
      }
    },
    enabled: !!user?.id
  });

  const { mutate: crearPlan, isPending: isCreating } = useMutation({
    mutationFn: async (nuevoPlan: PlanPagoInput) => {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("planes_pago")
        .insert({
          ...nuevoPlan,
          creado_por: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planes-pago", user?.id] });
      toast.success("Plan de pago creado con éxito");
      setIsEditing(false);
      setCurrentPlan(null);
    },
    onError: (error) => {
      console.error("Error creating payment plan:", error);
      toast.error("Error al crear el plan de pago");
    }
  });

  const { mutate: actualizarPlan, isPending: isUpdating } = useMutation({
    mutationFn: async (plan: PlanPago) => {
      const { id, creado_en, creado_por, ...updateData } = plan;

      const { data, error } = await supabase
        .from("planes_pago")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planes-pago", user?.id] });
      toast.success("Plan de pago actualizado con éxito");
      setIsEditing(false);
      setCurrentPlan(null);
    },
    onError: (error) => {
      console.error("Error updating payment plan:", error);
      toast.error("Error al actualizar el plan de pago");
    }
  });

  const { mutate: toggleActivoPlan } = useMutation({
    mutationFn: async (plan: PlanPago) => {
      const { data, error } = await supabase
        .from("planes_pago")
        .update({ activo: !plan.activo })
        .eq("id", plan.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planes-pago", user?.id] });
      toast.success("Estado del plan actualizado");
    },
    onError: (error) => {
      console.error("Error toggling plan status:", error);
      toast.error("Error al cambiar el estado del plan");
    }
  });

  const { mutate: eliminarPlan } = useMutation({
    mutationFn: async (plan: PlanPago) => {
      const { data: subscriptions, error: checkError } = await supabase
        .from("suscripciones_cliente")
        .select("id")
        .eq("plan_id", plan.id)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (subscriptions && subscriptions.length > 0) {
        throw new Error("No se puede eliminar un plan que está siendo utilizado en suscripciones activas");
      }
      
      const { error } = await supabase
        .from("planes_pago")
        .delete()
        .eq("id", plan.id);

      if (error) throw error;
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planes-pago", user?.id] });
      toast.success("Plan de pago eliminado con éxito");
    },
    onError: (error) => {
      console.error("Error deleting payment plan:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al eliminar el plan de pago");
      }
    }
  });

  return {
    planes,
    isLoading,
    isCreating,
    isUpdating,
    crearPlan,
    actualizarPlan,
    toggleActivoPlan,
    eliminarPlan,
    isEditing,
    setIsEditing,
    currentPlan,
    setCurrentPlan
  };
};
