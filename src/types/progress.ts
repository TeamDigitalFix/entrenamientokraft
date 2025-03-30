
export type ProgressMeasurement = {
  id: string;
  fecha: string;
  peso: number;
  grasa_corporal: number | null;
  masa_muscular: number | null;
  notas: string | null;
};

export type NewMeasurement = {
  peso: number;
  grasa_corporal?: number;
  masa_muscular?: number;
  notas?: string;
  fecha?: Date;
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
