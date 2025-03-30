
import React from "react";
import { Utensils } from "lucide-react";
import { ClientMeal } from "@/hooks/cliente/useClientDiet";
import MealTypeCard from "./MealTypeCard";

interface DietDayContentProps {
  meals: ClientMeal[];
  isToggling: boolean;
  clientId: string; // Add clientId prop
}

// Group meals by type
const getMealsByType = (meals: ClientMeal[]) => {
  if (!meals) return {};
  
  const mealsByType: Record<string, ClientMeal[]> = {};
  
  meals.forEach(meal => {
    if (!mealsByType[meal.mealType]) {
      mealsByType[meal.mealType] = [];
    }
    mealsByType[meal.mealType].push(meal);
  });
  
  return mealsByType;
};

const DietDayContent: React.FC<DietDayContentProps> = ({ meals, isToggling, clientId }) => {
  const mealsByType = getMealsByType(meals);
  
  if (!meals || meals.length === 0) {
    return (
      <div className="text-center py-8">
        <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay comidas programadas para este día</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(mealsByType).map(([mealType, mealsList]) => (
        <MealTypeCard 
          key={mealType} 
          mealType={mealType} 
          meals={mealsList} 
          isToggling={isToggling} 
          clientId={clientId} // Pass the clientId
        />
      ))}
    </div>
  );
};

export default DietDayContent;
