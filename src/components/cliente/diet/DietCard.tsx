
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Loader2 } from "lucide-react";
import DietTabs from "./DietTabs";
import { ClientDietHook } from "@/hooks/cliente/useClientDiet";
import { useMealToggle } from "@/hooks/cliente/useMealToggle";

interface DietCardProps {
  dietHook: ClientDietHook;
}

const DietCard: React.FC<DietCardProps> = ({ dietHook }) => {
  const { diet, isLoading, activeDay, setActiveDay, availableDays, clientId } = dietHook;
  const { isToggling } = useMealToggle();

  return (
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
          <DietTabs
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            availableDays={availableDays}
            mealsByDay={diet.mealsByDay}
            isToggling={isToggling}
            clientId={clientId} // Pass the clientId
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DietCard;
