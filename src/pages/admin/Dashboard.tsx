
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const AdminDashboard = () => {
  // Datos de ejemplo (en producción, vendrían de Supabase)
  const stats = {
    totalTrainers: 5,
    activeTrainers: 4,
    inactiveTrainers: 1,
    totalClients: 42
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">Bienvenido al panel de administración de Kraft Training</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Entrenadores</CardTitle>
              <Users size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrainers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTrainers} activos, {stats.inactiveTrainers} inactivos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users size={20} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Distribuidos entre {stats.activeTrainers} entrenadores
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="font-medium">Nuevo entrenador registrado</p>
                <p className="text-sm text-muted-foreground">Juan Pérez se unió al equipo</p>
                <p className="text-xs text-muted-foreground">Hace 2 días</p>
              </div>
              <div className="border-b pb-4">
                <p className="font-medium">Entrenador actualizado</p>
                <p className="text-sm text-muted-foreground">Se actualizó la información de María López</p>
                <p className="text-xs text-muted-foreground">Hace 5 días</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
