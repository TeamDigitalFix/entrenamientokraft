
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Message {
  id: string;
  emisor_id: string;
  receptor_id: string;
  contenido: string;
  leido: boolean;
  creado_en: string;
}

export const useClientMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [entrenador, setEntrenador] = useState<{id: string, nombre: string, avatar?: string | null} | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar el entrenador del cliente
  const loadEntrenador = async () => {
    if (!user?.id) return;
    
    try {
      // Obtener el entrenador asignado al cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from("usuarios")
        .select("entrenador_id")
        .eq("id", user.id)
        .single();
      
      if (clienteError) {
        throw clienteError;
      }
      
      if (!clienteData?.entrenador_id) {
        console.error("Cliente no tiene entrenador asignado");
        setLoading(false);
        return;
      }
      
      // Obtener datos del entrenador
      const { data: entrenadorData, error: entrenadorError } = await supabase
        .from("usuarios")
        .select("id, nombre")
        .eq("id", clienteData.entrenador_id)
        .single();
      
      if (entrenadorError) {
        throw entrenadorError;
      }
      
      setEntrenador({
        id: entrenadorData.id,
        nombre: entrenadorData.nombre,
        avatar: null // En el futuro se podría obtener el avatar
      });
      
      // Una vez obtenido el entrenador, cargar mensajes
      await loadMessages(entrenadorData.id);
      
    } catch (error) {
      console.error("Error al cargar entrenador:", error);
      toast.error("No se pudo cargar la información del entrenador");
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes entre cliente y entrenador
  const loadMessages = async (entrenadorId: string) => {
    if (!user?.id || !entrenadorId) return;
    
    setLoading(true);
    try {
      // Obtener mensajes entre cliente y entrenador
      const { data, error } = await supabase
        .from("mensajes")
        .select("*")
        .or(`emisor_id.eq.${user.id},receptor_id.eq.${user.id}`)
        .or(`emisor_id.eq.${entrenadorId},receptor_id.eq.${entrenadorId}`)
        .order("creado_en", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setMessages(data || []);
      
      // Marcar como leídos los mensajes recibidos
      await markMessagesAsRead(entrenadorId);
      
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
      toast.error("No se pudieron cargar los mensajes");
    } finally {
      setLoading(false);
    }
  };

  // Marcar mensajes como leídos
  const markMessagesAsRead = async (senderId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from("mensajes")
        .update({ leido: true })
        .eq("receptor_id", user.id)
        .eq("emisor_id", senderId)
        .eq("leido", false);
      
      if (error) {
        console.error("Error al marcar mensajes como leídos:", error);
      }
      
      // Actualizar conteo de mensajes no leídos
      updateUnreadCount();
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error);
    }
  };

  // Enviar un nuevo mensaje
  const sendMessage = async (content: string) => {
    if (!user?.id || !entrenador?.id || !content.trim()) return null;
    
    try {
      const newMessage = {
        emisor_id: user.id,
        receptor_id: entrenador.id,
        contenido: content.trim(),
        leido: false
      };
      
      const { data, error } = await supabase
        .from("mensajes")
        .insert(newMessage)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Actualizar mensajes en la UI
      setMessages(prevMessages => [...prevMessages, data]);
      
      return data;
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast.error("No se pudo enviar el mensaje");
      return null;
    }
  };

  // Actualizar conteo de mensajes no leídos
  const updateUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("mensajes")
        .select("id")
        .eq("receptor_id", user.id)
        .eq("leido", false);
      
      if (error) {
        throw error;
      }
      
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error("Error al obtener mensajes no leídos:", error);
    }
  };

  // Cargar entrenador cuando cambia el usuario
  useEffect(() => {
    if (user?.id) {
      loadEntrenador();
      updateUnreadCount();
    }
  }, [user?.id]);

  // Auto-scroll al final de los mensajes cuando llegan nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Configurar suscripción a nuevos mensajes en tiempo real
  useEffect(() => {
    if (!user?.id) return;
    
    const subscription = supabase
      .channel('mensajes_cliente_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `receptor_id=eq.${user.id}`
      }, (payload) => {
        console.log('Nuevo mensaje recibido:', payload);
        
        const newMessage = payload.new as Message;
        
        // Actualizar mensajes en la UI
        setMessages(prevMessages => {
          // Evitar duplicados
          if (prevMessages.some(msg => msg.id === newMessage.id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
        
        // Notificar al usuario
        if (entrenador && newMessage.emisor_id === entrenador.id) {
          toast.info(`Nuevo mensaje de ${entrenador.nombre}`);
          // Actualizar conteo de mensajes no leídos
          updateUnreadCount();
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id, entrenador]);

  return {
    messages,
    entrenador,
    loading,
    unreadCount,
    sendMessage,
    messagesEndRef,
    updateUnreadCount,
    markMessagesAsRead
  };
};
