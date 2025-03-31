
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ClientMeal } from "@/hooks/cliente/useClientDiet";
import { useMealToggle } from "@/hooks/cliente/useMealToggle";

type MealTypeMacros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

interface MealTypeCardProps {
  mealType: string;
  meals: ClientMeal[];
  isToggling: boolean;
  clientId: string; // Add clientId prop
}

// Calculate total macros for a meal type
const calculateMealTypeMacros = (meals: ClientMeal[]): MealTypeMacros => {
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

// Check if all meals in a meal type are completed
const areMealsCompleted = (meals: ClientMeal[]): boolean => {
  if (!meals.length) return false;
  return meals.every(meal => meal.completed);
};

const MealTypeCard: React.FC<MealTypeCardProps> = ({ mealType, meals, isToggling, clientId }) => {
  const { toggleMealCompletion } = useMealToggle();
  const isCompleted = areMealsCompleted(meals);
  const macros = calculateMealTypeMacros(meals);
  
  // Handler for marking/unmarking a meal type as complete
  const handleToggleMealType = () => {
    const mealIds = meals.map(meal => meal.id);
    toggleMealCompletion({
      dietMealIds: mealIds,
      completed: !isCompleted,
      clientId // Pass the clientId
    });
  };
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className={`${isCompleted ? 'bg-green-100 hover:bg-green-200' : 'bg-muted hover:bg-muted/80'} h-8 px-2 gap-1`}
            disabled={isToggling}
            onClick={handleToggleMealType}
          >
            {isCompleted ? (
              <>
                <Check className="h-4 w-4" />
                <span>Completado</span>
              </>
            ) : (
              'Marcar como completado'
            )}
          </Button>
          <h3 className="text-lg font-medium">{mealType}</h3>
        </div>
        <Badge>
          {macros.calories} kcal
        </Badge>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Macronutrientes:</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="p-2 bg-accent/30 rounded-md text-center">
            <div className="font-medium">Proteínas</div>
            <div className="mt-1">{macros.protein}g</div>
          </div>
          <div className="p-2 bg-accent/30 rounded-md text-center">
            <div className="font-medium">Carbohidratos</div>
            <div className="mt-1">{macros.carbs}g</div>
          </div>
          <div className="p-2 bg-accent/30 rounded-md text-center">
            <div className="font-medium">Grasas</div>
            <div className="mt-1">{macros.fat}g</div>
          </div>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      <h4 className="text-sm font-medium mb-2">Alimentos:</h4>
      <div className="space-y-3">
        {meals.map(meal => (
          <div key={meal.id} className="flex items-start justify-between border-b pb-3">
            <div className="flex items-start space-x-3 w-full">                                        
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
                <div className="text-sm font-medium">
                  {meal.foodName}
                </div>
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
  );
};

export default MealTypeCard;
