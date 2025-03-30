
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageSquare, Activity, Clock, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

const TrainerDashboard = () => {
  // Datos de ejemplo (en producción, vendrían de Supabase)
  const stats = {
    totalClients: 15,
    activeClients: 12,
    upcomingAppointments: 3,
    unreadMessages: 5,
    completedToday: 8
  };

  // Datos para el gráfico de actividad
  const activityData = [
    { day: "Lun", clientes: 4, ejercicios: 32 },
    { day: "Mar", clientes: 6, ejercicios: 45 },
    { day: "Mié", clientes: 5, ejercicios: 38 },
    { day: "Jue", clientes: 7, ejercicios: 52 },
    { day: "Vie", clientes: 8, ejercicios: 60 },
    { day: "Sáb", clientes: 10, ejercicios: 75 },
    { day: "Dom", clientes: 3, ejercicios: 25 },
  ];

  return (
    <DashboardLayout allowedRoles={["entrenador"]}>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mis Clientes</CardTitle>
              <Users size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeClients} activos recientemente
              </p>
              <Button variant="link" className="px-0 mt-2" size="sm" asChild>
                <Link to="/entrenador/clientes" className="flex items-center">
                  Ver todos <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Citas Próximas</CardTitle>
              <Calendar size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">
                En los próximos 7 días
              </p>
              <Button variant="link" className="px-0 mt-2" size="sm" asChild>
                <Link to="/entrenador/citas" className="flex items-center">
                  Ver agenda <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
              <MessageSquare size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">
                Mensajes sin leer
              </p>
              <Button variant="link" className="px-0 mt-2" size="sm" asChild>
                <Link to="/entrenador/mensajes" className="flex items-center">
                  Ver mensajes <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Actividad</CardTitle>
              <Activity size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">
                Ejercicios completados hoy
              </p>
              <Button variant="link" className="px-0 mt-2" size="sm" asChild>
                <Link to="/entrenador/informes" className="flex items-center">
                  Ver informes <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Citas de Hoy</CardTitle>
              <CardDescription>Próximas citas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 rounded-md border p-3">
                  <Avatar>
                    <AvatarFallback>AM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Ana Martínez</p>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> 14:30
                      </Badge>
                    </div>
                    <p className="text-sm">Evaluación mensual</p>
                    <div className="flex items-center pt-2">
                      <Button variant="outline" size="sm" className="mr-2">Reprogramar</Button>
                      <Button size="sm">Confirmar</Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 rounded-md border p-3">
                  <Avatar>
                    <AvatarFallback>CR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Carlos Rodríguez</p>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> 16:00
                      </Badge>
                    </div>
                    <p className="text-sm">Ajuste de rutina</p>
                    <div className="flex items-center pt-2">
                      <Button variant="outline" size="sm" className="mr-2">Reprogramar</Button>
                      <Button size="sm">Confirmar</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Mensajes Recientes</CardTitle>
              <CardDescription>Últimos mensajes de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 rounded-md border p-3">
                  <Avatar>
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Laura García</p>
                      <span className="text-xs text-muted-foreground">Hace 30 minutos</span>
                    </div>
                    <p className="text-sm">Tengo una duda sobre el ejercicio de...</p>
                    <Button variant="link" size="sm" className="px-0" asChild>
                      <Link to="/entrenador/mensajes" className="flex items-center">
                        Responder <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-4 rounded-md border p-3">
                  <Avatar>
                    <AvatarFallback>PS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Pedro Sánchez</p>
                      <span className="text-xs text-muted-foreground">Hace 2 horas</span>
                    </div>
                    <p className="text-sm">¿Podemos cambiar la cita del jueves?</p>
                    <Button variant="link" size="sm" className="px-0" asChild>
                      <Link to="/entrenador/mensajes" className="flex items-center">
                        Responder <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Actividad Semanal</CardTitle>
            <CardDescription>Resumen de actividad de la última semana</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="clientes">
              <TabsList className="mb-4">
                <TabsTrigger value="clientes">Clientes</TabsTrigger>
                <TabsTrigger value="ejercicios">Ejercicios</TabsTrigger>
              </TabsList>
              <TabsContent value="clientes">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
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
                    <LineChart data={activityData}>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
