
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trainer } from "@/types/admin";

export const useTrainers = (page: number, searchTerm: string, pageSize: number = 10) => {
  const [showNewTrainerDialog, setShowNewTrainerDialog] = useState(false);
  const [showEditTrainerDialog, setShowEditTrainerDialog] = useState(false);
  const [newTrainerData, setNewTrainerData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: ""
  });
  const [editTrainerData, setEditTrainerData] = useState<Trainer | null>(null);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);

  // Consulta de entrenadores
  const { data: trainers, isLoading, refetch } = useQuery({
    queryKey: ['admin-trainers', page, searchTerm],
    queryFn: async () => {
      try {
        // Consulta básica de entrenadores
        let query = supabase
          .from('usuarios')
          .select('id, username, nombre, email, telefono, creado_en')
          .eq('role', 'entrenador')
          .eq('eliminado', false);
        
        // Aplicar búsqueda si hay término
        if (searchTerm) {
          query = query.or(`nombre.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        
        // Aplicar paginación
        const from = (page - 1) * pageSize;
        query = query.range(from, from + pageSize - 1);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Para cada entrenador, contar sus clientes
        const trainersWithClientCount = await Promise.all(
          (data || []).map(async (trainer) => {
            const { data: clients, error: clientsError } = await supabase
              .from('usuarios')
              .select('id')
              .eq('role', 'cliente')
              .eq('entrenador_id', trainer.id)
              .eq('eliminado', false);
            
            if (clientsError) {
              console.error("Error al contar clientes:", clientsError);
              return {
                id: trainer.id,
                username: trainer.username,
                name: trainer.nombre,
                email: trainer.email,
                phone: trainer.telefono,
                clientCount: 0,
                createdAt: new Date(trainer.creado_en)
              };
            }
            
            return {
              id: trainer.id,
              username: trainer.username,
              name: trainer.nombre,
              email: trainer.email,
              phone: trainer.telefono,
              clientCount: clients?.length || 0,
              createdAt: new Date(trainer.creado_en)
            };
          })
        );
        
        return trainersWithClientCount;
      } catch (error) {
        console.error("Error al obtener entrenadores:", error);
        toast.error("Error al cargar entrenadores");
        return [];
      }
    }
  });

  // Función para crear un nuevo entrenador
  const createTrainer = async () => {
    try {
      // Validar datos
      if (!newTrainerData.username || !newTrainerData.password || !newTrainerData.name) {
        toast.error("Por favor completa los campos obligatorios");
        return;
      }
      
      // Verificar si el username ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('username', newTrainerData.username)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingUser) {
        toast.error("El nombre de usuario ya está en uso");
        return;
      }
      
      // Insertar nuevo entrenador
      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            username: newTrainerData.username,
            password: newTrainerData.password,
            role: 'entrenador',
            nombre: newTrainerData.name,
            email: newTrainerData.email || null,
            telefono: newTrainerData.phone || null
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Entrenador creado exitosamente");
      setShowNewTrainerDialog(false);
      
      // Limpiar formulario
      setNewTrainerData({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: ""
      });
      
      // Refrescar datos
      refetch();
    } catch (error) {
      console.error("Error al crear entrenador:", error);
      toast.error("Error al crear el entrenador");
    }
  };

  // Función para actualizar un entrenador
  const updateTrainer = async () => {
    if (!editTrainerData) return;
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nombre: editTrainerData.name,
          email: editTrainerData.email,
          telefono: editTrainerData.phone
        })
        .eq('id', editTrainerData.id)
        .select();
      
      if (error) throw error;
      
      toast.success("Entrenador actualizado exitosamente");
      setShowEditTrainerDialog(false);
      refetch();
    } catch (error) {
      console.error("Error al actualizar entrenador:", error);
      toast.error("Error al actualizar el entrenador");
    }
  };

  // Función para eliminar un entrenador (soft delete)
  const deleteTrainer = async () => {
    if (!trainerToDelete) return;
    
    try {
      // Primero, reasignar los clientes de este entrenador (ponerlos sin entrenador asignado)
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ entrenador_id: null })
        .eq('entrenador_id', trainerToDelete.id);
      
      if (updateError) throw updateError;
      
      // Luego, marcar al entrenador como eliminado
      const { error: deleteError } = await supabase
        .from('usuarios')
        .update({ eliminado: true })
        .eq('id', trainerToDelete.id);
      
      if (deleteError) throw deleteError;
      
      toast.success("Entrenador eliminado exitosamente");
      setTrainerToDelete(null);
      
      // Refrescar datos
      refetch();
    } catch (error) {
      console.error("Error al eliminar entrenador:", error);
      toast.error("Error al eliminar el entrenador");
    }
  };

  return {
    trainers,
    isLoading,
    refetch,
    showNewTrainerDialog,
    setShowNewTrainerDialog,
    showEditTrainerDialog,
    setShowEditTrainerDialog,
    newTrainerData,
    setNewTrainerData,
    editTrainerData,
    setEditTrainerData,
    trainerToDelete,
    setTrainerToDelete,
    createTrainer,
    updateTrainer,
    deleteTrainer
  };
};
