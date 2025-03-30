
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { parseISO } from "date-fns";

export type DashboardMessage = {
  id: string;
  sender: {
    id: string;
    name: string;
    initials: string;
  };
  content: string;
  timeAgo: string;
  read: boolean;
};

export const useDashboardMessages = () => {
  const { user } = useAuth();

  const { data: recentMessages, isLoading } = useQuery({
    queryKey: ["dashboard", "messages", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];

        // Mensajes recientes
        const { data, error } = await supabase
          .from("mensajes")
          .select("id, emisor_id, contenido, creado_en, leido")
          .eq("receptor_id", user.id)
          .order("creado_en", { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Obtener nombres de emisores
        const messages = await Promise.all(data.map(async (message) => {
          const { data: senderData, error: senderError } = await supabase
            .from("usuarios")
            .select("nombre")
            .eq("id", message.emisor_id)
            .single();
            
          if (senderError) {
            console.warn(`No se pudo obtener el emisor para el mensaje ${message.id}:`, senderError);
            return null;
          }
          
          const name = senderData?.nombre || "Usuario";
          const initials = name
            .split(" ")
            .map(n => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          
          // Formatear tiempo relativo
          const messageDate = parseISO(message.creado_en);
          let timeAgo = "hace un momento";
          
          const diffMinutes = Math.floor((new Date().getTime() - messageDate.getTime()) / (1000 * 60));
          
          if (diffMinutes < 1) {
            timeAgo = "hace un momento";
          } else if (diffMinutes < 60) {
            timeAgo = `Hace ${diffMinutes} minutos`;
          } else if (diffMinutes < 24 * 60) {
            const hours = Math.floor(diffMinutes / 60);
            timeAgo = `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
          } else {
            const days = Math.floor(diffMinutes / (60 * 24));
            timeAgo = `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
          }
          
          return {
            id: message.id,
            sender: {
              id: message.emisor_id,
              name,
              initials
            },
            content: message.contenido.length > 50 
              ? message.contenido.substring(0, 50) + "..." 
              : message.contenido,
            timeAgo,
            read: message.leido
          };
        }));
        
        return messages.filter(Boolean) as DashboardMessage[];
      } catch (error) {
        console.error("Error al cargar mensajes recientes:", error);
        toast.error("No se pudieron cargar los mensajes recientes");
        return [];
      }
    },
    enabled: !!user?.id
  });

  return { recentMessages, isLoading };
};
