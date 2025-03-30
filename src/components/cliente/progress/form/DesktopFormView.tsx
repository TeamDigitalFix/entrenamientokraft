
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import BasicInfoStep from "./BasicInfoStep";
import MeasurementsStep from "./MeasurementsStep";
import NotesStep from "./NotesStep";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormContext } from "react-hook-form";

type DesktopFormViewProps = {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  calculatedValues: {
    grasa: number;
    musculo: number;
  };
};

const DesktopFormView = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  calculatedValues 
}: DesktopFormViewProps) => {
  const { watch } = useFormContext();
  const watchPeso = watch("peso");

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basic">Información básica</TabsTrigger>
          <TabsTrigger value="measurements">Medidas corporales</TabsTrigger>
          <TabsTrigger value="notes">Notas y resumen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
          <BasicInfoStep />
        </TabsContent>
        
        <TabsContent value="measurements" className="space-y-4 pt-4">
          <MeasurementsStep calculatedValues={calculatedValues} />
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4 pt-4">
          <NotesStep calculatedValues={calculatedValues} />
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-4 border-t flex justify-between">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        
        <Button 
          type="button" 
          onClick={onSubmit}
          disabled={isSubmitting || !watchPeso}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Guardando</span>
              <Progress className="w-20 h-2" value={75} />
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Guardar Medición
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DesktopFormView;
