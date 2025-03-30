
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type NotesStepProps = {
  isMobile?: boolean;
  calculatedValues: {
    grasa: number;
    musculo: number;
  };
};

const NotesStep = ({ isMobile = false, calculatedValues }: NotesStepProps) => {
  const { control, watch } = useFormContext();
  const selectedDate = watch("fecha");
  const watchSexo = watch("sexo");
  const watchPeso = watch("peso");
  const watchAltura = watch("altura");
  const watchCuello = watch("circunferencia_cuello");
  const watchCintura = watch("circunferencia_cintura");
  const watchCadera = watch("circunferencia_cadera");

  return (
    <div className="space-y-4">
      {isMobile && (
        <h3 className="text-base font-medium">Notas adicionales</h3>
      )}
      
      <FormField
        control={control}
        name="notas"
        render={({ field }) => (
          <FormItem className="grid gap-2">
            <FormLabel>Notas</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Observaciones, sensaciones o detalles relevantes"
                className={isMobile ? "min-h-[100px]" : "min-h-[120px]"}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className={`bg-accent/30 ${isMobile ? 'p-3' : 'p-4'} rounded-md space-y-3 mt-2`}>
        <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>Resumen de la medición</h4>
        
        <div className={`grid grid-cols-2 gap-y-2 ${isMobile ? '' : 'gap-x-4'} text-sm`}>
          <div className="font-medium">Fecha:</div>
          <div>{format(selectedDate, "dd MMM yyyy", { locale: es })}</div>
          
          {!isMobile && (
            <>
              <div className="font-medium">Sexo:</div>
              <div>{watchSexo === 'masculino' ? 'Masculino' : 'Femenino'}</div>
            </>
          )}
          
          <div className="font-medium">Peso:</div>
          <div>{watchPeso} kg</div>
          
          {watchAltura && (
            <>
              <div className="font-medium">Altura:</div>
              <div>{watchAltura} cm</div>
            </>
          )}
          
          {!isMobile && watchCuello && (
            <>
              <div className="font-medium">Circunferencia cuello:</div>
              <div>{watchCuello} cm</div>
            </>
          )}
          
          {!isMobile && watchCintura && (
            <>
              <div className="font-medium">Circunferencia cintura:</div>
              <div>{watchCintura} cm</div>
            </>
          )}
          
          {!isMobile && watchSexo === 'femenino' && watchCadera && (
            <>
              <div className="font-medium">Circunferencia cadera:</div>
              <div>{watchCadera} cm</div>
            </>
          )}
          
          {(calculatedValues.grasa > 0) && (
            <>
              <div className="font-medium">Grasa corporal:</div>
              <div>{calculatedValues.grasa.toFixed(1)}%</div>
              
              <div className="font-medium">Masa muscular:</div>
              <div>{calculatedValues.musculo.toFixed(1)}%</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesStep;
