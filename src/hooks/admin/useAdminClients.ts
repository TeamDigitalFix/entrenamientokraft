
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminClientData {
  id?: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  eliminado: boolean | null;
  username: string;
  password?: string; // Optional for updates
  role: string;
  entrenador_id: string | null;
  entrenador_nombre?: string; // Name of the trainer (joined from query)
  ultimo_ingreso: string | null;
}

export const useAdminClients = (
  page: number = 1,
  searchTerm: string = "",
  showDeleted: boolean = false,
  pageSize: number = 10
) => {
  const queryClient = useQueryClient();
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [showEditClientDialog, setShowEditClientDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [newClientData, setNewClientData] = useState<AdminClientData>({
    nombre: "",
    email: "",
    telefono: "",
    username: "",
    password: "",
    role: "cliente",
    eliminado: false,
    entrenador_id: null,
    ultimo_ingreso: null
  });
  const [editClientData, setEditClientData] = useState<AdminClientData>({
    id: "",
    nombre: "",
    email: "",
    telefono: "",
    username: "",
    password: "",
    role: "cliente",
    eliminado: false,
    entrenador_id: null,
    ultimo_ingreso: null
  });

  // Get trainers for dropdown
  const { data: trainers = [] } = useQuery({
    queryKey: ["admin-trainers-dropdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre")
        .eq("role", "entrenador")
        .eq("eliminado", false);

      if (error) {
        toast.error(`Error al obtener entrenadores: ${error.message}`);
        return [];
      }
      return data || [];
    }
  });

  // Get clients with pagination and filtering
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-clients", page, searchTerm, showDeleted],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Start building the query to include trainer name through a join
      let query = supabase
        .from("usuarios")
        .select(`
          *,
          entrenador:entrenador_id (
            nombre
          )
        `)
        .eq("role", "cliente");

      // Add filter for deleted state
      if (!showDeleted) {
        query = query.eq("eliminado", false);
      }

      // Add search term if provided
      if (searchTerm) {
        query = query.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }

      // Add pagination
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        toast.error(`Error al obtener clientes: ${error.message}`);
        return { clients: [], totalCount: 0 };
      }

      // Transform data to include trainer name
      const clientsWithTrainerName = data.map(client => ({
        ...client,
        entrenador_nombre: client.entrenador?.nombre || 'Sin entrenador'
      }));

      // Get total count for pagination
      let countQuery = supabase
        .from("usuarios")
        .select("id", { count: 'exact', head: true })
        .eq("role", "cliente");

      if (!showDeleted) {
        countQuery = countQuery.eq("eliminado", false);
      }

      if (searchTerm) {
        countQuery = countQuery.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }

      const { count: totalCount, error: countError } = await countQuery;

      if (countError) {
        toast.error(`Error al obtener conteo de clientes: ${countError.message}`);
        return { clients: clientsWithTrainerName, totalCount: 0 };
      }

      return { 
        clients: clientsWithTrainerName, 
        totalCount 
      };
    }
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
    mutationFn: async (clientData: AdminClientData) => {
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
          entrenador_id: clientData.entrenador_id
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Cliente creado con éxito");
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      setShowNewClientDialog(false);
      setNewClientData({
        nombre: "",
        email: "",
        telefono: "",
        username: "",
        password: "",
        role: "cliente",
        eliminado: false,
        entrenador_id: null,
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
    mutationFn: async (clientData: AdminClientData) => {
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
        username: clientData.username,
        entrenador_id: clientData.entrenador_id
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
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      setClientToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar cliente: ${error.message}`);
    }
  });

  const restoreClient = useMutation({
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
      toast.success("Cliente restaurado con éxito");
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
    },
    onError: (error: any) => {
      toast.error(`Error al restaurar cliente: ${error.message}`);
    }
  });

  return {
    clients: data?.clients || [],
    totalItems: data?.totalCount || 0,
    isLoading,
    refetch,
    trainers,
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
    createClient: (data: AdminClientData) => createClient.mutate(data),
    updateClient: (data: AdminClientData) => updateClient.mutate(data),
    deleteClient: (id: string) => deleteClient.mutate(id),
    restoreClient: (id: string) => restoreClient.mutate(id)
  };
};
