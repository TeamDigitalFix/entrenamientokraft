
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/index";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { useClientMessages } from "@/hooks/cliente/useClientMessages";
import { ScrollArea } from "@/components/ui/scroll-area";

const ClientMessages = () => {
  const [newMessage, setNewMessage] = useState("");
  const { 
    messages, 
    entrenador, 
    loading, 
    sendMessage, 
    messagesEndRef 
  } = useClientMessages();

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return format(date, "HH:mm", { locale: es });
      } else if (isYesterday(date)) {
        return "Ayer";
      } else {
        return format(date, "dd/MM/yyyy", { locale: es });
      }
    } catch (error) {
      return "Fecha desconocida";
    }
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mensajes</h1>
        <p className="text-muted-foreground">Comunícate con tu entrenador</p>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={entrenador?.avatar || undefined} />
                  <AvatarFallback>
                    {entrenador?.nombre ? entrenador.nombre.charAt(0).toUpperCase() : "ET"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{entrenador?.nombre || "Mi Entrenador"}</CardTitle>
                  <CardDescription>Conversación activa</CardDescription>
                </div>
              </div>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 overflow-y-auto py-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Cargando mensajes...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No hay mensajes. ¡Comienza una conversación!</p>
                </div>
              ) : (
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex items-start gap-2 ${
                          message.emisor_id !== entrenador?.id ? 'justify-end' : ''
                        }`}
                      >
                        {message.emisor_id === entrenador?.id && (
                          <Avatar className="mt-1 h-8 w-8">
                            <AvatarImage src={entrenador.avatar || undefined} />
                            <AvatarFallback>
                              {entrenador.nombre.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div 
                          className={`${
                            message.emisor_id === entrenador?.id 
                              ? 'bg-muted' 
                              : 'bg-primary text-primary-foreground'
                          } p-3 rounded-lg max-w-[80%]`}
                        >
                          <p className="text-sm">{message.contenido}</p>
                          <p 
                            className={`text-xs ${
                              message.emisor_id === entrenador?.id
                                ? 'text-muted-foreground' 
                                : 'text-primary-foreground/70'
                            } mt-1`}
                          >
                            {formatMessageTime(message.creado_en)}
                          </p>
                        </div>
                        
                        {message.emisor_id !== entrenador?.id && (
                          <Avatar className="mt-1 h-8 w-8">
                            <AvatarFallback>YO</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input 
                  placeholder="Escribe un mensaje..." 
                  className="flex-1" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading || !entrenador}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading || !entrenador}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientMessages;
