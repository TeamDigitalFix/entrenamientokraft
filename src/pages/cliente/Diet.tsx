
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { useClientDiet } from "@/hooks/cliente/useClientDiet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ClientDiet = () => {
  const { diet, isLoading, activeDay, setActiveDay, dayNames } = useClientDiet();

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mi Dieta</h1>
        <p className="text-muted-foreground">Aquí puedes ver y seguir tu plan de alimentación personalizado</p>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{diet?.name || "Plan Alimenticio"}</CardTitle>
              <CardDescription>Tu plan de alimentación personalizado</CardDescription>
            </div>
            <Utensils className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Cargando plan alimenticio...</span>
              </div>
            ) : !diet || diet.meals.length === 0 ? (
              <div className="text-center py-8">
                <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Estamos preparando tu plan de alimentación personalizado. Tu entrenador estará actualizándolo pronto.
                </p>
              </div>
            ) : (
              <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
                <TabsList className="w-full mb-4 flex overflow-x-auto">
                  {dayNames.map(day => (
                    <TabsTrigger
                      key={day}
                      value={day}
                      className="flex-1"
                      disabled={!diet.mealsByDay[day]?.length}
                    >
                      {day}
                      {diet.mealsByDay[day]?.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {diet.mealsByDay[day].length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {dayNames.map(day => (
                  <TabsContent key={day} value={day} className="space-y-4">
                    {diet.mealsByDay[day]?.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {diet.mealsByDay[day].map((meal) => (
                          <AccordionItem key={meal.id} value={meal.id}>
                            <AccordionTrigger className="hover:no-underline py-3 px-4 data-[state=open]:bg-accent/50 rounded-t-md">
                              <div className="flex justify-between w-full items-center">
                                <div className="flex items-center">
                                  <span className="font-medium">{meal.mealType}</span>
                                  <span className="ml-2 text-sm text-muted-foreground">
                                    {meal.foodName}
                                  </span>
                                </div>
                                <Badge>{meal.calories} kcal</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-accent/20 rounded-b-md px-4 pb-4 pt-2">
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Alimento</h4>
                                    <div className="flex flex-col">
                                      <span className="text-sm">
                                        {meal.foodName} ({meal.foodCategory})
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {meal.quantity}g
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Macronutrientes</h4>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge variant="outline">
                                        P: {meal.protein}g
                                      </Badge>
                                      <Badge variant="outline">
                                        C: {meal.carbs}g
                                      </Badge>
                                      <Badge variant="outline">
                                        G: {meal.fat}g
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-8">
                        <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No hay comidas programadas para {day}</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDiet;
