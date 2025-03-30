
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Stats } from "@/types/admin";

interface DashboardStatsProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

export const DashboardStats = ({ stats, isLoading }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Entrenadores</CardTitle>
          <Users size={20} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-20" /> : stats?.totalTrainers}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-24 mt-1" /> : `${stats?.activeTrainers} activos`}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users size={20} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-20" /> : stats?.totalClients}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-40 mt-1" />
            ) : (
              `${stats?.clientsWithRoutines} con rutinas, ${stats?.clientsWithDiets} con dietas`
            )}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ejercicios</CardTitle>
          <Dumbbell size={20} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-20" /> : stats?.totalExercises}
          </div>
          <p className="text-xs text-muted-foreground">
            En la base de datos
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Alimentos</CardTitle>
          <Dumbbell size={20} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-20" /> : stats?.totalFoods}
          </div>
          <p className="text-xs text-muted-foreground">
            En la base de datos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
