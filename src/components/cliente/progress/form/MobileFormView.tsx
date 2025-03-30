
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, X } from "lucide-react";
import BasicInfoStep from "./BasicInfoStep";
import MeasurementsStep from "./MeasurementsStep";
import NotesStep from "./NotesStep";
import { useFormContext } from "react-hook-form";

type MobileFormViewProps = {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  calculatedValues: {
    grasa: number;
    musculo: number;
  };
};

const MobileFormView = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  calculatedValues 
}: MobileFormViewProps) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 3;
  
  const { formState, watch } = useFormContext();
  const { errors } = formState;
  const watchPeso = watch("peso");
  const watchSexo = watch("sexo");
  const watchAltura = watch("altura");
  const watchCuello = watch("circunferencia_cuello");
  const watchCintura = watch("circunferencia_cintura");
  const watchCadera = watch("circunferencia_cadera");

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      // Validate date and basic info
      return !errors.fecha && !errors.sexo && !errors.peso && !!watchPeso;
    }
    if (currentStep === 2) {
      // Validate measurements
      if (watchSexo === 'femenino') {
        return !!watchAltura && !!watchCuello && !!watchCintura && !!watchCadera;
      }
      return !!watchAltura && !!watchCuello && !!watchCintura;
    }
    return true;
  };

  const stepProgress = (currentStep / totalSteps) * 100;

  return (
    <>
      <div className="mb-4">
        <Progress value={stepProgress} className="h-2" />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Paso {currentStep} de {totalSteps}</span>
          <span>{Math.round(stepProgress)}%</span>
        </div>
      </div>

      {currentStep === 1 && (
        <BasicInfoStep isMobile={true} />
      )}

      {currentStep === 2 && (
        <MeasurementsStep isMobile={true} calculatedValues={calculatedValues} />
      )}

      {currentStep === 3 && (
        <NotesStep isMobile={true} calculatedValues={calculatedValues} />
      )}

      <div className="mt-6 flex justify-between">
        {currentStep > 1 ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={goToPreviousStep}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
        ) : (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        )}
        
        {currentStep < totalSteps ? (
          <Button 
            type="button" 
            onClick={goToNextStep}
            disabled={!canGoNext()}
          >
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Guardando</span>
                <Progress className="w-20 h-2" value={75} />
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        )}
      </div>
    </>
  );
};

export default MobileFormView;
