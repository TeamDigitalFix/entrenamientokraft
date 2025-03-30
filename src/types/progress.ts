
export type ProgressMeasurement = {
  id: string;
  fecha: string;
  peso: number;
  grasa_corporal: number | null;
  masa_muscular: number | null;
  notas: string | null;
  // Nuevas medidas para el método Navy
  altura: number | null;
  circunferencia_cuello: number | null;
  circunferencia_cintura: number | null;
  circunferencia_cadera: number | null;
  sexo: 'masculino' | 'femenino' | null;
};

export type NewMeasurement = {
  peso: number;
  grasa_corporal?: number;
  masa_muscular?: number;
  notas?: string;
  fecha?: Date;
  // Nuevas medidas para el método Navy
  altura?: number;
  circunferencia_cuello?: number;
  circunferencia_cintura?: number;
  circunferencia_cadera?: number;
  sexo?: 'masculino' | 'femenino';
};

export type MeasurementChange = {
  pesoChange: number | null;
  grasaChange: number | null;
  musculoChange: number | null;
};

export type ChartDataPoint = {
  name: string;
  peso: number;
  grasa?: number;
  musculo?: number;
};

// Función para calcular el porcentaje de grasa corporal según el método Navy
export const calculateBodyFatPercentage = (
  altura: number,
  circunferenciaCuello: number,
  circunferenciaCintura: number,
  circunferenciaCadera?: number,
  sexo?: 'masculino' | 'femenino'
): number | null => {
  if (!altura || !circunferenciaCuello || !circunferenciaCintura) {
    return null;
  }

  try {
    let bodyFatPercentage: number;

    if (sexo === 'masculino') {
      // Fórmula para hombres
      const log10CinturaCuello = Math.log10(circunferenciaCintura - circunferenciaCuello);
      const log10Altura = Math.log10(altura);
      bodyFatPercentage = 86.010 * log10CinturaCuello - 70.041 * log10Altura + 36.76;
    } else if (sexo === 'femenino' && circunferenciaCadera) {
      // Fórmula para mujeres
      const log10CinturaCaderaCuello = Math.log10(circunferenciaCintura + circunferenciaCadera - circunferenciaCuello);
      const log10Altura = Math.log10(altura);
      bodyFatPercentage = 163.205 * log10CinturaCaderaCuello - 97.684 * log10Altura - 78.387;
    } else {
      return null;
    }

    // Redondear a un decimal y asegurar que el valor esté entre 0 y 100
    bodyFatPercentage = Math.round(bodyFatPercentage * 10) / 10;
    return Math.max(0, Math.min(bodyFatPercentage, 100));
  } catch (error) {
    console.error("Error calculando el porcentaje de grasa corporal:", error);
    return null;
  }
};

// Función para calcular el porcentaje de masa muscular
export const calculateMuscleMassPercentage = (bodyFatPercentage: number | null): number | null => {
  if (bodyFatPercentage === null) {
    return null;
  }

  // Estimación simple: % masa muscular = 100 - % grasa corporal
  const muscleMassPercentage = 100 - bodyFatPercentage;
  return Math.round(muscleMassPercentage * 10) / 10; // Redondear a un decimal
};
