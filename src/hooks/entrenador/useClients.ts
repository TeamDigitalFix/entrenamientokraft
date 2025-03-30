
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
  ultimo_ingreso?: string | null;
}

export const useClients = (searchTerm: string = "") => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [showEditClientDialog, setShowEditClientDialog] = useState(false);
  const [clientToDeactivate, setClientToDeactivate] = useState<string | null>(null);
  const [newClientData, setNewClientData] = useState<ClientData>({
    nombre: "",
    email: "",
    telefono: "",
    username: "",
    password: "",
    role: "cliente",
    eliminado: false,
    entrenador_id: user?.id || null
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
    entrenador_id: user?.id || null
  });

  // Fetching clients for the current trainer
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

  // Check if username already exists
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", username)
      .single();
    
    return !!data;
  };

  // Create new client
  const createClient = useMutation({
    mutationFn: async (clientData: ClientData) => {
      // Check if username exists first
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
          password: clientData.password, // En producción debe cifrarse
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
        entrenador_id: user?.id || null
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

  // Update client
  const updateClient = useMutation({
    mutationFn: async (clientData: ClientData) => {
      const { data, error } = await supabase
        .from("usuarios")
        .update({
          nombre: clientData.nombre,
          email: clientData.email,
          telefono: clientData.telefono,
          // No actualizamos password a menos que sea necesario
        })
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
      toast.error(`Error al actualizar cliente: ${error.message}`);
    }
  });

  // Deactivate client
  const deactivateClient = useMutation({
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
      toast.success("Cliente desactivado con éxito");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setClientToDeactivate(null);
    },
    onError: (error: any) => {
      toast.error(`Error al desactivar cliente: ${error.message}`);
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
    clientToDeactivate,
    setClientToDeactivate,
    createClient: (data: ClientData) => createClient.mutate(data),
    updateClient: (data: ClientData) => updateClient.mutate(data),
    deactivateClient: (id: string) => deactivateClient.mutate(id)
  };
};
