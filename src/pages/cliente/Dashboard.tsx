import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Utensils, Calendar, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { useClientDashboard } from "@/hooks/cliente/useClientDashboard";
import { useExerciseToggle } from "@/hooks/cliente/useExerciseToggle";
import { useMealToggle } from "@/hooks/cliente/useMealToggle";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const ClientDashboard = () => {
  const { 
    todaySchedule, 
    progressSummary, 
    isLoading,
    clientId
  } = useClientDashboard();
  
  const { toggleExerciseCompletion, isToggling: isTogglingExercise } = useExerciseToggle();
  const { toggleMealCompletion, isToggling: isTogglingMeal } = useMealToggle();

  const handleExerciseToggle = (id: string, currentStatus: boolean) => {
    toggleExerciseCompletion({ exerciseId: id, completed: currentStatus });
  };

  const handleMealToggle = (id: string, currentStatus: boolean) => {
    if (!clientId) return;
    
    toggleMealCompletion({ 
      mealId: id, 
      completed: currentStatus,
      clientId: clientId
    });
  };

  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "programada":
        return "outline";
      case "completada":
        return "success";
      case "cancelada":
        return "destructive";
      case "sin confirmar":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatAppointmentDate = (date: Date) => {
    const today = new Date();
    
    if (isSameDay(date, today)) {
      return "Hoy";
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (isSameDay(date, tomorrow)) {
      return "Mañana";
    }
    
    return format(date, "EEEE d 'de' MMMM", { locale: es });
  };
  
  const groupedAppointments = todaySchedule?.appointments.reduce((acc, appointment) => {
    const dateKey = formatAppointmentDate(appointment.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(appointment);
    return acc;
  }, {} as Record<string, typeof todaySchedule.appointments>);

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mi Panel</h1>
        <p className="text-muted-foreground">Bienvenido a tu panel personal de Kraft Training</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Rutina de Hoy</CardTitle>
                <CardDescription>Ejercicios programados para hoy</CardDescription>
              </div>
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : todaySchedule?.exercises.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No tienes ejercicios programados para hoy</p>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} series x {exercise.reps} repeticiones
                        </p>
                      </div>
                      <Button 
                        variant={exercise.completed ? "default" : "outline"}
                        className={`${exercise.completed ? "bg-green-500 hover:bg-green-600" : ""}`}
                        size="sm"
                        onClick={() => handleExerciseToggle(exercise.id, exercise.completed)}
                        disabled={isTogglingExercise}
                      >
                        {exercise.completed ? "Completado" : "Marcar"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/cliente/rutina">Ver rutina completa</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Dieta de Hoy</CardTitle>
                <CardDescription>Comidas programadas para hoy</CardDescription>
              </div>
              <Utensils className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : todaySchedule?.meals.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No tienes comidas programadas para hoy</p>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.meals.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{meal.mealType}</p>
                        <p className="text-sm text-muted-foreground">
                          {meal.foodName}
                        </p>
                      </div>
                      <Button 
                        variant={meal.completed ? "default" : "outline"}
                        className={`${meal.completed ? "bg-green-500 hover:bg-green-600" : ""}`}
                        size="sm"
                        onClick={() => handleMealToggle(meal.id, meal.completed)}
                        disabled={isTogglingMeal}
                      >
                        {meal.completed ? "Completado" : "Marcar"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/cliente/dieta">Ver dieta completa</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Próximas Citas</CardTitle>
                <CardDescription>Todas tus citas programadas</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !groupedAppointments || Object.keys(groupedAppointments).length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No tienes citas programadas próximamente</p>
              ) : (
                <div className="space-y-5">
                  {Object.entries(groupedAppointments).map(([dateGroup, appointments]) => (
                    <div key={dateGroup} className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground capitalize">{dateGroup}</h3>
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="border-b pb-2">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{appointment.title}</p>
                            <Badge variant={getBadgeVariant(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appointment.time} ({appointment.duration} minutos)
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/cliente/citas">Ver todas las citas</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Mi Progreso</CardTitle>
                <CardDescription>Seguimiento de tus resultados</CardDescription>
              </div>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : !progressSummary ? (
                <p className="text-center py-4 text-muted-foreground">No hay datos de progreso disponibles</p>
              ) : (
                <div className="space-y-3">
                  {progressSummary.currentWeight !== null && (
                    <div className="flex justify-between border-b pb-2">
                      <p className="font-medium">Peso actual:</p>
                      <div className="flex items-center">
                        <p>{progressSummary.currentWeight} kg</p>
                        {progressSummary.weightChange !== null && (
                          <span className={`ml-2 text-xs flex items-center ${progressSummary.weightChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {progressSummary.weightChange < 0 ? '' : '+'}
                            {progressSummary.weightChange.toFixed(1)} kg
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {progressSummary.muscleMassChange !== null && (
                    <div className="flex justify-between border-b pb-2">
                      <p className="font-medium">Masa muscular:</p>
                      <div className="flex items-center">
                        <p>-</p>
                        <span className={`ml-2 text-xs flex items-center ${progressSummary.muscleMassChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {progressSummary.muscleMassChange > 0 ? '+' : ''}
                          {progressSummary.muscleMassChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                  {progressSummary.bodyFatChange !== null && (
                    <div className="flex justify-between border-b pb-2">
                      <p className="font-medium">Grasa corporal:</p>
                      <div className="flex items-center">
                        <p>-</p>
                        <span className={`ml-2 text-xs flex items-center ${progressSummary.bodyFatChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {progressSummary.bodyFatChange < 0 ? '' : '+'}
                          {progressSummary.bodyFatChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                  {!progressSummary.currentWeight && !progressSummary.muscleMassChange && !progressSummary.bodyFatChange && (
                    <p className="text-center py-4 text-muted-foreground">No hay mediciones registradas</p>
                  )}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/cliente/progreso">Ver progreso completo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
