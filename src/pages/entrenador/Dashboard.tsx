
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MessageSquare, Activity } from "lucide-react";

const TrainerDashboard = () => {
  // Datos de ejemplo (en producción, vendrían de Supabase)
  const stats = {
    totalClients: 15,
    activeClients: 12,
    upcomingAppointments: 3,
    unreadMessages: 5,
    completedToday: 8
  };

  return (
    <DashboardLayout allowedRoles={["entrenador"]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Panel del Entrenador</h1>
        <p className="text-muted-foreground">Bienvenido al panel de entrenador de Kraft Training</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Citas de Hoy</CardTitle>
              <CardDescription>Próximas citas programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <p className="font-medium">Ana Martínez</p>
                  <p className="text-sm">Evaluación mensual</p>
                  <p className="text-xs text-muted-foreground">Hoy - 14:30</p>
                </div>
                <div className="border-b pb-2">
                  <p className="font-medium">Carlos Rodríguez</p>
                  <p className="text-sm">Ajuste de rutina</p>
                  <p className="text-xs text-muted-foreground">Hoy - 16:00</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mensajes Recientes</CardTitle>
              <CardDescription>Últimos mensajes de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <p className="font-medium">Laura García</p>
                  <p className="text-sm">Tengo una duda sobre el ejercicio de...</p>
                  <p className="text-xs text-muted-foreground">Hace 30 minutos</p>
                </div>
                <div className="border-b pb-2">
                  <p className="font-medium">Pedro Sánchez</p>
                  <p className="text-sm">¿Podemos cambiar la cita del jueves?</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
