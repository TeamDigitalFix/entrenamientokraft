
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

type MeasurementsStepProps = {
  isMobile?: boolean;
  calculatedValues: {
    grasa: number;
    musculo: number;
  };
};

const MeasurementsStep = ({ isMobile = false, calculatedValues }: MeasurementsStepProps) => {
  const { control, watch } = useFormContext();
  const watchSexo = watch("sexo");

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        {isMobile && (
          <h3 className="text-base font-medium">Medidas corporales</h3>
        )}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="sm" className={isMobile ? "ml-2" : ""} style={{ width: 24, height: 24, padding: 0 }}>
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
      
      {isMobile ? (
        // Mobile layout: single column
        <>
          <FormField
            control={control}
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
            control={control}
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
            control={control}
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
              control={control}
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
        </>
      ) : (
        // Desktop layout: grid with two columns
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={control}
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
            control={control}
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
            control={control}
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
              control={control}
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
      )}
      
      {(calculatedValues.grasa > 0 || calculatedValues.musculo > 0) && (
        <div className={`bg-accent/50 ${isMobile ? 'p-3' : 'p-4'} rounded-md space-y-2 mt-2`}>
          <p className="text-sm font-medium">Valores calculados:</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={`${isMobile ? 'text-xs' : 'text-sm'} px-2 py-1 bg-red-100 text-red-800`}>
              Grasa corporal: {calculatedValues.grasa.toFixed(1)}%
            </Badge>
            <Badge variant="secondary" className={`${isMobile ? 'text-xs' : 'text-sm'} px-2 py-1 bg-green-100 text-green-800`}>
              Masa muscular: {calculatedValues.musculo.toFixed(1)}%
            </Badge>
          </div>
          {!isMobile && (
            <p className="text-xs text-muted-foreground mt-2">
              Estos valores son calculados automáticamente según el método Navy
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MeasurementsStep;
