
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export type ClientMeal = {
  id: string;
  foodName: string;
  foodCategory: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  mealType: string;
  date: string; // YYYY-MM-DD format or day of week (1-7)
  completed?: boolean;
  imageUrl?: string | null;
};

export type ClientDiet = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  meals: ClientMeal[];
};

export interface ClientDietHook {
  diet: ClientDiet & { mealsByDay: { [key: string]: ClientMeal[] } } | null;
  isLoading: boolean;
  activeDay: string;
  setActiveDay: (day: string) => void;
  availableDays: string[];
  clientId: string; // Add clientId to the return interface
}

// Mapeo de día numérico a nombre del día
const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Determinar el día de la semana a partir de la fecha o número de día
const getDayFromDateOrNumber = (dateOrDay: string): string => {
  // Si es un número del 1-7, convertirlo a nombre del día
  if (/^[1-7]$/.test(dateOrDay)) {
    return dayNames[parseInt(dateOrDay) - 1];
  }
  
  // Si es una fecha en formato YYYY-MM-DD, obtener el día de la semana
  try {
    if (dateOrDay.includes("-")) {
      const dayNumber = parseInt(format(parseISO(dateOrDay), "i", { locale: es })) - 1;
      return dayNames[dayNumber];
    }
  } catch (error) {
    console.error("Error parsing date:", error);
  }
  
  return "Desconocido";
};

export const useClientDiet = (): ClientDietHook => {
  const { user } = useAuth();
  const clientId = user?.id || "dbd137fd-96c9-4243-9daf-29d6cff0fdbc"; // Provide a default ID for testing
  const [activeDay, setActiveDay] = useState<string>("Lunes");

  const { data: diet, isLoading } = useQuery({
    queryKey: ["client-diet", clientId],
    queryFn: async () => {
      try {
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
            dia,
            cantidad,
            dieta_id,
            alimento_id,
            alimentos:alimento_id (
              nombre,
              categoria,
              calorias,
              proteinas,
              carbohidratos,
              grasas,
              imagen_url
            )
          `)
          .eq("dieta_id", dietData.id);

        if (mealsError) throw mealsError;

        // Get completed meals for the client
        const { data: completedMeals, error: completedError } = await supabase
          .from("comidas_completadas")
          .select("dieta_comida_id")
          .eq("cliente_id", clientId);

        if (completedError) throw completedError;

        // Create a set of completed meal IDs for faster lookup
        const completedMealIds = new Set(completedMeals?.map(meal => meal.dieta_comida_id) || []);

        // Format meals by date
        const transformedMeals: ClientMeal[] = meals?.map(meal => ({
          id: meal.id,
          foodName: meal.alimentos?.nombre || "Alimento sin nombre",
          foodCategory: meal.alimentos?.categoria || "Sin categoría",
          calories: Math.round((meal.alimentos?.calorias || 0) * meal.cantidad / 100),
          protein: Math.round((meal.alimentos?.proteinas || 0) * meal.cantidad / 100),
          carbs: Math.round((meal.alimentos?.carbohidratos || 0) * meal.cantidad / 100),
          fat: Math.round((meal.alimentos?.grasas || 0) * meal.cantidad / 100),
          quantity: meal.cantidad,
          mealType: meal.tipo_comida,
          date: meal.dia || "1", // Si no tiene día, asignamos "1" (Lunes)
          completed: completedMealIds.has(meal.id),
          imageUrl: meal.alimentos?.imagen_url
        }));

        // Group meals by day of week
        const mealsByDay: { [key: string]: ClientMeal[] } = {};
        
        // Inicializar todos los días de la semana
        dayNames.forEach(day => {
          mealsByDay[day] = [];
        });
        
        // Agrupar comidas por día
        transformedMeals.forEach(meal => {
          const dayName = getDayFromDateOrNumber(meal.date);
          if (!mealsByDay[dayName]) {
            mealsByDay[dayName] = [];
          }
          mealsByDay[dayName].push(meal);
        });

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
    enabled: true // Always enabled to simplify the approach
  });

  // Todos los días de la semana siempre deben estar disponibles
  const availableDays = dayNames;

  return {
    diet,
    isLoading,
    activeDay,
    setActiveDay,
    availableDays,
    clientId // Return the clientId for use in components
  };
};
