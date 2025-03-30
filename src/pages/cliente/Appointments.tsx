
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";

const ClientAppointments = () => {
  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mis Citas</h1>
        <p className="text-muted-foreground">Gestiona tus citas programadas con tu entrenador</p>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Próximas Citas</CardTitle>
                <CardDescription>Citas programadas con tu entrenador</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Evaluación mensual</p>
                    <p className="text-sm text-muted-foreground">
                      Mañana - 15:00
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Ajuste de dieta</p>
                    <p className="text-sm text-muted-foreground">
                      Viernes - 17:30
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                </div>
              </div>
              <Button className="w-full mt-4">Solicitar nueva cita</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Historial de Citas</CardTitle>
                <CardDescription>Tus citas pasadas</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Introducción al programa</p>
                    <p className="text-sm text-muted-foreground">
                      15/03/2025 - 14:00
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientAppointments;
