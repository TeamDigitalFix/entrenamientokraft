import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface ClientData {
  id?: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  eliminado: boolean | null;
  username: string;
  password: string;
  role: string;
  entrenador_id: string | null;
  ultimo_ingreso: string | null;
}

export const useClients = (searchTerm: string = "") => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [showEditClientDialog, setShowEditClientDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [clientToReset, setClientToReset] = useState<string | null>(null);
  const [newClientData, setNewClientData] = useState<ClientData>({
    nombre: "",
    email: "",
    telefono: "",
    username: "",
    password: "",
    role: "cliente",
    eliminado: false,
    entrenador_id: user?.id || null,
    ultimo_ingreso: null
  });
  const [editClientData, setEditClientData] = useState<ClientData>({
    id: "",
    nombre: "",
    email: "",
    telefono: "",
    username: "",
    password: "",
    role: "cliente",
    eliminado: false,
    entrenador_id: user?.id || null,
    ultimo_ingreso: null
  });

  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ["clients", searchTerm],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from("usuarios")
        .select("*")
        .eq("role", "cliente")
        .eq("entrenador_id", user.id);

      if (searchTerm) {
        query = query.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        toast.error(`Error al obtener clientes: ${error.message}`);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  const checkUsernameExists = async (username: string, excludeId?: string): Promise<boolean> => {
    let query = supabase
      .from("usuarios")
      .select("id")
      .eq("username", username);
    
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    
    const { data, error } = await query;
    
    return data && data.length > 0;
  };

  const createClient = useMutation({
    mutationFn: async (clientData: ClientData) => {
      const usernameExists = await checkUsernameExists(clientData.username);
      
      if (usernameExists) {
        throw new Error("El nombre de usuario ya está en uso. Por favor, elija otro.");
      }
      
      const { data, error } = await supabase
        .from("usuarios")
        .insert([{
          nombre: clientData.nombre,
          email: clientData.email,
          telefono: clientData.telefono,
          username: clientData.username,
          password: clientData.password,
          role: "cliente",
          entrenador_id: user?.id
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Cliente creado con éxito");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowNewClientDialog(false);
      setNewClientData({
        nombre: "",
        email: "",
        telefono: "",
        username: "",
        password: "",
        role: "cliente",
        eliminado: false,
        entrenador_id: user?.id || null,
        ultimo_ingreso: null
      });
    },
    onError: (error: any) => {
      if (error.message.includes("usuarios_username_key")) {
        toast.error("El nombre de usuario ya está en uso. Por favor, elija otro.");
      } else {
        toast.error(`Error al crear cliente: ${error.message}`);
      }
    }
  });

  const updateClient = useMutation({
    mutationFn: async (clientData: ClientData) => {
      if (clientData.username) {
        const usernameExists = await checkUsernameExists(clientData.username, clientData.id);
        
        if (usernameExists) {
          throw new Error("El nombre de usuario ya está en uso. Por favor, elija otro.");
        }
      }
      
      const updateData: any = {
        nombre: clientData.nombre,
        email: clientData.email,
        telefono: clientData.telefono,
        username: clientData.username
      };
      
      if (clientData.password) {
        updateData.password = clientData.password;
      }
      
      const { data, error } = await supabase
        .from("usuarios")
        .update(updateData)
        .eq("id", clientData.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Cliente actualizado con éxito");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowEditClientDialog(false);
    },
    onError: (error: any) => {
      if (error.message.includes("usuarios_username_key")) {
        toast.error("El nombre de usuario ya está en uso. Por favor, elija otro.");
      } else {
        toast.error(`Error al actualizar cliente: ${error.message}`);
      }
    }
  });

  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      const { data, error } = await supabase
        .from("usuarios")
        .update({ eliminado: true })
        .eq("id", clientId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Cliente eliminado con éxito");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setClientToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar cliente: ${error.message}`);
    }
  });

  const recoverClient = useMutation({
    mutationFn: async (clientId: string) => {
      const { data, error } = await supabase
        .from("usuarios")
        .update({ eliminado: false })
        .eq("id", clientId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Cliente recuperado con éxito");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      toast.error(`Error al recuperar cliente: ${error.message}`);
    }
  });

  const resetClientData = useMutation({
    mutationFn: async (clientId: string) => {
      try {
        const { data: rutinas, error: rutinasQueryError } = await supabase
          .from("rutinas")
          .select("id")
          .eq("cliente_id", clientId);
        
        if (rutinasQueryError) {
          console.error("Error fetching routines:", rutinasQueryError);
          throw rutinasQueryError;
        }
        
        const rutinaIds = rutinas?.map(r => r.id) || [];
        
        const { data: dietas, error: dietasQueryError } = await supabase
          .from("dietas")
          .select("id")
          .eq("cliente_id", clientId);
        
        if (dietasQueryError) {
          console.error("Error fetching diets:", dietasQueryError);
          throw dietasQueryError;
        }
        
        const dietaIds = dietas?.map(d => d.id) || [];
        
        const { error: completedExercisesError } = await supabase
          .from("ejercicios_completados")
          .delete()
          .eq("cliente_id", clientId);
        
        if (completedExercisesError) {
          console.error("Error deleting completed exercises:", completedExercisesError);
        }
        
        if (rutinaIds.length > 0) {
          const { error: rutinasEjerciciosError } = await supabase
            .from("rutina_ejercicios")
            .delete()
            .in("rutina_id", rutinaIds);
          
          if (rutinasEjerciciosError) {
            console.error("Error deleting rutina exercises:", rutinasEjerciciosError);
          }
        }

        const { error: rutinasError } = await supabase
          .from("rutinas")
          .delete()
          .eq("cliente_id", clientId);
        
        if (rutinasError) {
          console.error("Error deleting routines:", rutinasError);
        }

        const { error: completedMealsError } = await supabase
          .from("comidas_completadas")
          .delete()
          .eq("cliente_id", clientId);
        
        if (completedMealsError) {
          console.error("Error deleting completed meals:", completedMealsError);
        }

        if (dietaIds.length > 0) {
          const { error: dietaComidasError } = await supabase
            .from("dieta_comidas")
            .delete()
            .in("dieta_id", dietaIds);
          
          if (dietaComidasError) {
            console.error("Error deleting diet meals:", dietaComidasError);
          }
        }

        const { error: dietasError } = await supabase
          .from("dietas")
          .delete()
          .eq("cliente_id", clientId);
        
        if (dietasError) {
          console.error("Error deleting diets:", dietasError);
        }

        const { error: appointmentsError } = await supabase
          .from("citas")
          .delete()
          .eq("cliente_id", clientId);
        
        if (appointmentsError) {
          console.error("Error deleting appointments:", appointmentsError);
        }

        const { error: progressError } = await supabase
          .from("progreso")
          .delete()
          .eq("cliente_id", clientId);
        
        if (progressError) {
          console.error("Error deleting progress records:", progressError);
        }

        const { error: receivedMessagesError } = await supabase
          .from("mensajes")
          .delete()
          .eq("receptor_id", clientId);
        
        if (receivedMessagesError) {
          console.error("Error deleting received messages:", receivedMessagesError);
        }

        const { error: sentMessagesError } = await supabase
          .from("mensajes")
          .delete()
          .eq("emisor_id", clientId);
        
        if (sentMessagesError) {
          console.error("Error deleting sent messages:", sentMessagesError);
        }

        const { error: dailySessionsError } = await supabase
          .from("sesiones_diarias")
          .delete()
          .eq("cliente_id", clientId);
        
        if (dailySessionsError) {
          console.error("Error deleting daily sessions:", dailySessionsError);
        }

        const { error: dailyExercisesError } = await supabase
          .from("ejercicios_diarios")
          .delete()
          .eq("cliente_id", clientId);
        
        if (dailyExercisesError) {
          console.error("Error deleting daily exercises:", dailyExercisesError);
        }
        
        return { success: true };
      } catch (error) {
        console.error("Error in resetClientData:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Datos del cliente restablecidos con éxito");
      setClientToReset(null);
    },
    onError: (error: any) => {
      toast.error(`Error al restablecer datos del cliente: ${error.message}`);
    }
  });

  return {
    clients,
    isLoading,
    refetch,
    showNewClientDialog,
    setShowNewClientDialog,
    showEditClientDialog,
    setShowEditClientDialog,
    newClientData,
    setNewClientData,
    editClientData,
    setEditClientData,
    clientToDelete,
    setClientToDelete,
    clientToReset,
    setClientToReset,
    createClient: (data: ClientData) => createClient.mutate(data),
    updateClient: (data: ClientData) => updateClient.mutate(data),
    deleteClient: (id: string) => deleteClient.mutate(id),
    recoverClient: (id: string) => recoverClient.mutate(id),
    resetClientData: (id: string) => resetClientData.mutate(id)
  };
};
