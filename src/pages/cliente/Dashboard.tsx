
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Utensils, Calendar, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ClientDashboard = () => {
  // Datos de ejemplo (en producción, vendrían de Supabase)
  const todayWorkout = [
    { id: 1, name: "Press de banca", sets: 4, reps: 10, completed: false },
    { id: 2, name: "Sentadillas", sets: 3, reps: 12, completed: true },
    { id: 3, name: "Peso muerto", sets: 3, reps: 8, completed: false },
  ];

  const todayDiet = [
    { id: 1, name: "Desayuno", items: ["Avena con frutas", "Claras de huevo"], completed: true },
    { id: 2, name: "Almuerzo", items: ["Pechuga de pollo", "Arroz integral", "Ensalada"], completed: false },
    { id: 3, name: "Cena", items: ["Salmón", "Vegetales al vapor"], completed: false },
  ];

  const toggleExerciseCompletion = (id: number) => {
    // En producción, se actualizaría en Supabase
    console.log(`Toggling exercise ${id}`);
  };

  const toggleMealCompletion = (id: number) => {
    // En producción, se actualizaría en Supabase
    console.log(`Toggling meal ${id}`);
  };

  return (
    <DashboardLayout allowedRoles={["cliente"]}>
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
              {todayWorkout.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No tienes ejercicios programados para hoy</p>
              ) : (
                <div className="space-y-3">
                  {todayWorkout.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} series x {exercise.reps} repeticiones
                        </p>
                      </div>
                      <Button 
                        variant={exercise.completed ? "default" : "outline"}
                        className={`${exercise.completed ? "bg-kraft-green" : ""}`}
                        size="sm"
                        onClick={() => toggleExerciseCompletion(exercise.id)}
                      >
                        {exercise.completed ? "Completado" : "Marcar"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline">
                Ver rutina completa
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
              {todayDiet.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No tienes comidas programadas para hoy</p>
              ) : (
                <div className="space-y-3">
                  {todayDiet.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {meal.items.join(", ")}
                        </p>
                      </div>
                      <Button 
                        variant={meal.completed ? "default" : "outline"}
                        className={`${meal.completed ? "bg-kraft-green" : ""}`}
                        size="sm"
                        onClick={() => toggleMealCompletion(meal.id)}
                      >
                        {meal.completed ? "Completado" : "Marcar"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline">
                Ver dieta completa
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
              <div className="space-y-3">
                <div className="border-b pb-2">
                  <p className="font-medium">Evaluación mensual</p>
                  <p className="text-sm text-muted-foreground">
                    Mañana - 15:00
                  </p>
                </div>
                <div className="border-b pb-2">
                  <p className="font-medium">Ajuste de dieta</p>
                  <p className="text-sm text-muted-foreground">
                    Viernes - 17:30
                  </p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Ver todas las citas
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
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <p className="font-medium">Peso actual:</p>
                  <p>75 kg</p>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <p className="font-medium">Masa muscular:</p>
                  <p>35%</p>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <p className="font-medium">Grasa corporal:</p>
                  <p>18%</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Ver progreso completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
