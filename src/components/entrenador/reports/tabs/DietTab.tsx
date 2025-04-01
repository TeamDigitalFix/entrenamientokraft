
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, AlertCircle } from "lucide-react";
import DietCard from "@/components/cliente/diet/DietCard";
import { useClientDiet } from "@/hooks/cliente/useClientDiet";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface DietTabProps {
  clientId: string;
}

const DietTab: React.FC<DietTabProps> = ({ clientId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [diet, setDiet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>('Lunes');
  const [availableDays] = useState<string[]>(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
  
  // This is the hook approach that wasn't working consistently
  const dietHook = useClientDiet(clientId);
  
  // Direct Supabase fetching to ensure we get data
  useEffect(() => {
    const fetchDietData = async () => {
      if (!clientId) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching diet data directly from Supabase for client:", clientId);
        
        // Get active diet
        const { data: dietData, error: dietError } = await supabase
          .from("dietas")
          .select("*")
          .eq("cliente_id", clientId)
          .is("fecha_fin", null)
          .single();
        
        if (dietError) {
          if (dietError.code === 'PGRST116') {
            console.log("No active diet found for client.");
            setDiet(null);
            setIsLoading(false);
            return;
          }
          throw dietError;
        }
        
        if (!dietData) {
          console.log("No diet data found.");
          setDiet(null);
          setIsLoading(false);
          return;
        }
        
        console.log("Diet found:", dietData);
        
        // Get diet meals
        const { data: mealsData, error: mealsError } = await supabase
          .from("dieta_comidas")
          .select(`
            id, 
            tipo_comida, 
            cantidad, 
            dia, 
            alimento_id, 
            dieta_id,
            alimentos:alimento_id (
              id,
              nombre,
              calorias,
              proteinas,
              carbohidratos,
              grasas,
              categoria,
              imagen_url
            )
          `)
          .eq("dieta_id", dietData.id);
        
        if (mealsError) {
          throw mealsError;
        }
        
        console.log("Meals data fetched:", mealsData);
        
        // Get completed meals for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: completedMeals, error: completedError } = await supabase
          .from("comidas_completadas")
          .select("dieta_comida_id")
          .eq("cliente_id", clientId)
          .gte("fecha_completado", today.toISOString());
        
        if (completedError) {
          console.error("Error fetching completed meals:", completedError);
        }
        
        console.log("Completed meals:", completedMeals);
        
        // Create a map of completed meals
        const completedMealsMap = new Map();
        completedMeals?.forEach(item => {
          completedMealsMap.set(item.dieta_comida_id, true);
        });
        
        // Process the data to match the expected format
        const mealsByDay: Record<string, any[]> = {};
        
        // Initialize empty arrays for each day of the week
        availableDays.forEach(day => {
          mealsByDay[day] = [];
        });
        
        // Process each meal
        mealsData?.forEach((meal: any) => {
          if (!meal.alimentos) return;
          
          // Determine which day this meal belongs to
          let day: string;
          
          if (meal.dia) {
            // Handle numeric day format (1-7 for Monday-Sunday)
            if (/^[1-7]$/.test(meal.dia)) {
              const dayIndex = parseInt(meal.dia) - 1;
              day = availableDays[dayIndex];
            } 
            // Handle date format (YYYY-MM-DD)
            else if (meal.dia.includes('-')) {
              try {
                // Format the day directly
                day = meal.dia;
              } catch (error) {
                console.error("Error parsing date:", meal.dia, error);
                return;
              }
            } else {
              // Default case, use the raw day value
              day = meal.dia;
            }
            
            // Create the meal object
            const mealObj = {
              id: meal.id,
              foodName: meal.alimentos.nombre,
              foodCategory: meal.alimentos.categoria,
              quantity: meal.cantidad,
              calories: Math.round((meal.alimentos.calorias * meal.cantidad) / 100),
              protein: Math.round((meal.alimentos.proteinas * meal.cantidad) / 100),
              carbs: Math.round((meal.alimentos.carbohidratos * meal.cantidad) / 100),
              fat: Math.round((meal.alimentos.grasas * meal.cantidad) / 100),
              imageUrl: meal.alimentos.imagen_url,
              mealType: meal.tipo_comida,
              completed: completedMealsMap.has(meal.id)
            };
            
            // Add to the correct day
            if (mealsByDay[day]) {
              mealsByDay[day].push(mealObj);
            } else {
              // If the day doesn't exist in our structure (like a date), create it
              mealsByDay[day] = [mealObj];
            }
          }
        });
        
        // Log the processed data
        console.log("Processed mealsByDay:", mealsByDay);
        
        // Check if there are any meals in any day
        const hasMeals = Object.values(mealsByDay).some(
          dayMeals => dayMeals && dayMeals.length > 0
        );
        
        if (!hasMeals) {
          console.log("No meals found in any day.");
        }
        
        // Combine all the data
        const processedDiet = {
          id: dietData.id,
          name: dietData.nombre,
          description: dietData.descripcion,
          startDate: dietData.fecha_inicio,
          endDate: dietData.fecha_fin,
          mealsByDay
        };
        
        console.log("Final processed diet:", processedDiet);
        setDiet(processedDiet);
      } catch (error: any) {
        console.error("Error fetching diet data:", error);
        setError(`Error al cargar la dieta: ${error.message}`);
        toast.error("Error al cargar la dieta del cliente");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDietData();
  }, [clientId, availableDays]);
  
  // If hook data is available and our direct fetch isn't, use the hook data
  useEffect(() => {
    if (!diet && dietHook.diet && !isLoading) {
      console.log("Using diet data from hook as fallback:", dietHook.diet);
      setDiet(dietHook.diet);
    }
  }, [diet, dietHook.diet, isLoading]);
  
  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500 space-x-2">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  if (!diet) {
    return (
      <div className="text-center py-8">
        <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay dieta asignada para este cliente</p>
      </div>
    );
  }

  // Check if mealsByDay exists and has any meals
  const hasMeals = diet.mealsByDay && 
    Object.values(diet.mealsByDay).some(meals => 
      Array.isArray(meals) && meals.length > 0
    );

  if (!hasMeals) {
    return (
      <div className="text-center py-8">
        <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">El cliente tiene una dieta asignada pero no hay comidas programadas</p>
      </div>
    );
  }

  // Create a wrapper object that matches the expected interface for DietCard
  const dietWithHookInterface = {
    diet,
    isLoading,
    activeDay,
    setActiveDay,
    availableDays,
    clientId,
    handleToggleMeal: () => {},
    isToggling: false
  };

  return <DietCard dietHook={dietWithHookInterface} />;
};

export default DietTab;
