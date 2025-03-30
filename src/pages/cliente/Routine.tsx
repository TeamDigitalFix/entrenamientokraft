
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";

const ClientRoutine = () => {
  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mi Rutina</h1>
        <p className="text-muted-foreground">Aquí puedes ver y seguir tu rutina de ejercicios personalizada</p>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Rutina Actual</CardTitle>
                <CardDescription>Tu programa de entrenamiento personalizado</CardDescription>
              </div>
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center py-10 text-muted-foreground">
                Estamos preparando tu rutina personalizada. Tu entrenador estará actualizándola pronto.
              </p>
              <Button className="w-full mt-4">Ver detalles</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientRoutine;
