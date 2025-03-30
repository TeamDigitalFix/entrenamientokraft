
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { NewMeasurement } from "@/types/progress";

type MeasurementFormValues = {
  peso: string;
  grasa_corporal: string;
  masa_muscular: string;
  notas: string;
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
  const { register, handleSubmit, formState: { errors } } = useForm<MeasurementFormValues>({
    defaultValues: {
      peso: "",
      grasa_corporal: "",
      masa_muscular: "",
      notas: ""
    }
  });

  const handleFormSubmit = (data: MeasurementFormValues) => {
    const pesoValue = parseFloat(data.peso);
    const grasaValue = data.grasa_corporal ? parseFloat(data.grasa_corporal) : undefined;
    const musculoValue = data.masa_muscular ? parseFloat(data.masa_muscular) : undefined;
    
    onSubmit({
      peso: pesoValue,
      grasa_corporal: grasaValue,
      masa_muscular: musculoValue,
      notas: data.notas || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="grid gap-4 py-3">
        <div className="grid gap-2">
          <Label htmlFor="peso" className="required">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            step="0.1"
            placeholder="Ej. 75.5"
            {...register("peso", { 
              required: "El peso es obligatorio",
              min: { value: 30, message: "El peso mínimo es 30 kg" },
              max: { value: 250, message: "El peso máximo es 250 kg" }
            })}
          />
          {errors.peso && (
            <p className="text-sm text-red-500">{errors.peso.message}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="grasa_corporal">Grasa Corporal (%)</Label>
          <Input
            id="grasa_corporal"
            type="number"
            step="0.1"
            placeholder="Ej. 18.5"
            {...register("grasa_corporal", { 
              min: { value: 3, message: "El porcentaje mínimo es 3%" },
              max: { value: 60, message: "El porcentaje máximo es 60%" }
            })}
          />
          {errors.grasa_corporal && (
            <p className="text-sm text-red-500">{errors.grasa_corporal.message}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="masa_muscular">Masa Muscular (%)</Label>
          <Input
            id="masa_muscular"
            type="number"
            step="0.1"
            placeholder="Ej. 35.0"
            {...register("masa_muscular", { 
              min: { value: 10, message: "El porcentaje mínimo es 10%" },
              max: { value: 60, message: "El porcentaje máximo es 60%" }
            })}
          />
          {errors.masa_muscular && (
            <p className="text-sm text-red-500">{errors.masa_muscular.message}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="notas">Notas</Label>
          <Textarea
            id="notas"
            placeholder="Observaciones, sensaciones o detalles relevantes"
            className="min-h-[80px]"
            {...register("notas")}
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-between">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Guardando</span>
              <Progress className="w-20 h-2" value={75} />
            </>
          ) : (
            "Guardar Medición"
          )}
        </Button>
      </div>
    </form>
  );
};

export default MeasurementForm;
