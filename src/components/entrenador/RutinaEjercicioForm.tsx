
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";

// Días de la semana para el selector
const diasSemana = [
  { value: "Lunes", label: "Lunes" },
  { value: "Martes", label: "Martes" },
  { value: "Miércoles", label: "Miércoles" },
  { value: "Jueves", label: "Jueves" },
  { value: "Viernes", label: "Viernes" },
  { value: "Sábado", label: "Sábado" },
  { value: "Domingo", label: "Domingo" },
];

interface RutinaEjercicioFormProps {
  clienteId: string;
  rutinaId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface EjercicioOption {
  id: string;
  nombre: string;
  grupo_muscular: string;
}

const RutinaEjercicioForm = ({
  clienteId,
  rutinaId,
  onCancel,
  onSuccess,
}: RutinaEjercicioFormProps) => {
  const { toast } = useToast();
  const [ejercicios, setEjercicios] = useState<EjercicioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingRutina, setCreatingRutina] = useState(false);

  const form = useForm({
    defaultValues: {
      ejercicio_id: "",
      dia: "Lunes",
      series: 3,
      repeticiones: 10,
      peso: "",
      notas: "",
    },
  });

  // Cargar ejercicios disponibles
  useEffect(() => {
    const fetchEjercicios = async () => {
      try {
        const { data, error } = await supabase
          .from("ejercicios")
          .select("id, nombre, grupo_muscular");

        if (error) throw error;
        setEjercicios(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `No se pudieron cargar los ejercicios: ${error.message}`,
          variant: "destructive",
        });
      }
    };

    fetchEjercicios();
  }, [toast]);

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      let rutina_id = rutinaId;

      // Si no existe una rutina, crear una nueva
      if (!rutina_id) {
        setCreatingRutina(true);
        const { data: nuevaRutina, error: rutinaError } = await supabase
          .from("rutinas")
          .insert({
            cliente_id: clienteId,
            nombre: "Rutina personalizada",
            fecha_inicio: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (rutinaError) throw rutinaError;
        rutina_id = nuevaRutina.id;
        setCreatingRutina(false);
      }

      // Mapear el día de la semana a un número para la base de datos
      const diaNumero = diasSemana.findIndex(d => d.value === values.dia) + 1;

      // Insertar el ejercicio en la rutina
      const { error: ejercicioError } = await supabase
        .from("rutina_ejercicios")
        .insert({
          rutina_id,
          ejercicio_id: values.ejercicio_id,
          series: values.series,
          repeticiones: values.repeticiones,
          peso: values.peso || null,
          notas: values.notas || null,
          dia: diaNumero,
        });

      if (ejercicioError) throw ejercicioError;

      toast({
        title: "Ejercicio añadido",
        description: "El ejercicio ha sido añadido a la rutina correctamente.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `No se pudo añadir el ejercicio: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Añadir ejercicio a la rutina</DialogTitle>
        <DialogDescription>
          Selecciona un ejercicio y completa la información para añadirlo a la rutina del cliente.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="ejercicio_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ejercicio*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un ejercicio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ejercicios.map((ejercicio) => (
                      <SelectItem key={ejercicio.id} value={ejercicio.id}>
                        {ejercicio.nombre} - {ejercicio.grupo_muscular}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Día de la semana*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un día" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {diasSemana.map((dia) => (
                      <SelectItem key={dia.value} value={dia.value}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="series"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Series*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      disabled={loading}
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeticiones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeticiones*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      disabled={loading}
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="peso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    disabled={loading} 
                    placeholder="Ej: 50 o 'Peso corporal'"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas o instrucciones</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    disabled={loading} 
                    placeholder="Ej: Mantener la espalda recta, codos a 45 grados..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (creatingRutina ? "Creando rutina..." : "Añadiendo...") : "Añadir ejercicio"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default RutinaEjercicioForm;
