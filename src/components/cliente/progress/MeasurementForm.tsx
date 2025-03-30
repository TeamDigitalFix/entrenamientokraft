
import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { NewMeasurement, calculateBodyFatPercentage, calculateMuscleMassPercentage } from "@/types/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileFormView from "./form/MobileFormView";
import DesktopFormView from "./form/DesktopFormView";

type MeasurementFormValues = {
  peso: string;
  altura: string;
  circunferencia_cuello: string;
  circunferencia_cintura: string;
  circunferencia_cadera: string;
  sexo: 'masculino' | 'femenino';
  notas: string;
  fecha: Date;
};

type MeasurementFormProps = {
  onSubmit: (data: NewMeasurement) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

const MeasurementForm = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: MeasurementFormProps) => {
  const isMobile = useIsMobile();
  
  const form = useForm<MeasurementFormValues>({
    defaultValues: {
      peso: "",
      altura: "",
      circunferencia_cuello: "",
      circunferencia_cintura: "",
      circunferencia_cadera: "",
      sexo: "masculino",
      notas: "",
      fecha: new Date()
    }
  });

  const { watch, handleSubmit } = form;
  
  const watchSexo = watch("sexo");
  const watchAltura = watch("altura");
  const watchCuello = watch("circunferencia_cuello");
  const watchCintura = watch("circunferencia_cintura");
  const watchCadera = watch("circunferencia_cadera");

  const [calculatedValues, setCalculatedValues] = React.useState({
    grasa: 0,
    musculo: 0
  });

  useEffect(() => {
    const altura = parseFloat(watchAltura);
    const cuello = parseFloat(watchCuello);
    const cintura = parseFloat(watchCintura);
    const cadera = parseFloat(watchCadera);
    
    if (watchSexo && altura && cuello && cintura && (watchSexo !== 'femenino' || cadera)) {
      const bodyFatPercentage = calculateBodyFatPercentage(
        altura,
        cuello,
        cintura,
        cadera,
        watchSexo
      );

      if (bodyFatPercentage !== null) {
        const muscleMassPercentage = calculateMuscleMassPercentage(bodyFatPercentage);
        
        setCalculatedValues({
          grasa: bodyFatPercentage,
          musculo: muscleMassPercentage || 0
        });
      }
    }
  }, [watchSexo, watchAltura, watchCuello, watchCintura, watchCadera]);

  const handleFormSubmit = (data: MeasurementFormValues) => {
    const pesoValue = parseFloat(data.peso);
    const alturaValue = data.altura ? parseFloat(data.altura) : undefined;
    const cuelloValue = data.circunferencia_cuello ? parseFloat(data.circunferencia_cuello) : undefined;
    const cinturaValue = data.circunferencia_cintura ? parseFloat(data.circunferencia_cintura) : undefined;
    const caderaValue = data.circunferencia_cadera ? parseFloat(data.circunferencia_cadera) : undefined;
    
    let grasaValue: number | undefined;
    let musculoValue: number | undefined;
    
    if (alturaValue && cuelloValue && cinturaValue) {
      const grasaCalculada = calculateBodyFatPercentage(
        alturaValue,
        cuelloValue,
        cinturaValue,
        caderaValue,
        data.sexo
      );
      
      if (grasaCalculada !== null) {
        grasaValue = grasaCalculada;
        musculoValue = calculateMuscleMassPercentage(grasaCalculada) || undefined;
      }
    }
    
    onSubmit({
      peso: pesoValue,
      grasa_corporal: grasaValue,
      masa_muscular: musculoValue,
      notas: data.notas || undefined,
      fecha: data.fecha,
      altura: alturaValue,
      circunferencia_cuello: cuelloValue,
      circunferencia_cintura: cinturaValue,
      circunferencia_cadera: caderaValue,
      sexo: data.sexo
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {isMobile ? (
          <MobileFormView 
            onSubmit={handleSubmit(handleFormSubmit)}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            calculatedValues={calculatedValues}
          />
        ) : (
          <DesktopFormView 
            onSubmit={handleSubmit(handleFormSubmit)}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            calculatedValues={calculatedValues}
          />
        )}
      </form>
    </FormProvider>
  );
};

export default MeasurementForm;
