
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Loader2 } from "lucide-react";
import { UserRole } from "@/types/index";
import { useClientDiet } from "@/hooks/cliente/useClientDiet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useMealToggle } from "@/hooks/cliente/useMealToggle";

const ClientDiet = () => {
  const { diet, isLoading, activeDay, setActiveDay, availableDays } = useClientDiet();
  const { toggleMealCompletion, isToggling } = useMealToggle();

  // Group meals by type for the active day
  const getMealsByType = (day: string) => {
    if (!diet?.mealsByDay[day]) return {};
    
    const mealsByType: Record<string, typeof diet.mealsByDay[string]> = {};
    
    diet.mealsByDay[day].forEach(meal => {
      if (!mealsByType[meal.mealType]) {
        mealsByType[meal.mealType] = [];
      }
      mealsByType[meal.mealType].push(meal);
    });
    
    return mealsByType;
  };

  // Calculate total macros for a meal type
  const calculateMealTypeMacros = (meals: typeof diet.mealsByDay[string]) => {
    return meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  // Handler para marcar/desmarcar comidas
  const handleToggleMeal = (mealId: string, isCompleted: boolean) => {
    toggleMealCompletion({
      mealId,
      completed: isCompleted
    });
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mi Dieta</h1>
        <p className="text-muted-foreground">Aquí puedes ver y seguir tu plan de alimentación personalizado</p>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{diet?.name || "Plan alimenticio personalizado"}</CardTitle>
              <CardDescription>Tu plan de alimentación personalizado</CardDescription>
            </div>
            <Utensils className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Cargando dieta...</span>
              </div>
            ) : !diet || diet.meals.length === 0 ? (
              <div className="text-center py-8">
                <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Estamos preparando tu plan de alimentación personalizado. Tu entrenador estará actualizándolo pronto.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
                  <TabsList className="w-full grid grid-cols-7 mb-4">
                    {availableDays.map(day => (
                      <TabsTrigger 
                        key={day} 
                        value={day}
                        className="text-xs sm:text-sm"
                      >
                        {day}
                        {diet.mealsByDay[day]?.length > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1.5 min-w-5 h-5 text-xs hidden sm:flex items-center justify-center">
                            {diet.mealsByDay[day].length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {availableDays.map(day => (
                    <TabsContent key={day} value={day} className="space-y-6">
                      {diet.mealsByDay[day]?.length > 0 ? (
                        <div className="space-y-6">
                          {Object.entries(getMealsByType(day)).map(([mealType, meals]) => (
                            <div key={mealType} className="border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-medium">{mealType}</h3>
                                <Badge>
                                  {calculateMealTypeMacros(meals).calories} kcal
                                </Badge>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="text-sm font-medium mb-2">Macronutrientes:</h4>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="p-2 bg-accent/30 rounded-md text-center">
                                    <div className="font-medium">Proteínas</div>
                                    <div className="mt-1">{calculateMealTypeMacros(meals).protein}g</div>
                                  </div>
                                  <div className="p-2 bg-accent/30 rounded-md text-center">
                                    <div className="font-medium">Carbohidratos</div>
                                    <div className="mt-1">{calculateMealTypeMacros(meals).carbs}g</div>
                                  </div>
                                  <div className="p-2 bg-accent/30 rounded-md text-center">
                                    <div className="font-medium">Grasas</div>
                                    <div className="mt-1">{calculateMealTypeMacros(meals).fat}g</div>
                                  </div>
                                </div>
                              </div>
                              
                              <Separator className="my-3" />
                              
                              <h4 className="text-sm font-medium mb-2">Alimentos:</h4>
                              <div className="space-y-3">
                                {meals.map(meal => (
                                  <div key={meal.id} className="flex items-start justify-between border-b pb-3">
                                    <div className="flex items-start space-x-3 w-full">
                                      <Checkbox 
                                        id={meal.id} 
                                        checked={meal.completed}
                                        disabled={isToggling}
                                        onCheckedChange={(checked) => {
                                          handleToggleMeal(meal.id, !!meal.completed);
                                        }}
                                      />
                                      
                                      {meal.imageUrl && (
                                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden mr-2">
                                          <img 
                                            src={meal.imageUrl} 
                                            alt={meal.foodName}
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.src = "/placeholder.svg";
                                            }}
                                          />
                                        </div>
                                      )}
                                      
                                      <div className="flex-1">
                                        <label 
                                          htmlFor={meal.id} 
                                          className="text-sm font-medium cursor-pointer"
                                        >
                                          {meal.foodName}
                                        </label>
                                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                                          <Badge 
                                            variant="outline" 
                                            className="text-xs h-5 mr-2"
                                          >
                                            {meal.foodCategory}
                                          </Badge>
                                          <span>{meal.quantity}g</span>
                                        </div>
                                      </div>
                                      
                                      <div className="text-sm font-medium whitespace-nowrap">
                                        {meal.calories} kcal
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No hay comidas programadas para {day}</p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDiet;
