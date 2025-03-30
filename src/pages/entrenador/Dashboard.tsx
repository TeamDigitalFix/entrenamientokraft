
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { UserRole } from "@/types/index";
import { Users, Calendar, MessageSquare, Activity, Clock, ArrowUpRight } from "lucide-react";
import { useDashboard } from "@/hooks/entrenador/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const TrainerDashboard = () => {
  const { dashboardStats, todayAppointments, recentMessages, weeklyActivity, isLoading } = useDashboard();

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel del Entrenador</h1>
            <p className="text-muted-foreground">Bienvenido al panel de entrenador de Kraft Training</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant="outline" asChild>
              <Link to="/entrenador/clientes">Ver Clientes</Link>
            </Button>
            <Button asChild>
              <Link to="/entrenador/citas">Gestionar Citas</Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tarjeta Mis Clientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mis Clientes</CardTitle>
              <Users size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardStats?.totalClients || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.activeClients || 0} activos recientemente
                  </p>
                </>
              )}
              <Button variant="link" className="px-0 mt-2" size="sm" asChild>
                <Link to="/entrenador/clientes" className="flex items-center">
                  Ver todos <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Tarjeta Citas Próximas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Citas Próximas</CardTitle>
              <Calendar size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardStats?.upcomingAppointments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    En los próximos 7 días
                  </p>
                </>
              )}
              <Button variant="link" className="px-0 mt-2" size="sm" asChild>
                <Link to="/entrenador/citas" className="flex items-center">
                  Ver agenda <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Tarjeta Mensajes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
              <MessageSquare size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardStats?.unreadMessages || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Mensajes sin leer
                  </p>
                </>
              )}
              <Button variant="link" className="px-0 mt-2" size="sm" asChild>
                <Link to="/entrenador/mensajes" className="flex items-center">
                  Ver mensajes <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Tarjeta Actividad */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Actividad</CardTitle>
              <Activity size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardStats?.completedToday || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Ejercicios completados hoy
                  </p>
                </>
              )}
              <Button variant="link" className="px-0 mt-2" size="sm" asChild>
                <Link to="/entrenador/informes" className="flex items-center">
                  Ver informes <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        <div className="flex items-center pt-2">
                          <Button variant="outline" size="sm" className="mr-2">Reprogramar</Button>
                          <Button size="sm">Confirmar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No hay citas programadas para hoy</p>
              )}
            </CardContent>
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
                          <p className="font-medium">{message.sender.name}</p>
                          <span className="text-xs text-muted-foreground">{message.timeAgo}</span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <Button variant="link" size="sm" className="px-0" asChild>
                          <Link to="/entrenador/mensajes" className="flex items-center">
                            Responder <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No hay mensajes recientes</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Actividad Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Semanal</CardTitle>
            <CardDescription>Resumen de actividad de la última semana</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <Tabs defaultValue="clientes">
                <TabsList className="mb-4">
                  <TabsTrigger value="clientes">Clientes</TabsTrigger>
                  <TabsTrigger value="ejercicios">Ejercicios</TabsTrigger>
                </TabsList>
                <TabsContent value="clientes">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="clientes" 
                          stroke="#8884d8" 
                          strokeWidth={2} 
                          name="Clientes Activos"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="ejercicios">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="ejercicios" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          name="Ejercicios Completados" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
