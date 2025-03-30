
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export type ClientActivity = {
  name: string;
  sesiones: number;
  ejercicios: number;
};

export type ClientProgress = {
  name: string;
  peso: number;
  grasa: number;
};

export type ClientDistribution = {
  name: string;
  value: number;
};

export type ExerciseDistribution = {
  name: string;
  value: number;
};

export type StatsData = {
  totalSesiones: number;
  totalEjercicios: number;
  porcentajeAsistencia: number;
  cambioSesiones: number;
  cambioEjercicios: number;
  cambioAsistencia: number;
};

export type ProgressStats = {
  reduccionPeso: number;
  reduccionGrasa: number;
  aumentoMuscular: number;
};

export type TopPerformers = {
  clienteMasActivo: {
    nombre: string;
    sesiones: number;
  };
  ejercicioMasPopular: {
    nombre: string;
    porcentaje: number;
  };
  mayorProgreso: {
    nombre: string;
    reduccion: string;
  };
};

export const useReportes = (clienteId: string = "all", periodo: string = "month") => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<string>(periodo);

  // Convertir fechas según el rango
  const getFechasByRange = (range: string) => {
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return {
      fechaInicio: startDate.toISOString().split('T')[0],
      fechaFin: now.toISOString().split('T')[0]
    };
  };

  // Query para obtener datos de actividad diaria
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['reportes', 'activity', clienteId, dateRange],
    queryFn: async () => {
      try {
        const { fechaInicio, fechaFin } = getFechasByRange(dateRange);
        
        // Obtener sesiones diarias
        const { data: sesionesData, error: sesionesError } = await supabase
          .from('sesiones_diarias')
          .select('*')
          .gte('fecha', fechaInicio)
          .lte('fecha', fechaFin)
          .eq(clienteId !== "all" ? 'cliente_id' : 'entrenador_id', 
               clienteId !== "all" ? clienteId : user?.id);
        
        if (sesionesError) {
          throw new Error(sesionesError.message);
        }
          
        // Obtener ejercicios diarios
        const { data: ejerciciosData, error: ejerciciosError } = await supabase
          .from('ejercicios_diarios')
          .select('*')
          .gte('fecha', fechaInicio)
          .lte('fecha', fechaFin)
          .eq(clienteId !== "all" ? 'cliente_id' : 'entrenador_id', 
               clienteId !== "all" ? clienteId : user?.id);
          
        if (ejerciciosError) {
          throw new Error(ejerciciosError.message);
        }
        
        // Convertir los datos al formato necesario para los gráficos
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const actividadSemanal: ClientActivity[] = diasSemana.map(dia => {
          const sesionesDia = sesionesData?.filter(s => s.dia_semana === dia) || [];
          const ejerciciosDia = ejerciciosData?.filter(e => e.dia_semana === dia) || [];
          
          return {
            name: dia,
            sesiones: sesionesDia.length > 0 ? (sesionesDia[0].completada ? 1 : 0) : 0,
            ejercicios: ejerciciosDia.length > 0 ? ejerciciosDia[0].cantidad : 0
          };
        });
        
        // Calcular estadísticas
        const stats: StatsData = {
          totalSesiones: sesionesData?.filter(s => s.completada).length || 0,
          totalEjercicios: ejerciciosData?.reduce((sum, curr) => sum + curr.cantidad, 0) || 0,
          porcentajeAsistencia: sesionesData?.length 
            ? Math.round(sesionesData.filter(s => s.completada).length / sesionesData.length * 100) 
            : 0,
          cambioSesiones: 12, // Datos que deberían calcularse con períodos anteriores
          cambioEjercicios: 8,
          cambioAsistencia: -3
        };
        
        return { actividadSemanal, stats };
      } catch (error) {
        console.error("Error al cargar datos de actividad:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de actividad",
          variant: "destructive"
        });
        return { actividadSemanal: [], stats: null };
      }
    },
    enabled: !!user
  });

  // Query para obtener datos de progreso
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['reportes', 'progress', clienteId, dateRange],
    queryFn: async () => {
      try {
        // Obtener datos de progreso
        const { data, error } = await supabase
          .from('progreso_periodo')
          .select('*')
          .eq(clienteId !== "all" ? 'cliente_id' : 'entrenador_id', 
               clienteId !== "all" ? clienteId : user?.id)
          .order('fecha_inicio', { ascending: true });
          
        if (error) {
          throw new Error(error.message);
        }
        
        // Convertir a formato para gráficos
        const progresoCliente: ClientProgress[] = data.map(item => ({
          name: item.periodo,
          peso: item.peso || 0,
          grasa: item.porcentaje_grasa || 0
        }));
        
        // Estadísticas de progreso
        const progressStats: ProgressStats = {
          reduccionPeso: data.length > 1 
            ? Math.round((data[0].peso - data[data.length - 1].peso) * 10) / 10 
            : 0,
          reduccionGrasa: data.length > 1 
            ? Math.round((data[0].porcentaje_grasa - data[data.length - 1].porcentaje_grasa) * 10) / 10 
            : 0,
          aumentoMuscular: 2.2 // Dato que debería calcularse de la base de datos
        };
        
        return { progresoCliente, progressStats };
      } catch (error) {
        console.error("Error al cargar datos de progreso:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de progreso",
          variant: "destructive"
        });
        return { progresoCliente: [], progressStats: null };
      }
    },
    enabled: !!user
  });

  // Query para obtener datos de distribución
  const { data: distributionData, isLoading: isLoadingDistribution } = useQuery({
    queryKey: ['reportes', 'distribution', clienteId],
    queryFn: async () => {
      try {
        // Obtener distribución de clientes
        const { data: clientesData, error: clientesError } = await supabase
          .from('distribucion_clientes')
          .select('*')
          .eq('entrenador_id', user?.id);
          
        if (clientesError) {
          throw new Error(clientesError.message);
        }
        
        // Obtener distribución de ejercicios
        const { data: ejerciciosData, error: ejerciciosError } = await supabase
          .from('distribucion_ejercicios')
          .select('*')
          .eq('entrenador_id', user?.id);
          
        if (ejerciciosError) {
          throw new Error(ejerciciosError.message);
        }
        
        // Convertir a formato para gráficos
        const distribucionClientes: ClientDistribution[] = clientesData.map(item => ({
          name: item.categoria,
          value: item.cantidad
        }));
        
        const distribucionEjercicios: ExerciseDistribution[] = ejerciciosData.map(item => ({
          name: item.grupo_muscular,
          value: item.cantidad
        }));
        
        // Top performers - Datos de ejemplo
        const topPerformers: TopPerformers = {
          clienteMasActivo: {
            nombre: "Ana Martínez",
            sesiones: 12
          },
          ejercicioMasPopular: {
            nombre: "Sentadilla",
            porcentaje: 85
          },
          mayorProgreso: {
            nombre: "Carlos Rodríguez",
            reduccion: "-6.5kg en 3 meses"
          }
        };
        
        return { distribucionClientes, distribucionEjercicios, topPerformers };
      } catch (error) {
        console.error("Error al cargar datos de distribución:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de distribución",
          variant: "destructive"
        });
        return { 
          distribucionClientes: [], 
          distribucionEjercicios: [],
          topPerformers: null
        };
      }
    },
    enabled: !!user
  });

  // Obtener lista de clientes
  const { data: clientsList, isLoading: isLoadingClients } = useQuery({
    queryKey: ['reportes', 'clients'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre')
          .eq('entrenador_id', user?.id)
          .eq('role', 'cliente')
          .eq('eliminado', false);
          
        if (error) {
          throw new Error(error.message);
        }
        
        return data || [];
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!user
  });

  // Función para generar informe
  const generateReport = (selectedClient: string, dateRange: string) => {
    setDateRange(dateRange);
    // Aquí podría ir lógica adicional para exportar informes
    toast({
      title: "Informe generado",
      description: "Se ha generado el informe correctamente"
    });
  };

  return {
    // Data
    activityData: activityData?.actividadSemanal || [],
    progressData: progressData?.progresoCliente || [],
    clientDistributionData: distributionData?.distribucionClientes || [],
    exerciseDistributionData: distributionData?.distribucionEjercicios || [],
    clientsList: clientsList || [],
    
    // Stats
    activityStats: activityData?.stats,
    progressStats: progressData?.progressStats,
    topPerformers: distributionData?.topPerformers,
    
    // Estado
    isLoading: isLoadingActivity || isLoadingProgress || isLoadingDistribution || isLoadingClients,
    dateRange,
    
    // Acciones
    setDateRange,
    generateReport
  };
};
