
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Info, Save, X } from "lucide-react";
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 3;
  
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

  const { watch, setValue, formState } = form;
  const { errors } = formState;
  
  const selectedDate = watch("fecha");
  const watchSexo = watch("sexo");
  const watchAltura = watch("altura");
  const watchCuello = watch("circunferencia_cuello");
  const watchCintura = watch("circunferencia_cintura");
  const watchCadera = watch("circunferencia_cadera");
  const watchPeso = watch("peso");

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

  // Desktop view uses tabs, mobile uses step-by-step
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {isMobile ? (
          // Mobile view with steps
          <>
            <div className="mb-4">
              <Progress value={stepProgress} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Paso {currentStep} de {totalSteps}</span>
                <span>{Math.round(stepProgress)}%</span>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-medium">Información básica</h3>
                
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
                            className="pointer-events-auto"
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
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <h3 className="text-base font-medium">Medidas corporales</h3>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0">
                        <Info className="h-4 w-4" />
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
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-medium">Notas adicionales</h3>
                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones, sensaciones o detalles relevantes"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-accent/30 p-3 rounded-md space-y-3 mt-2">
                  <h4 className="text-sm font-medium">Resumen de la medición</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Fecha:</div>
                    <div>{format(selectedDate, "dd MMM yyyy", { locale: es })}</div>
                    
                    <div className="font-medium">Peso:</div>
                    <div>{watchPeso} kg</div>
                    
                    {watchAltura && (
                      <>
                        <div className="font-medium">Altura:</div>
                        <div>{watchAltura} cm</div>
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
                  type="submit" 
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
        ) : (
          // Desktop view using tabs
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="basic">Información básica</TabsTrigger>
                <TabsTrigger value="measurements">Medidas corporales</TabsTrigger>
                <TabsTrigger value="notes">Notas y resumen</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 pt-4">
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
                            className="pointer-events-auto"
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
                            <RadioGroupItem value="masculino" id="masculino-desktop" />
                            <Label htmlFor="masculino-desktop">Masculino</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="femenino" id="femenino-desktop" />
                            <Label htmlFor="femenino-desktop">Femenino</Label>
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
              </TabsContent>
              
              <TabsContent value="measurements" className="space-y-4 pt-4">
                <div className="flex items-center">
                  <h3 className="text-base font-medium">Medidas para el cálculo de composición corporal</h3>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0">
                        <Info className="h-4 w-4" />
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
                
                <div className="grid md:grid-cols-2 gap-4">
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
                </div>
                
                {(calculatedValues.grasa > 0 || calculatedValues.musculo > 0) && (
                  <div className="bg-accent/50 p-4 rounded-md space-y-2 mt-4">
                    <p className="text-sm font-medium">Valores calculados:</p>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="secondary" className="text-sm px-3 py-1 bg-red-100 text-red-800">
                        Grasa corporal: {calculatedValues.grasa.toFixed(1)}%
                      </Badge>
                      <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-800">
                        Masa muscular: {calculatedValues.musculo.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Estos valores son calculados automáticamente según el método Navy
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones, sensaciones o detalles relevantes"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-accent/30 p-4 rounded-md space-y-3 mt-4">
                  <h4 className="text-base font-medium">Resumen de la medición</h4>
                  
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="font-medium">Fecha:</div>
                    <div>{format(selectedDate, "dd MMM yyyy", { locale: es })}</div>
                    
                    <div className="font-medium">Sexo:</div>
                    <div>{watchSexo === 'masculino' ? 'Masculino' : 'Femenino'}</div>
                    
                    <div className="font-medium">Peso:</div>
                    <div>{watchPeso} kg</div>
                    
                    {watchAltura && (
                      <>
                        <div className="font-medium">Altura:</div>
                        <div>{watchAltura} cm</div>
                      </>
                    )}
                    
                    {watchCuello && (
                      <>
                        <div className="font-medium">Circunferencia cuello:</div>
                        <div>{watchCuello} cm</div>
                      </>
                    )}
                    
                    {watchCintura && (
                      <>
                        <div className="font-medium">Circunferencia cintura:</div>
                        <div>{watchCintura} cm</div>
                      </>
                    )}
                    
                    {watchSexo === 'femenino' && watchCadera && (
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
                type="submit" 
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
        )}
      </form>
    </Form>
  );
};

export default MeasurementForm;
