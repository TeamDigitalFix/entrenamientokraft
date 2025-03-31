
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trainer, DeletedTrainer } from "@/types/admin";

export const useTrainers = (page: number, searchTerm: string, showDeleted: boolean = false, pageSize: number = 10) => {
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
  const [trainerToPermanentDelete, setTrainerToPermanentDelete] = useState<DeletedTrainer | null>(null);
  const [trainerToRestore, setTrainerToRestore] = useState<DeletedTrainer | null>(null);

  const { data: trainers, isLoading, refetch } = useQuery({
    queryKey: ['admin-trainers', page, searchTerm, showDeleted],
    queryFn: async () => {
      try {
        let query = supabase
          .from('usuarios')
          .select('id, username, nombre, email, telefono, creado_en, actualizado_en, eliminado')
          .eq('role', 'entrenador')
          .eq('eliminado', showDeleted);
        
        if (searchTerm) {
          query = query.or(`nombre.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        
        const from = (page - 1) * pageSize;
        query = query.range(from, from + pageSize - 1);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
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
                createdAt: new Date(trainer.creado_en),
                deleted: trainer.eliminado,
                ...(trainer.eliminado && { deletedAt: new Date(trainer.actualizado_en) })
              };
            }
            
            return {
              id: trainer.id,
              username: trainer.username,
              name: trainer.nombre,
              email: trainer.email,
              phone: trainer.telefono,
              clientCount: clients?.length || 0,
              createdAt: new Date(trainer.creado_en),
              deleted: trainer.eliminado,
              ...(trainer.eliminado && { deletedAt: new Date(trainer.actualizado_en) })
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

  const createTrainer = async () => {
    try {
      if (!newTrainerData.username || !newTrainerData.password || !newTrainerData.name) {
        toast.error("Por favor completa los campos obligatorios");
        return;
      }
      
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
      
      setNewTrainerData({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: ""
      });
      
      refetch();
    } catch (error) {
      console.error("Error al crear entrenador:", error);
      toast.error("Error al crear el entrenador");
    }
  };

  const updateTrainer = async () => {
    if (!editTrainerData) return;
    
    try {
      const updateData: any = {
        nombre: editTrainerData.name,
        email: editTrainerData.email,
        telefono: editTrainerData.phone
      };

      if ('username' in editTrainerData && editTrainerData.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('username', editTrainerData.username)
          .neq('id', editTrainerData.id)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existingUser) {
          toast.error("El nombre de usuario ya está en uso");
          return;
        }
        
        updateData.username = editTrainerData.username;
      }
      
      if ('password' in editTrainerData && editTrainerData.password) {
        updateData.password = editTrainerData.password;
      }
      
      const { data, error } = await supabase
        .from('usuarios')
        .update(updateData)
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

  const deleteTrainer = async () => {
    if (!trainerToDelete) return;
    
    try {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ entrenador_id: null })
        .eq('entrenador_id', trainerToDelete.id);
      
      if (updateError) throw updateError;
      
      const { error: deleteError } = await supabase
        .from('usuarios')
        .update({ eliminado: true })
        .eq('id', trainerToDelete.id);
      
      if (deleteError) throw deleteError;
      
      toast.success("Entrenador movido a la papelera");
      setTrainerToDelete(null);
      
      refetch();
    } catch (error) {
      console.error("Error al eliminar entrenador:", error);
      toast.error("Error al mover el entrenador a la papelera");
    }
  };

  const restoreTrainer = async () => {
    if (!trainerToRestore) return;
    
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ eliminado: false })
        .eq('id', trainerToRestore.id);
      
      if (error) throw error;
      
      toast.success("Entrenador restaurado exitosamente");
      setTrainerToRestore(null);
      
      refetch();
    } catch (error) {
      console.error("Error al restaurar entrenador:", error);
      toast.error("Error al restaurar el entrenador");
    }
  };

  const permanentDeleteTrainer = async () => {
    if (!trainerToPermanentDelete) return;
    
    try {
      // Use direct function call instead of rpc
      const { error } = await supabase
        .from('usuarios')
        .select()
        .eq('id', trainerToPermanentDelete.id)
        .then(async ({ error: selectError }) => {
          if (selectError) throw selectError;
          
          // Call the function directly
          return await supabase.functions.invoke('delete-trainer', {
            body: { trainer_id: trainerToPermanentDelete.id }
          });
        });
      
      if (error) throw error;
      
      toast.success("Entrenador eliminado permanentemente");
      setTrainerToPermanentDelete(null);
      
      refetch();
    } catch (error) {
      console.error("Error al eliminar permanentemente entrenador:", error);
      toast.error("Error al eliminar permanentemente el entrenador");
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
    trainerToPermanentDelete, 
    setTrainerToPermanentDelete,
    trainerToRestore,
    setTrainerToRestore,
    createTrainer,
    updateTrainer,
    deleteTrainer,
    restoreTrainer,
    permanentDeleteTrainer
  };
};
