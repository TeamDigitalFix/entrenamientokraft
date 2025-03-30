
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Paperclip } from "lucide-react";

const TrainerMessages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");
  
  // Datos de ejemplo (en producción, vendrían de Supabase)
  const conversations = [
    { id: 1, clientName: "Ana Martínez", lastMessage: "Tengo una duda sobre el ejercicio de...", time: "10:30", unread: true, avatar: null },
    { id: 2, clientName: "Carlos Rodríguez", lastMessage: "Gracias por la sesión de hoy", time: "Ayer", unread: false, avatar: null },
    { id: 3, clientName: "Laura García", lastMessage: "¿Cuándo podemos tener la próxima sesión?", time: "Ayer", unread: true, avatar: null },
    { id: 4, clientName: "Pedro Sánchez", lastMessage: "¿Podemos cambiar la cita del jueves?", time: "Lunes", unread: false, avatar: null },
    { id: 5, clientName: "María López", lastMessage: "Ya completé los ejercicios", time: "23/10", unread: false, avatar: null },
  ];

  const filteredConversations = conversations.filter(conversation => 
    conversation.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mensajes de la conversación seleccionada
  const messages = [
    { id: 1, sender: "client", text: "Hola, tengo una duda sobre el ejercicio de press de banca", time: "10:15" },
    { id: 2, sender: "trainer", text: "Hola Ana, claro. ¿Qué duda tienes?", time: "10:20" },
    { id: 3, sender: "client", text: "¿Cuántas repeticiones debería hacer? En mi rutina dice 4x10 pero no estoy segura", time: "10:25" },
    { id: 4, sender: "trainer", text: "Sí, son 4 series de 10 repeticiones. Si te resulta demasiado pesado, puedes bajar un poco el peso y mantener las repeticiones.", time: "10:30" },
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Aquí iría la lógica para enviar el mensaje a Supabase
      // Por ahora solo limpiamos el input
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

  return (
    <DashboardLayout allowedRoles={["entrenador"]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mensajes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Lista de conversaciones */}
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
                  {filteredConversations.map((conversation) => (
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
                        <AvatarFallback>{getInitials(conversation.clientName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="font-medium truncate">{conversation.clientName}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{conversation.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread && <Badge className="ml-auto">Nuevo</Badge>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Ventana de chat */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <CardContent className="p-4 flex-1 flex flex-col h-full">
                {/* Cabecera del chat */}
                <div className="flex items-center gap-3 border-b pb-4 mb-4">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(conversations.find(c => c.id === selectedConversation)?.clientName || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {conversations.find(c => c.id === selectedConversation)?.clientName}
                    </h3>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                  </div>
                </div>
                
                {/* Mensajes */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.sender === 'trainer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'trainer' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.text}</p>
                          <span className={`text-xs block mt-1 ${
                            message.sender === 'trainer' 
                              ? 'text-primary-foreground/80' 
                              : 'text-muted-foreground'
                          }`}>
                            {message.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Input de mensaje */}
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
