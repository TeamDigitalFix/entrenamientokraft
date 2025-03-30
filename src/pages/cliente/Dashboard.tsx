
import React, { useState } from "react";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ClientDashboard = () => {
  const { 
    todaySchedule, 
    progressSummary, 
    isLoading 
  } = useClientDashboard();

  // State for local meal completion (since we don't have a backend implementation yet)
  const [localMeals, setLocalMeals] = useState<Record<string, boolean>>({});

  const { toggleExerciseCompletion, isToggling } = useExerciseToggle();
  const { toggleMealCompletion } = useMealToggle();

  const handleExerciseToggle = (id: string, currentStatus: boolean) => {
    toggleExerciseCompletion({ exerciseId: id, completed: currentStatus });
  };

  const handleMealToggle = (id: string, currentStatus: boolean) => {
    // Update local state immediately for UI responsiveness
    setLocalMeals(prev => ({
      ...prev,
      [id]: !currentStatus
    }));
    
    // Call the backend mutation
    toggleMealCompletion({ mealId: id, completed: currentStatus });
  };

  // Function to determine if a meal is completed (using local state or original data)
  const isMealCompleted = (id: string, originalCompleted: boolean) => {
    return id in localMeals ? localMeals[id] : originalCompleted;
  };

  // Format appointment date for display
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    // Format day and time
    return format(date, "EEEE - HH:mm", { locale: es });
  };

  // Initialize empty data structures if data is not yet loaded
  const exercises = todaySchedule?.exercises || [];
  const meals = todaySchedule?.meals || [];
  const appointments = todaySchedule?.appointments || [];

  // Transform progressSummary into progressData with proper null checks
  const progressData = progressSummary ? {
    weight: progressSummary.currentWeight || null,
    weightChange: progressSummary.weightChange || null,
    bodyFat: null,
    bodyFatChange: progressSummary.bodyFatChange || null,
    muscleMass: null,
    muscleMassChange: progressSummary.muscleMassChange || null
  } : null;

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mi Panel</h1>
        <p className="text-muted-foreground">Bienvenido a tu panel personal de Kraft Training</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Rutina de hoy */}
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
              ) : exercises.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No tienes ejercicios programados para hoy</p>
              ) : (
                <div className="space-y-3">
                  {exercises.map((exercise) => (
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
                        disabled={isToggling}
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
          
          {/* Dieta de hoy */}
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
              ) : meals.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No tienes comidas programadas para hoy</p>
              ) : (
                <div className="space-y-3">
                  {meals.map((meal) => {
                    const isCompleted = isMealCompleted(meal.id, meal.completed);
                    return (
                      <div key={meal.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{meal.mealType}</p>
                          <p className="text-sm text-muted-foreground">
                            {meal.foodName}
                          </p>
                        </div>
                        <Button 
                          variant={isCompleted ? "default" : "outline"}
                          className={`${isCompleted ? "bg-green-500 hover:bg-green-600" : ""}`}
                          size="sm"
                          onClick={() => handleMealToggle(meal.id, isCompleted)}
                        >
                          {isCompleted ? "Completado" : "Marcar"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/cliente/dieta">Ver dieta completa</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Próximas citas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Próximas Citas</CardTitle>
                <CardDescription>Tus próximas citas programadas</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No tienes citas programadas próximamente</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border-b pb-2">
                      <p className="font-medium">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time} ({appointment.duration} minutos)
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link to="/cliente/citas">Ver todas las citas</Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Mi progreso */}
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
              ) : !progressData ? (
                <p className="text-center py-4 text-muted-foreground">No hay datos de progreso disponibles</p>
              ) : (
                <div className="space-y-3">
                  {progressData.weight !== null && (
                    <div className="flex justify-between border-b pb-2">
                      <p className="font-medium">Peso actual:</p>
                      <div className="flex items-center">
                        <p>{progressData.weight} kg</p>
                        {progressData.weightChange !== null && (
                          <span className={`ml-2 text-xs flex items-center ${progressData.weightChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {progressData.weightChange < 0 ? '' : '+'}
                            {progressData.weightChange.toFixed(1)} kg
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {progressData.muscleMass !== null && (
                    <div className="flex justify-between border-b pb-2">
                      <p className="font-medium">Masa muscular:</p>
                      <div className="flex items-center">
                        <p>{progressData.muscleMass}%</p>
                        {progressData.muscleMassChange !== null && (
                          <span className={`ml-2 text-xs flex items-center ${progressData.muscleMassChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {progressData.muscleMassChange > 0 ? '+' : ''}
                            {progressData.muscleMassChange.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {progressData.bodyFat !== null && (
                    <div className="flex justify-between border-b pb-2">
                      <p className="font-medium">Grasa corporal:</p>
                      <div className="flex items-center">
                        <p>{progressData.bodyFat}%</p>
                        {progressData.bodyFatChange !== null && (
                          <span className={`ml-2 text-xs flex items-center ${progressData.bodyFatChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {progressData.bodyFatChange < 0 ? '' : '+'}
                            {progressData.bodyFatChange.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {!progressData.weight && !progressData.muscleMass && !progressData.bodyFat && (
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
