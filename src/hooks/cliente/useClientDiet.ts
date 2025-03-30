
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
  date: string; // Changed from day (number) to date (string)
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
  diet: ClientDiet & { mealsByDate: { [key: string]: ClientMeal[] } } | null;
  isLoading: boolean;
  activeDate: string;
  setActiveDate: (date: string) => void;
  availableDates: string[];
}

export const useClientDiet = (): ClientDietHook => {
  const { user } = useAuth();
  const clientId = user?.id;
  const [activeDate, setActiveDate] = useState<string>("");

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

        // Format meals by day and convert day number to formatted date
        const transformedMeals = meals?.map(meal => ({
          id: meal.id,
          foodName: meal.alimentos?.nombre || "Alimento sin nombre",
          foodCategory: meal.alimentos?.categoria || "Sin categoría",
          calories: Math.round((meal.alimentos?.calorias || 0) * meal.cantidad / 100),
          protein: Math.round((meal.alimentos?.proteinas || 0) * meal.cantidad / 100),
          carbs: Math.round((meal.alimentos?.carbohidratos || 0) * meal.cantidad / 100),
          fat: Math.round((meal.alimentos?.grasas || 0) * meal.cantidad / 100),
          quantity: meal.cantidad,
          mealType: meal.tipo_comida,
          date: meal.dia, // We'll continue using the dia field for backward compatibility 
          imageUrl: meal.alimentos?.imagen_url
        })) as ClientMeal[];

        // Group meals by formatted date
        const mealsByDate: { [key: string]: ClientMeal[] } = {};
        const uniqueDates = [...new Set(transformedMeals.map(meal => meal.date.toString()))].sort();
        
        uniqueDates.forEach(date => {
          mealsByDate[date] = transformedMeals.filter(
            meal => meal.date.toString() === date
          );
        });

        // Set initial active date if not set already
        if (!activeDate && uniqueDates.length > 0) {
          setActiveDate(uniqueDates[0]);
        }

        return {
          id: dietData.id,
          name: dietData.nombre,
          description: dietData.descripcion,
          startDate: new Date(dietData.fecha_inicio),
          endDate: dietData.fecha_fin ? new Date(dietData.fecha_fin) : null,
          meals: transformedMeals,
          mealsByDate,
        };
      } catch (error) {
        console.error("Error fetching diet:", error);
        toast.error("No se pudo cargar la dieta");
        return null;
      }
    },
    enabled: !!clientId
  });

  const availableDates = diet ? Object.keys(diet.mealsByDate).sort() : [];

  return {
    diet,
    isLoading,
    activeDate: activeDate || (availableDates.length > 0 ? availableDates[0] : ""),
    setActiveDate,
    availableDates
  };
};
