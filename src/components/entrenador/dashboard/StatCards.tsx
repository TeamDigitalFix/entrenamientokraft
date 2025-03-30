
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, MessageSquare, Activity, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats } from "@/hooks/entrenador/useDashboard";

interface StatCardsProps {
  isLoading: boolean;
  stats: DashboardStats | undefined | null;
}

export const StatCards: React.FC<StatCardsProps> = ({ isLoading, stats }) => {
  return (
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
              <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeClients || 0} activos recientemente
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
              <div className="text-2xl font-bold">{stats?.upcomingAppointments || 0}</div>
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
              <div className="text-2xl font-bold">{stats?.unreadMessages || 0}</div>
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
              <div className="text-2xl font-bold">{stats?.completedToday || 0}</div>
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
  );
};
