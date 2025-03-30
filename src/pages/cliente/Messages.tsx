
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/index";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ClientMessages = () => {
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
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>ET</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Mi Entrenador</CardTitle>
                  <CardDescription>Conversación activa</CardDescription>
                </div>
              </div>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Avatar className="mt-1 h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>ET</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                    <p className="text-sm">Hola, ¿cómo va el entrenamiento de hoy?</p>
                    <p className="text-xs text-muted-foreground mt-1">10:25</p>
                  </div>
                </div>
                
                <div className="flex items-start justify-end gap-2">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                    <p className="text-sm">¡Muy bien! Acabo de terminar la rutina completa.</p>
                    <p className="text-xs text-primary-foreground/70 mt-1">10:30</p>
                  </div>
                  <Avatar className="mt-1 h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex items-start gap-2">
                  <Avatar className="mt-1 h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>ET</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                    <p className="text-sm">¡Excelente! Recuerda seguir tu plan de alimentación también. Mañana revisamos tu progreso.</p>
                    <p className="text-xs text-muted-foreground mt-1">10:32</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input placeholder="Escribe un mensaje..." className="flex-1" />
                <Button size="icon">
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
