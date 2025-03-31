
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { UserRole } from "@/types/index";
import { Calendar, Clock, ArrowUpRight, MessageSquare, Users } from "lucide-react";
import { useDashboard } from "@/hooks/entrenador/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCards } from "@/components/entrenador/dashboard/StatCards";
import { PaymentAlerts } from "@/components/entrenador/dashboard/PaymentAlerts";

const TrainerDashboard = () => {
  const { dashboardStats, todayAppointments, recentMessages, isLoading } = useDashboard();

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Panel del Entrenador</h1>
            <p className="text-muted-foreground">Bienvenido al panel de entrenador de Kraft Training</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Button variant="outline" size="sm" asChild>
              <Link to="/entrenador/clientes">
                <Users className="h-4 w-4 mr-1" /> Clientes
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/entrenador/citas">
                <Calendar className="h-4 w-4 mr-1" /> Gestionar Citas
              </Link>
            </Button>
          </div>
        </div>
        
        <StatCards isLoading={isLoading} stats={dashboardStats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Citas de Hoy */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Citas de Hoy</CardTitle>
              <CardDescription>Próximas citas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : todayAppointments && todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start space-x-4 rounded-md border p-3">
                      <Avatar>
                        <AvatarFallback>{appointment.client.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{appointment.client.name}</p>
                          <Badge variant="outline" className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {appointment.time}
                          </Badge>
                        </div>
                        <p className="text-sm">{appointment.title}</p>
                        {appointment.description && (
                          <p className="text-xs text-muted-foreground">{appointment.description}</p>
                        )}
                        <div className="flex items-center pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mr-2"
                            asChild
                          >
                            <Link to={`/entrenador/citas?id=${appointment.id}&action=edit`}>
                              Gestionar
                            </Link>
                          </Button>
                          <Button 
                            size="sm"
                            asChild
                          >
                            <Link to={`/entrenador/cliente/${appointment.client.id}/rutina`}>
                              Ver Rutina
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <Calendar className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground">No hay citas programadas para hoy</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/entrenador/citas">Programar una cita</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Alertas de Pagos */}
          <Card className="col-span-1">
            <PaymentAlerts />
          </Card>
          
          {/* Mensajes Recientes */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Mensajes Recientes</CardTitle>
              <CardDescription>Últimos mensajes de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : recentMessages && recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-4 rounded-md border p-3">
                      <Avatar>
                        <AvatarFallback>{message.sender.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="font-medium">{message.sender.name}</p>
                            {!message.read && (
                              <span className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{message.timeAgo}</span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="px-0" 
                          asChild
                        >
                          <Link to={`/entrenador/mensajes?client=${message.sender.id}`} className="flex items-center">
                            Responder <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground">No hay mensajes recientes</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/entrenador/mensajes">Ver mensajes</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
