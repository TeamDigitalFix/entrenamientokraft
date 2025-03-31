
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useMealToggle } from "./useMealToggle";

export type FoodItem = {
  id: string;
  name: string;
  dietMealId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  imageUrl?: string;
  category: string;
};

export type ClientMeal = {
  id: string;
  foodName: string;
  foodCategory: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  mealType: string;
  completed: boolean;
};

export type Meal = {
  id: string;
  type: string;
  foods: FoodItem[];
  completed: boolean;
};

export type DietDay = {
  name: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

export type ClientDiet = {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  days: DietDay[];
  meals: ClientMeal[];
  mealsByDay: Record<string, ClientMeal[]>;
};

export type ClientDietHook = {
  diet: ClientDiet | null;
  isLoading: boolean;
  activeDay: string;
  setActiveDay: (day: string) => void;
  availableDays: string[];
  handleToggleMeal: (mealId: string, foods: FoodItem[], isCompleted: boolean) => Promise<void>;
  isToggling: boolean;
  clientId?: string;
};

export const useClientDiet = (clientId?: string) => {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState<string>('Lunes');
  const [availableDays] = useState<string[]>(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
  const { toggleMealCompletion, isToggling } = useMealToggle();

  const { data: diet, isLoading, refetch } = useQuery({
    queryKey: ['clientDiet', clientId || user?.id],
    queryFn: async () => {
      try {
        const targetUserId = clientId || user?.id;
        
        if (!targetUserId) return null;

        const { data: dieta, error: dietaError } = await supabase
          .from('dietas')
          .select(`
            id, 
            nombre, 
            descripcion, 
            fecha_inicio, 
            fecha_fin
          `)
          .eq('cliente_id', targetUserId)
          .is('fecha_fin', null)
          .single();

        if (dietaError) {
          if (dietaError.code === 'PGRST116') {
            console.log("No se encontró una dieta activa para el cliente.");
            return null;
          }
          throw dietaError;
        }

        if (!dieta) return null;

        const { data: comidas, error: comidasError } = await supabase
          .from('dieta_comidas')
          .select(`
            id, 
            tipo_comida, 
            cantidad,
            dia,
            alimento_id,
            alimentos (
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
          .eq('dieta_id', dieta.id);

        if (comidasError) {
          throw comidasError;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: completadas, error: completadasError } = await supabase
          .from('comidas_completadas')
          .select('dieta_comida_id')
          .eq('cliente_id', targetUserId)
          .gte('fecha_completado', today.toISOString());

        if (completadasError) {
          console.error("Error al obtener comidas completadas:", completadasError);
        }

        const completadasMap = new Map();
        completadas?.forEach(item => {
          completadasMap.set(item.dieta_comida_id, true);
        });

        const clientDiet: ClientDiet = {
          id: dieta.id,
          name: dieta.nombre,
          description: dieta.descripcion,
          startDate: dieta.fecha_inicio,
          endDate: dieta.fecha_fin,
          days: [],
          meals: [],
          mealsByDay: {}
        };

        const mealsByDay: Record<string, Record<string, Meal>> = {};

        availableDays.forEach(day => {
          mealsByDay[day] = {};
        });

        comidas?.forEach((comida: any) => {
          if (!comida.alimentos) return;
          
          const food: FoodItem = {
            id: comida.alimentos.id,
            name: comida.alimentos.nombre,
            dietMealId: comida.id,
            calories: comida.alimentos.calorias,
            protein: comida.alimentos.proteinas,
            carbs: comida.alimentos.carbohidratos,
            fat: comida.alimentos.grasas,
            quantity: comida.cantidad,
            imageUrl: comida.alimentos.imagen_url,
            category: comida.alimentos.categoria
          };
          
          if (comida.dia) {
            const day = comida.dia.charAt(0).toUpperCase() + comida.dia.slice(1).toLowerCase();
            
            if (!mealsByDay[day]) {
              mealsByDay[day] = {};
            }
            
            if (!mealsByDay[day][comida.tipo_comida]) {
              mealsByDay[day][comida.tipo_comida] = {
                id: comida.tipo_comida,
                type: comida.tipo_comida,
                foods: [],
                completed: false
              };
            }
            
            mealsByDay[day][comida.tipo_comida].foods.push(food);
            
            if (completadasMap.has(comida.id)) {
              mealsByDay[day][comida.tipo_comida].completed = true;
            }
          }
        });

        clientDiet.days = availableDays.map(day => {
          const meals = Object.values(mealsByDay[day] || {});
          
          let totalCalories = 0;
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;
          
          meals.forEach(meal => {
            meal.foods.forEach(food => {
              totalCalories += (food.calories * food.quantity) / 100;
              totalProtein += (food.protein * food.quantity) / 100;
              totalCarbs += (food.carbs * food.quantity) / 100;
              totalFat += (food.fat * food.quantity) / 100;
            });
          });
          
          return {
            name: day,
            meals: meals,
            totalCalories: Math.round(totalCalories),
            totalProtein: Math.round(totalProtein),
            totalCarbs: Math.round(totalCarbs),
            totalFat: Math.round(totalFat)
          };
        });

        // Convert the meals structure to ClientMeal[] format for mealsByDay
        const formattedMealsByDay: Record<string, ClientMeal[]> = {};
        
        Object.keys(mealsByDay).forEach(day => {
          formattedMealsByDay[day] = [];
          
          Object.values(mealsByDay[day]).forEach(meal => {
            // Calculate total nutrients for the meal
            let mealCalories = 0;
            let mealProtein = 0;
            let mealCarbs = 0;
            let mealFat = 0;
            
            meal.foods.forEach(food => {
              mealCalories += (food.calories * food.quantity) / 100;
              mealProtein += (food.protein * food.quantity) / 100;
              mealCarbs += (food.carbs * food.quantity) / 100;
              mealFat += (food.fat * food.quantity) / 100;
            });
            
            // For each food in the meal, create a ClientMeal entry
            meal.foods.forEach(food => {
              formattedMealsByDay[day].push({
                id: food.dietMealId,
                foodName: food.name,
                foodCategory: food.category,
                quantity: food.quantity,
                calories: Math.round((food.calories * food.quantity) / 100),
                protein: Math.round((food.protein * food.quantity) / 100),
                carbs: Math.round((food.carbs * food.quantity) / 100),
                fat: Math.round((food.fat * food.quantity) / 100),
                imageUrl: food.imageUrl,
                mealType: meal.type,
                completed: meal.completed
              });
            });
          });
        });
        
        clientDiet.mealsByDay = formattedMealsByDay;
        
        // Convert to a flat list of meals for the legacy format
        clientDiet.meals = Object.values(formattedMealsByDay).flat();

        return clientDiet;
      } catch (error) {
        console.error("Error al cargar la dieta:", error);
        toast.error("No se pudo cargar la dieta");
        return null;
      }
    },
    enabled: !!(clientId || user?.id),
  });

  const handleToggleMeal = async (mealId: string, foods: FoodItem[], isCompleted: boolean) => {
    try {
      if (!diet) return;
      
      const dietMealIds = foods.map(food => food.dietMealId);
      
      await toggleMealCompletion({
        dietMealIds, 
        completed: !isCompleted,
        clientId: clientId
      });
      
      await refetch();
    } catch (error) {
      console.error("Error al cambiar estado de comida:", error);
      toast.error("No se pudo actualizar el estado de la comida");
    }
  };

  useEffect(() => {
    if (diet && diet.days) {
      const daysWithMeals = diet.days.filter(day => day.meals.length > 0);
      
      if (daysWithMeals.length > 0 && !diet.days.find(d => d.name === activeDay)?.meals.length) {
        setActiveDay(daysWithMeals[0].name);
      }
    }
  }, [diet, activeDay]);

  return {
    diet,
    isLoading,
    activeDay,
    setActiveDay,
    availableDays,
    handleToggleMeal,
    isToggling,
    clientId
  };
};
