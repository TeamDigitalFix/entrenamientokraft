import { useState, useEffect } from "react";
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
  emisor?: {
    nombre: string;
  };
  receptor?: {
    nombre: string;
  };
}

export interface ConversationParticipant {
  id: string;
  nombre: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: boolean;
  avatar?: string | null;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadConversations = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log("Cargando conversaciones para el usuario:", user.id);
      
      const { data: clientesData, error: clientesError } = await supabase
        .from("usuarios")
        .select("id, nombre, ultimo_ingreso")
        .eq("entrenador_id", user.id)
        .eq("role", "cliente")
        .eq("eliminado", false);
      
      if (clientesError) {
        throw clientesError;
      }
      
      console.log("Clientes obtenidos:", clientesData);
      
      const conversationsWithMessages = await Promise.all(
        clientesData.map(async (cliente) => {
          try {
            const { data: mensajeData, error: mensajeError } = await supabase
              .from("chat_mensajes")
              .select("*")
              .or(`emisor_id.eq.${user.id},receptor_id.eq.${user.id}`)
              .or(`emisor_id.eq.${cliente.id},receptor_id.eq.${cliente.id}`)
              .order("creado_en", { ascending: false })
              .limit(1);
            
            if (mensajeError) {
              console.error("Error al obtener último mensaje:", mensajeError);
              return {
                id: cliente.id,
                nombre: cliente.nombre,
                lastMessage: "",
                lastMessageTime: "",
                unread: false,
                avatar: null,
              };
            }
            
            const { data: unreadData, error: unreadError } = await supabase
              .from("chat_mensajes")
              .select("id")
              .eq("receptor_id", user.id)
              .eq("emisor_id", cliente.id)
              .eq("leido", false);
            
            const hasUnread = unreadData && unreadData.length > 0;
            
            return {
              id: cliente.id,
              nombre: cliente.nombre,
              lastMessage: mensajeData && mensajeData.length > 0 ? mensajeData[0].contenido : "",
              lastMessageTime: mensajeData && mensajeData.length > 0 ? mensajeData[0].creado_en : cliente.ultimo_ingreso,
              unread: hasUnread,
              avatar: null,
            };
          } catch (error) {
            console.error(`Error procesando conversación con cliente ${cliente.id}:`, error);
            return {
              id: cliente.id,
              nombre: cliente.nombre,
              unread: false,
              avatar: null,
            };
          }
        })
      );
      
      setConversations(conversationsWithMessages);
      
      if (conversationsWithMessages.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsWithMessages[0].id);
      }
      
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
      toast.error("No se pudieron cargar las conversaciones");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user?.id || !conversationId) return;
    
    setLoading(true);
    try {
      console.log("Cargando mensajes entre", user.id, "y", conversationId);
      
      const { data, error } = await supabase
        .from("chat_mensajes")
        .select("*")
        .or(`emisor_id.eq.${user.id},receptor_id.eq.${user.id}`)
        .or(`emisor_id.eq.${conversationId},receptor_id.eq.${conversationId}`)
        .order("creado_en", { ascending: true });
      
      if (error) {
        throw error;
      }
      
      console.log("Mensajes obtenidos:", data);
      setMessages(data || []);
      
      await markMessagesAsRead(conversationId);
      
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
      toast.error("No se pudieron cargar los mensajes");
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from("chat_mensajes")
        .update({ leido: true })
        .eq("receptor_id", user.id)
        .eq("emisor_id", senderId)
        .eq("leido", false);
      
      if (error) {
        console.error("Error al marcar mensajes como leídos:", error);
      } else {
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === senderId ? { ...conv, unread: false } : conv
          )
        );
      }
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user?.id || !receiverId || !content.trim()) return null;
    
    try {
      const newMessage = {
        emisor_id: user.id,
        receptor_id: receiverId,
        contenido: content.trim(),
        leido: false
      };
      
      console.log("Enviando mensaje:", newMessage);
      
      const { data, error } = await supabase
        .from("chat_mensajes")
        .insert(newMessage)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log("Mensaje enviado:", data);
      
      setMessages(prevMessages => [...prevMessages, data]);
      
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === receiverId 
            ? { 
                ...conv, 
                lastMessage: content.trim(), 
                lastMessageTime: new Date().toISOString() 
              } 
            : conv
        )
      );
      
      return data;
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast.error("No se pudo enviar el mensaje");
      return null;
    }
  };

  const updateUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("chat_mensajes")
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

  const deleteConversation = async (clientId: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase.rpc('delete_chat_messages', {
        p_entrenador_id: user.id,
        p_cliente_id: clientId
      });
      
      if (error) throw error;
      
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === clientId ? { ...conv, lastMessage: "", lastMessageTime: "", unread: false } : conv
        )
      );
      
      if (selectedConversation === clientId) {
        setMessages([]);
      }
      
      toast.success("Conversación eliminada con éxito");
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Error al eliminar la conversación");
      return false;
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadConversations();
      updateUnreadCount();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (!user?.id) return;
    
    const subscription = supabase
      .channel('chat_mensajes_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_mensajes',
        filter: `receptor_id=eq.${user.id}`
      }, (payload) => {
        console.log('Nuevo mensaje recibido:', payload);
        
        const newMessage = payload.new as Message;
        
        if (selectedConversation === newMessage.emisor_id) {
          setMessages(prevMessages => [...prevMessages, newMessage]);
          markMessagesAsRead(newMessage.emisor_id);
        }
        
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv.id === newMessage.emisor_id) {
              return {
                ...conv,
                lastMessage: newMessage.contenido,
                lastMessageTime: newMessage.creado_en,
                unread: selectedConversation !== newMessage.emisor_id
              };
            }
            return conv;
          });
        });
        
        if (selectedConversation !== newMessage.emisor_id) {
          const sender = conversations.find(c => c.id === newMessage.emisor_id);
          toast.info(`Nuevo mensaje de ${sender?.nombre || 'un cliente'}`);
          updateUnreadCount();
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id, selectedConversation, conversations]);

  return {
    messages,
    conversations,
    loading,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    loadConversations,
    loadMessages,
    unreadCount,
    updateUnreadCount,
    deleteConversation
  };
};
