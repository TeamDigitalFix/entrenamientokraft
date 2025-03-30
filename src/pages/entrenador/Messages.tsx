
import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Paperclip } from "lucide-react";
import { UserRole } from "@/types/index";
import { useMessages } from "@/hooks/entrenador/useMessages";
import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

const TrainerMessages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    conversations, 
    loading, 
    selectedConversation, 
    setSelectedConversation, 
    sendMessage,
    unreadCount 
  } = useMessages();
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      await sendMessage(selectedConversation, newMessage);
      setNewMessage("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
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
  
  const formatConversationTime = (dateString?: string) => {
    if (!dateString) return "";
    
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return format(date, "HH:mm", { locale: es });
      } else if (isYesterday(date)) {
        return "Ayer";
      } else {
        return formatDistanceToNow(date, { locale: es, addSuffix: true });
      }
    } catch (error) {
      return "";
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mensajes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          <Card className="md:col-span-1 flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversación..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {loading ? (
                    <p className="text-center text-muted-foreground py-4">Cargando conversaciones...</p>
                  ) : filteredConversations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No se encontraron conversaciones</p>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div 
                        key={conversation.id}
                        className={`flex items-start gap-3 p-3 rounded-md cursor-pointer ${
                          selectedConversation === conversation.id 
                            ? "bg-accent" 
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <Avatar>
                          <AvatarImage src={conversation.avatar || undefined} />
                          <AvatarFallback>{getInitials(conversation.nombre)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-medium truncate">{conversation.nombre}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {formatConversationTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage || "No hay mensajes"}
                          </p>
                        </div>
                        {conversation.unread && <Badge className="ml-auto">Nuevo</Badge>}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <CardContent className="p-4 flex-1 flex flex-col h-full">
                <div className="flex items-center gap-3 border-b pb-4 mb-4">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(conversations.find(c => c.id === selectedConversation)?.nombre || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {conversations.find(c => c.id === selectedConversation)?.nombre}
                    </h3>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {loading ? (
                      <p className="text-center text-muted-foreground py-4">Cargando mensajes...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No hay mensajes. ¡Comienza una conversación!</p>
                    ) : (
                      messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.emisor_id !== selectedConversation ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.emisor_id !== selectedConversation 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p>{message.contenido}</p>
                            <span className={`text-xs block mt-1 ${
                              message.emisor_id !== selectedConversation
                                ? 'text-primary-foreground/80' 
                                : 'text-muted-foreground'
                            }`}>
                              {formatMessageTime(message.creado_en)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="icon" type="button">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Selecciona una conversación para comenzar</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerMessages;
