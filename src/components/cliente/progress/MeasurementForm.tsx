
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { NewMeasurement, calculateBodyFatPercentage, calculateMuscleMassPercentage } from "@/types/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { InfoCircle } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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

  const { watch, setValue, getValues } = form;
  
  const selectedDate = watch("fecha");
  const watchSexo = watch("sexo");
  const watchAltura = watch("altura");
  const watchCuello = watch("circunferencia_cuello");
  const watchCintura = watch("circunferencia_cintura");
  const watchCadera = watch("circunferencia_cadera");

  // Calcular el porcentaje de grasa corporal en tiempo real
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

      // Actualizar los porcentajes calculados
      if (bodyFatPercentage !== null) {
        const muscleMassPercentage = calculateMuscleMassPercentage(bodyFatPercentage);
        
        // Mostrar en la UI
        setCalculatedValues({
          grasa: bodyFatPercentage,
          musculo: muscleMassPercentage || 0
        });
      }
    }
  }, [watchSexo, watchAltura, watchCuello, watchCintura, watchCadera]);

  // Estado para los valores calculados
  const [calculatedValues, setCalculatedValues] = React.useState({
    grasa: 0,
    musculo: 0
  });

  const handleFormSubmit = (data: MeasurementFormValues) => {
    const pesoValue = parseFloat(data.peso);
    const alturaValue = data.altura ? parseFloat(data.altura) : undefined;
    const cuelloValue = data.circunferencia_cuello ? parseFloat(data.circunferencia_cuello) : undefined;
    const cinturaValue = data.circunferencia_cintura ? parseFloat(data.circunferencia_cintura) : undefined;
    const caderaValue = data.circunferencia_cadera ? parseFloat(data.circunferencia_cadera) : undefined;
    
    // Calcular los porcentajes
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid gap-4 py-3">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel className="required">Fecha de medición</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sexo"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="required">Sexo</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="masculino" />
                      <Label htmlFor="masculino">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="femenino" id="femenino" />
                      <Label htmlFor="femenino">Femenino</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="peso"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel className="required">Peso (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 75.5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{ 
              required: "El peso es obligatorio",
              min: { value: 30, message: "El peso mínimo es 30 kg" },
              max: { value: 250, message: "El peso máximo es 250 kg" }
            }}
          />

          <Separator className="my-2" />
          
          <div className="flex items-center">
            <h3 className="text-md font-medium">Medidas para el cálculo de composición corporal</h3>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0">
                  <InfoCircle className="h-4 w-4" />
                  <span className="sr-only">Info</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Método Navy para el cálculo de % de grasa corporal</h4>
                  <p className="text-xs text-muted-foreground">
                    Completando estos campos se calculará automáticamente tu % de grasa corporal y masa muscular.
                    Todas las medidas deben ser en centímetros.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          
          <FormField
            control={form.control}
            name="altura"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Altura (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 175.0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{ 
              min: { value: 100, message: "La altura mínima es 100 cm" },
              max: { value: 220, message: "La altura máxima es 220 cm" }
            }}
          />
          
          <FormField
            control={form.control}
            name="circunferencia_cuello"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Circunferencia del cuello (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 36.0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{ 
              min: { value: 20, message: "La medida mínima es 20 cm" },
              max: { value: 60, message: "La medida máxima es 60 cm" }
            }}
          />
          
          <FormField
            control={form.control}
            name="circunferencia_cintura"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Circunferencia de la cintura (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 80.0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{ 
              min: { value: 50, message: "La medida mínima es 50 cm" },
              max: { value: 150, message: "La medida máxima es 150 cm" }
            }}
          />
          
          {watchSexo === 'femenino' && (
            <FormField
              control={form.control}
              name="circunferencia_cadera"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Circunferencia de la cadera (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ej. 95.0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              rules={{ 
                min: { value: 60, message: "La medida mínima es 60 cm" },
                max: { value: 150, message: "La medida máxima es 150 cm" }
              }}
            />
          )}
          
          {/* Mostrar resultados calculados si hay suficientes datos */}
          {(calculatedValues.grasa > 0 || calculatedValues.musculo > 0) && (
            <div className="bg-accent/50 p-3 rounded-md space-y-2 mt-2">
              <p className="text-sm font-medium">Valores calculados:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-red-100 text-red-800">
                  Grasa corporal: {calculatedValues.grasa.toFixed(1)}%
                </Badge>
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-100 text-green-800">
                  Masa muscular: {calculatedValues.musculo.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Estos valores son calculados automáticamente según el método Navy
              </p>
            </div>
          )}
          
          <Separator className="my-2" />
          
          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observaciones, sensaciones o detalles relevantes"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
    </Form>
  );
};

export default MeasurementForm;
