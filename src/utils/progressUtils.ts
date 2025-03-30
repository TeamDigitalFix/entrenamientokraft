
import { ProgressMeasurement, MeasurementChange, ChartDataPoint } from "@/types/progress";

// Calculate changes between measurements
export const calculateChanges = (
  latestMeasurement: ProgressMeasurement | null, 
  firstMeasurement: ProgressMeasurement | null
): MeasurementChange => {
  if (!latestMeasurement || !firstMeasurement) {
    return {
      pesoChange: null,
      grasaChange: null,
      musculoChange: null
    };
  }

  return {
    pesoChange: +(latestMeasurement.peso - firstMeasurement.peso).toFixed(1),
    grasaChange: latestMeasurement.grasa_corporal !== null && firstMeasurement.grasa_corporal !== null
      ? +(latestMeasurement.grasa_corporal - firstMeasurement.grasa_corporal).toFixed(1)
      : null,
    musculoChange: latestMeasurement.masa_muscular !== null && firstMeasurement.masa_muscular !== null
      ? +(latestMeasurement.masa_muscular - firstMeasurement.masa_muscular).toFixed(1)
      : null
  };
};

// Format measurements data for charts
export const formatChartData = (measurements: ProgressMeasurement[]): ChartDataPoint[] => {
  if (!measurements || measurements.length === 0) return [];
  
  // Sort by date ascending for charts
  const sortedData = [...measurements].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
  
  return sortedData.map(m => ({
    name: new Date(m.fecha).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short' 
    }),
    peso: m.peso,
    grasa: m.grasa_corporal || undefined,
    musculo: m.masa_muscular || undefined
  }));
};
