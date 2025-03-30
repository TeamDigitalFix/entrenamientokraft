
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type BasicInfoStepProps = {
  isMobile?: boolean;
};

const BasicInfoStep = ({ isMobile = false }: BasicInfoStepProps) => {
  const { control, formState, watch } = useFormContext();
  const watchPeso = watch("peso");

  return (
    <div className="space-y-4">
      {isMobile && (
        <h3 className="text-base font-medium">Información básica</h3>
      )}
      
      <FormField
        control={control}
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
        control={control}
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
                  <RadioGroupItem 
                    value="masculino" 
                    id={isMobile ? "masculino" : "masculino-desktop"} 
                  />
                  <Label htmlFor={isMobile ? "masculino" : "masculino-desktop"}>Masculino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="femenino" 
                    id={isMobile ? "femenino" : "femenino-desktop"} 
                  />
                  <Label htmlFor={isMobile ? "femenino" : "femenino-desktop"}>Femenino</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
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
  );
};

export default BasicInfoStep;
