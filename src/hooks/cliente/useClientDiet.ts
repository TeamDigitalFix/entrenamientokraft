
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
};

export const useClientDiet = (clientId?: string) => {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState<string>('Lunes');
  const [availableDays] = useState<string[]>(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
  const { toggleMealCompletion, isToggling } = useMealToggle();

  // Consulta para obtener la dieta del cliente
  const { data: diet, isLoading, refetch } = useQuery({
    queryKey: ['clientDiet', clientId || user?.id],
    queryFn: async () => {
      try {
        // Si se proporciona un clientId, usamos ese, de lo contrario usamos el user.id actual
        const targetUserId = clientId || user?.id;
        
        if (!targetUserId) return null;

        // Obtener la dieta activa del cliente
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

        // Obtener las comidas de la dieta
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

        // Obtener las comidas completadas hoy
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

        // Map de comidas completadas para verificación rápida
        const completadasMap = new Map();
        completadas?.forEach(item => {
          completadasMap.set(item.dieta_comida_id, true);
        });

        // Convertir los datos al formato necesario para el cliente
        const clientDiet: ClientDiet = {
          id: dieta.id,
          name: dieta.nombre,
          description: dieta.descripcion,
          startDate: dieta.fecha_inicio,
          endDate: dieta.fecha_fin,
          days: []
        };

        // Agrupar las comidas por día
        const mealsByDay: Record<string, Record<string, Meal>> = {};

        // Inicializar los días de la semana
        availableDays.forEach(day => {
          mealsByDay[day] = {};
        });

        // Procesar las comidas de la dieta
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
          
          // Organizar por día y tipo de comida
          if (comida.dia) {
            // Capitalize first letter of day
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
            
            // Marcar como completada si todas las comidas de este tipo están completadas
            if (completadasMap.has(comida.id)) {
              mealsByDay[day][comida.tipo_comida].completed = true;
            }
          }
        });

        // Convertir a array de días
        clientDiet.days = availableDays.map(day => {
          const meals = Object.values(mealsByDay[day] || {});
          
          // Calcular totales para el día
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

        return clientDiet;
      } catch (error) {
        console.error("Error al cargar la dieta:", error);
        toast.error("No se pudo cargar la dieta");
        return null;
      }
    },
    enabled: !!(clientId || user?.id),
  });

  // Manejador para marcar/desmarcar comidas como completadas
  const handleToggleMeal = async (mealId: string, foods: FoodItem[], isCompleted: boolean) => {
    try {
      // Realizar la acción solo si la dieta está cargada
      if (!diet) return;
      
      // Obtener todos los ids de comidas para este tipo de comida
      const dietMealIds = foods.map(food => food.dietMealId);
      
      // Usar el hook de toggle para marcar/desmarcar comidas
      await toggleMealCompletion({
        dietMealIds, 
        completed: !isCompleted,
        clientId: clientId // Opcional: para cuando el entrenador gestiona comidas de un cliente
      });
      
      // Refrescar los datos
      await refetch();
      
    } catch (error) {
      console.error("Error al cambiar estado de comida:", error);
      toast.error("No se pudo actualizar el estado de la comida");
    }
  };

  // Set the active day to the first day that has meals
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
    isToggling
  };
};
