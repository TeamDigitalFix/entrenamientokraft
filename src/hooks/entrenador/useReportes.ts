
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
        let sesionesQuery = supabase
          .from('sesiones_diarias')
          .select('*')
          .gte('fecha', fechaInicio)
          .lte('fecha', fechaFin);
        
        if (clienteId !== "all") {
          sesionesQuery = sesionesQuery.eq('cliente_id', clienteId);
        } else {
          sesionesQuery = sesionesQuery.eq('entrenador_id', user?.id);
        }
        
        const { data: sesionesData, error: sesionesError } = await sesionesQuery;
        
        if (sesionesError) {
          throw new Error(sesionesError.message);
        }
          
        // Obtener ejercicios diarios
        let ejerciciosQuery = supabase
          .from('ejercicios_diarios')
          .select('*')
          .gte('fecha', fechaInicio)
          .lte('fecha', fechaFin);
          
        if (clienteId !== "all") {
          ejerciciosQuery = ejerciciosQuery.eq('cliente_id', clienteId);
        } else {
          ejerciciosQuery = ejerciciosQuery.eq('entrenador_id', user?.id);
        }
        
        const { data: ejerciciosData, error: ejerciciosError } = await ejerciciosQuery;
          
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
            sesiones: sesionesDia.filter(s => s.completada).length,
            ejercicios: ejerciciosDia.reduce((sum, curr) => sum + curr.cantidad, 0)
          };
        });
        
        // Calcular estadísticas actuales
        const totalSesiones = sesionesData?.filter(s => s.completada).length || 0;
        const totalEjercicios = ejerciciosData?.reduce((sum, curr) => sum + curr.cantidad, 0) || 0;
        const porcentajeAsistencia = sesionesData?.length 
          ? Math.round((sesionesData.filter(s => s.completada).length / sesionesData.length) * 100) 
          : 0;
        
        // Obtener estadísticas del período anterior para comparar
        const periodoAnteriorFechaFin = new Date(fechaInicio);
        periodoAnteriorFechaFin.setDate(periodoAnteriorFechaFin.getDate() - 1);
        
        const periodoAnteriorFechaInicio = new Date(periodoAnteriorFechaFin);
        const duracionPeriodo = new Date(fechaFin).getTime() - new Date(fechaInicio).getTime();
        periodoAnteriorFechaInicio.setTime(periodoAnteriorFechaInicio.getTime() - duracionPeriodo);
        
        // Consultar sesiones del período anterior
        let sesionesAnterioresQuery = supabase
          .from('sesiones_diarias')
          .select('*')
          .gte('fecha', periodoAnteriorFechaInicio.toISOString().split('T')[0])
          .lte('fecha', periodoAnteriorFechaFin.toISOString().split('T')[0]);
        
        if (clienteId !== "all") {
          sesionesAnterioresQuery = sesionesAnterioresQuery.eq('cliente_id', clienteId);
        } else {
          sesionesAnterioresQuery = sesionesAnterioresQuery.eq('entrenador_id', user?.id);
        }
        
        const { data: sesionesAnteriores, error: errorSesionesAnteriores } = await sesionesAnterioresQuery;
        
        if (errorSesionesAnteriores) {
          console.error("Error al obtener sesiones anteriores:", errorSesionesAnteriores);
        }
        
        // Consultar ejercicios del período anterior
        let ejerciciosAnterioresQuery = supabase
          .from('ejercicios_diarios')
          .select('*')
          .gte('fecha', periodoAnteriorFechaInicio.toISOString().split('T')[0])
          .lte('fecha', periodoAnteriorFechaFin.toISOString().split('T')[0]);
          
        if (clienteId !== "all") {
          ejerciciosAnterioresQuery = ejerciciosAnterioresQuery.eq('cliente_id', clienteId);
        } else {
          ejerciciosAnterioresQuery = ejerciciosAnterioresQuery.eq('entrenador_id', user?.id);
        }
        
        const { data: ejerciciosAnteriores, error: errorEjerciciosAnteriores } = await ejerciciosAnterioresQuery;
        
        if (errorEjerciciosAnteriores) {
          console.error("Error al obtener ejercicios anteriores:", errorEjerciciosAnteriores);
        }
        
        // Calcular estadísticas anteriores
        const totalSesionesAnterior = sesionesAnteriores?.filter(s => s.completada).length || 0;
        const totalEjerciciosAnterior = ejerciciosAnteriores?.reduce((sum, curr) => sum + curr.cantidad, 0) || 0;
        const porcentajeAsistenciaAnterior = sesionesAnteriores?.length 
          ? Math.round((sesionesAnteriores.filter(s => s.completada).length / sesionesAnteriores.length) * 100) 
          : 0;
        
        // Calcular cambios porcentuales
        const calcularCambioPorcentual = (actual: number, anterior: number) => {
          if (anterior === 0) return actual > 0 ? 100 : 0;
          return Math.round(((actual - anterior) / anterior) * 100);
        };
        
        const stats: StatsData = {
          totalSesiones,
          totalEjercicios,
          porcentajeAsistencia,
          cambioSesiones: calcularCambioPorcentual(totalSesiones, totalSesionesAnterior),
          cambioEjercicios: calcularCambioPorcentual(totalEjercicios, totalEjerciciosAnterior),
          cambioAsistencia: calcularCambioPorcentual(porcentajeAsistencia, porcentajeAsistenciaAnterior)
        };
        
        return { actividadSemanal, stats };
      } catch (error) {
        console.error("Error al cargar datos de actividad:", error);
        toast.error("No se pudieron cargar los datos de actividad");
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
        let progresoQuery = supabase
          .from('progreso')
          .select('*')
          .order('fecha', { ascending: true });
        
        if (clienteId !== "all") {
          progresoQuery = progresoQuery.eq('cliente_id', clienteId);
        } else {
          // Para todos los clientes, necesitamos relacionar con la tabla de usuarios
          // para obtener solo los clientes del entrenador actual
          const { data: clientesData, error: clientesError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('entrenador_id', user?.id)
            .eq('role', 'cliente')
            .eq('eliminado', false);
          
          if (clientesError) {
            throw new Error(clientesError.message);
          }
          
          const clientesIds = clientesData.map(c => c.id);
          if (clientesIds.length > 0) {
            progresoQuery = progresoQuery.in('cliente_id', clientesIds);
          } else {
            // Si no hay clientes, devolvemos un arreglo vacío
            return { progresoCliente: [], progressStats: null };
          }
        }
        
        const { data, error } = await progresoQuery;
          
        if (error) {
          throw new Error(error.message);
        }
        
        // Si no hay datos de progreso, retornar vacío
        if (!data || data.length === 0) {
          return { progresoCliente: [], progressStats: null };
        }
        
        // Si hay datos de progreso, procesarlos
        const sortedData = [...data].sort((a, b) => 
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        
        // Crear formato para gráficos agrupando por mes si hay muchos datos
        let progresoCliente: ClientProgress[] = [];
        
        if (sortedData.length > 12) {
          // Agrupar por mes si hay más de 12 mediciones
          const progressByMonth: Record<string, { peso: number, grasa: number, count: number }> = {};
          
          sortedData.forEach(item => {
            const month = new Date(item.fecha).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'short' 
            });
            
            if (!progressByMonth[month]) {
              progressByMonth[month] = { peso: 0, grasa: 0, count: 0 };
            }
            
            progressByMonth[month].peso += item.peso || 0;
            progressByMonth[month].grasa += item.grasa_corporal || 0;
            progressByMonth[month].count += 1;
          });
          
          progresoCliente = Object.entries(progressByMonth).map(([name, values]) => ({
            name,
            peso: Math.round((values.peso / values.count) * 10) / 10,
            grasa: Math.round((values.grasa / values.count) * 10) / 10
          }));
        } else {
          // Usar valores individuales si hay pocos datos
          progresoCliente = sortedData.map(item => ({
            name: new Date(item.fecha).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short' 
            }),
            peso: item.peso || 0,
            grasa: item.grasa_corporal || 0
          }));
        }
        
        // Estadísticas de progreso
        const firstMeasurement = sortedData[0];
        const lastMeasurement = sortedData[sortedData.length - 1];
        
        const progressStats: ProgressStats = {
          reduccionPeso: Math.round((firstMeasurement.peso - lastMeasurement.peso) * 10) / 10,
          reduccionGrasa: firstMeasurement.grasa_corporal !== null && lastMeasurement.grasa_corporal !== null
            ? Math.round((firstMeasurement.grasa_corporal - lastMeasurement.grasa_corporal) * 10) / 10
            : 0,
          aumentoMuscular: firstMeasurement.masa_muscular !== null && lastMeasurement.masa_muscular !== null
            ? Math.round((lastMeasurement.masa_muscular - firstMeasurement.masa_muscular) * 10) / 10
            : 0
        };
        
        return { progresoCliente, progressStats };
      } catch (error) {
        console.error("Error al cargar datos de progreso:", error);
        toast.error("No se pudieron cargar los datos de progreso");
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
        if (!user?.id) {
          throw new Error("Usuario no autenticado");
        }
        
        // Si estamos filtrando por un cliente específico, no mostrar distribución
        if (clienteId !== "all") {
          return { 
            distribucionClientes: [], 
            distribucionEjercicios: [],
            topPerformers: null
          };
        }
        
        // Obtener lista de clientes del entrenador
        const { data: clientes, error: clientesError } = await supabase
          .from('usuarios')
          .select('id, nombre')
          .eq('entrenador_id', user?.id)
          .eq('role', 'cliente')
          .eq('eliminado', false);
          
        if (clientesError) {
          throw new Error(clientesError.message);
        }
        
        // Distribución por categorías (podemos usar tipos de ejercicios o dietas)
        const clientesIds = clientes.map(c => c.id);
        
        // Obtener rutinas
        const { data: rutinas, error: rutinasError } = await supabase
          .from('rutinas')
          .select('*, rutina_ejercicios(*, ejercicios(*))')
          .in('cliente_id', clientesIds);
          
        if (rutinasError) {
          throw new Error(rutinasError.message);
        }
        
        // Contar ejercicios por grupo muscular
        const gruposMusculares: Record<string, number> = {};
        
        rutinas.forEach(rutina => {
          const ejercicios = rutina.rutina_ejercicios || [];
          ejercicios.forEach((item: any) => {
            if (item.ejercicios?.grupo_muscular) {
              const grupo = item.ejercicios.grupo_muscular;
              gruposMusculares[grupo] = (gruposMusculares[grupo] || 0) + 1;
            }
          });
        });
        
        const distribucionEjercicios: ExerciseDistribution[] = Object.entries(gruposMusculares)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        
        // Distribución de clientes (por actividad)
        const { data: sesiones, error: sesionesError } = await supabase
          .from('sesiones_diarias')
          .select('cliente_id, completada')
          .eq('entrenador_id', user?.id);
          
        if (sesionesError) {
          throw new Error(sesionesError.message);
        }
        
        // Contar sesiones completadas por cliente
        const sesionesCompletadasPorCliente: Record<string, number> = {};
        
        sesiones.forEach(sesion => {
          if (sesion.completada) {
            const clienteId = sesion.cliente_id;
            sesionesCompletadasPorCliente[clienteId] = (sesionesCompletadasPorCliente[clienteId] || 0) + 1;
          }
        });
        
        // Categorizar clientes por nivel de actividad
        const niveles = {
          'Muy activos': 0,
          'Activos': 0,
          'Moderados': 0,
          'Ocasionales': 0,
          'Inactivos': 0
        };
        
        Object.values(sesionesCompletadasPorCliente).forEach(count => {
          if (count >= 20) niveles['Muy activos']++;
          else if (count >= 10) niveles['Activos']++;
          else if (count >= 5) niveles['Moderados']++;
          else if (count >= 1) niveles['Ocasionales']++;
          else niveles['Inactivos']++;
        });
        
        // Agregar clientes sin sesiones al grupo "Inactivos"
        niveles['Inactivos'] += clientes.length - Object.keys(sesionesCompletadasPorCliente).length;
        
        const distribucionClientes: ClientDistribution[] = Object.entries(niveles)
          .filter(([_, value]) => value > 0) // Solo incluir categorías con valores
          .map(([name, value]) => ({ name, value }));
        
        // Encontrar cliente más activo
        let clienteMasActivoId = '';
        let maxSesiones = 0;
        
        Object.entries(sesionesCompletadasPorCliente).forEach(([clienteId, count]) => {
          if (count > maxSesiones) {
            maxSesiones = count;
            clienteMasActivoId = clienteId;
          }
        });
        
        const clienteMasActivo = clientes.find(c => c.id === clienteMasActivoId) || { nombre: 'N/A' };
        
        // Encontrar ejercicio más popular
        let ejercicioMasPopularNombre = 'N/A';
        let ejercicioMasPopularCount = 0;
        
        if (distribucionEjercicios.length > 0) {
          ejercicioMasPopularNombre = distribucionEjercicios[0].name;
          ejercicioMasPopularCount = distribucionEjercicios[0].value;
        }
        
        // Calcular porcentaje del ejercicio más popular
        const totalEjercicios = distribucionEjercicios.reduce((sum, item) => sum + item.value, 0);
        const porcentajeEjercicioPopular = totalEjercicios > 0 
          ? Math.round((ejercicioMasPopularCount / totalEjercicios) * 100) 
          : 0;
        
        // Buscar cliente con mayor progreso
        const { data: progresos, error: progresosError } = await supabase
          .from('progreso')
          .select('cliente_id, fecha, peso')
          .in('cliente_id', clientesIds)
          .order('fecha', { ascending: true });
          
        if (progresosError) {
          throw new Error(progresosError.message);
        }
        
        // Agrupar por cliente
        const progresosPorCliente: Record<string, { primer: any, ultimo: any }> = {};
        
        progresos.forEach(progreso => {
          const clienteId = progreso.cliente_id;
          
          if (!progresosPorCliente[clienteId]) {
            progresosPorCliente[clienteId] = { primer: progreso, ultimo: progreso };
          } else {
            const fechaActual = new Date(progreso.fecha).getTime();
            const fechaPrimer = new Date(progresosPorCliente[clienteId].primer.fecha).getTime();
            const fechaUltimo = new Date(progresosPorCliente[clienteId].ultimo.fecha).getTime();
            
            if (fechaActual < fechaPrimer) {
              progresosPorCliente[clienteId].primer = progreso;
            }
            
            if (fechaActual > fechaUltimo) {
              progresosPorCliente[clienteId].ultimo = progreso;
            }
          }
        });
        
        // Encontrar cliente con mayor pérdida de peso
        let clienteMayorProgresoId = '';
        let mayorReduccion = 0;
        
        Object.entries(progresosPorCliente).forEach(([clienteId, { primer, ultimo }]) => {
          const reduccion = primer.peso - ultimo.peso;
          if (reduccion > mayorReduccion) {
            mayorReduccion = reduccion;
            clienteMayorProgresoId = clienteId;
          }
        });
        
        const clienteMayorProgreso = clientes.find(c => c.id === clienteMayorProgresoId) || { nombre: 'N/A' };
        
        // Top performers
        const topPerformers: TopPerformers = {
          clienteMasActivo: {
            nombre: clienteMasActivo.nombre,
            sesiones: maxSesiones
          },
          ejercicioMasPopular: {
            nombre: ejercicioMasPopularNombre,
            porcentaje: porcentajeEjercicioPopular
          },
          mayorProgreso: {
            nombre: clienteMayorProgreso.nombre,
            reduccion: mayorReduccion > 0 ? `-${mayorReduccion.toFixed(1)}kg` : 'N/A'
          }
        };
        
        return { distribucionClientes, distribucionEjercicios, topPerformers };
      } catch (error) {
        console.error("Error al cargar datos de distribución:", error);
        toast.error("No se pudieron cargar los datos de distribución");
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
        toast.error("No se pudieron cargar los clientes");
        return [];
      }
    },
    enabled: !!user
  });

  // Función para generar informe
  const generateReport = (selectedClient: string, dateRange: string) => {
    setDateRange(dateRange);
    // Aquí podría ir lógica adicional para exportar informes
    toast.success("Informe generado correctamente");
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
