
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export type ClientDietMeal = {
  id: string;
  mealType: string;
  foodName: string;
  foodCategory: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  day: number;
};

export type ClientDiet = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  meals: ClientDietMeal[];
};

type MealsByDay = {
  [key: string]: ClientDietMeal[];
};

const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Orden para tipos de comida
const mealTypeOrder = {
  "Desayuno": 1,
  "Media mañana": 2,
  "Almuerzo": 3,
  "Merienda": 4,
  "Cena": 5,
  "Pre-entrenamiento": 6,
  "Post-entrenamiento": 7
};

export const useClientDiet = () => {
  const { user } = useAuth();
  const clientId = user?.id;
  const [activeDay, setActiveDay] = useState<string>("Lunes");

  const { data: diet, isLoading } = useQuery({
    queryKey: ["client-diet", clientId],
    queryFn: async () => {
      try {
        if (!clientId) throw new Error("No hay usuario autenticado");

        // Get active diet
        const { data: diets, error: dietError } = await supabase
          .from("dietas")
          .select("*")
          .eq("cliente_id", clientId)
          .lte("fecha_inicio", new Date().toISOString())
          .order("fecha_inicio", { ascending: false })
          .limit(1);

        if (dietError) throw dietError;
        
        if (!diets || diets.length === 0) {
          return null;
        }

        const dietData = diets[0];

        // Get meals for the diet
        const { data: meals, error: mealsError } = await supabase
          .from("dieta_comidas")
          .select(`
            id,
            tipo_comida,
            cantidad,
            dia,
            alimento_id,
            dieta_id,
            alimentos:alimento_id (
              nombre,
              categoria,
              calorias,
              proteinas,
              carbohidratos,
              grasas
            )
          `)
          .eq("dieta_id", dietData.id);

        if (mealsError) throw mealsError;

        // Format meals
        const transformedMeals = meals?.map(meal => ({
          id: meal.id,
          mealType: meal.tipo_comida,
          foodName: meal.alimentos?.nombre || "Alimento sin nombre",
          foodCategory: meal.alimentos?.categoria || "Sin categoría",
          quantity: meal.cantidad,
          calories: Math.round((meal.alimentos?.calorias * meal.cantidad) / 100),
          protein: Math.round((meal.alimentos?.proteinas * meal.cantidad) / 100),
          carbs: Math.round((meal.alimentos?.carbohidratos * meal.cantidad) / 100),
          fat: Math.round((meal.alimentos?.grasas * meal.cantidad) / 100),
          day: meal.dia
        })) as ClientDietMeal[];

        // Group meals by day
        const mealsByDay: MealsByDay = {};
        dayNames.forEach((day, index) => {
          const mealsForDay = transformedMeals.filter(
            meal => meal.day === index + 1
          );
          
          // Sort meals by type using the order defined above
          mealsByDay[day] = mealsForDay.sort((a, b) => {
            const orderA = mealTypeOrder[a.mealType as keyof typeof mealTypeOrder] || 99;
            const orderB = mealTypeOrder[b.mealType as keyof typeof mealTypeOrder] || 99;
            return orderA - orderB;
          });
        });

        // Find the first day with meals
        if (!mealsByDay[activeDay]?.length) {
          const firstDayWithMeals = dayNames.find(day => mealsByDay[day]?.length > 0);
          if (firstDayWithMeals) {
            setActiveDay(firstDayWithMeals);
          }
        }

        return {
          id: dietData.id,
          name: dietData.nombre,
          description: dietData.descripcion,
          startDate: new Date(dietData.fecha_inicio),
          endDate: dietData.fecha_fin ? new Date(dietData.fecha_fin) : null,
          meals: transformedMeals,
          mealsByDay,
        };
      } catch (error) {
        console.error("Error fetching diet:", error);
        toast.error("No se pudo cargar la dieta");
        return null;
      }
    },
    enabled: !!clientId
  });

  return {
    diet,
    isLoading,
    activeDay,
    setActiveDay,
    dayNames
  };
};
