
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Tipos de comida
const tiposComida = [
  { value: "Desayuno", label: "Desayuno" },
  { value: "Media mañana", label: "Media mañana" },
  { value: "Almuerzo", label: "Almuerzo" },
  { value: "Merienda", label: "Merienda" },
  { value: "Cena", label: "Cena" },
  { value: "Post-entrenamiento", label: "Post-entrenamiento" },
  { value: "Pre-entrenamiento", label: "Pre-entrenamiento" },
];

interface DietaComidaFormProps {
  clienteId: string;
  dietaId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface AlimentoOption {
  id: string;
  nombre: string;
  categoria: string;
  calorias: number;
}

const DietaComidaForm = ({
  clienteId,
  dietaId,
  onCancel,
  onSuccess,
}: DietaComidaFormProps) => {
  const { toast } = useToast();
  const [alimentos, setAlimentos] = useState<AlimentoOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [creandoDieta, setCreandoDieta] = useState(false);
  const [selectedFoodCalories, setSelectedFoodCalories] = useState<number | null>(null);

  const form = useForm({
    defaultValues: {
      alimento_id: "",
      tipo_comida: "Desayuno",
      dia: "Lunes",
      cantidad: 100, // en gramos por defecto
      hora: "08:00",
    },
  });

  // Cargar alimentos disponibles
  useEffect(() => {
    const fetchAlimentos = async () => {
      try {
        const { data, error } = await supabase
          .from("alimentos")
          .select("id, nombre, categoria, calorias");

        if (error) throw error;
        setAlimentos(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `No se pudieron cargar los alimentos: ${error.message}`,
          variant: "destructive",
        });
      }
    };

    fetchAlimentos();
  }, [toast]);

  // Actualizar calorías cuando se selecciona un alimento
  const handleAlimentoChange = (alimentoId: string) => {
    const alimento = alimentos.find(a => a.id === alimentoId);
    if (alimento) {
      setSelectedFoodCalories(alimento.calorias);
    } else {
      setSelectedFoodCalories(null);
    }
    form.setValue("alimento_id", alimentoId);
  };

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      let dieta_id = dietaId;

      // Si no existe una dieta, crear una nueva
      if (!dieta_id) {
        setCreandoDieta(true);
        const { data: nuevaDieta, error: dietaError } = await supabase
          .from("dietas")
          .insert({
            cliente_id: clienteId,
            nombre: "Plan alimenticio personalizado",
            fecha_inicio: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (dietaError) throw dietaError;
        dieta_id = nuevaDieta.id;
        setCreandoDieta(false);
      }

      // Mapear el día de la semana a un número para la base de datos
      const diaNumero = diasSemana.findIndex(d => d.value === values.dia) + 1;

      // Insertar la comida en la dieta
      const { error: comidaError } = await supabase
        .from("dieta_comidas")
        .insert({
          dieta_id,
          alimento_id: values.alimento_id,
          tipo_comida: values.tipo_comida,
          cantidad: values.cantidad,
          dia: diaNumero,
        });

      if (comidaError) throw comidaError;

      toast({
        title: "Comida añadida",
        description: "La comida ha sido añadida a la dieta correctamente.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `No se pudo añadir la comida: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular calorías totales según la cantidad
  const calculatedCalories = selectedFoodCalories 
    ? Math.round((selectedFoodCalories * form.watch("cantidad")) / 100) 
    : null;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Añadir comida a la dieta</DialogTitle>
        <DialogDescription>
          Selecciona un alimento y completa la información para añadirlo a la dieta del cliente.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="alimento_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alimento*</FormLabel>
                <Select
                  onValueChange={handleAlimentoChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un alimento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {alimentos.map((alimento) => (
                      <SelectItem key={alimento.id} value={alimento.id}>
                        {alimento.nombre} - {alimento.categoria} ({alimento.calorias} kcal/100g)
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
              name="tipo_comida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de comida*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposComida.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
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
              name="hora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <FormField
            control={form.control}
            name="cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad (gramos)*</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      disabled={loading}
                      min={1}
                    />
                  </FormControl>
                  {calculatedCalories && (
                    <span className="text-sm text-muted-foreground">
                      {calculatedCalories} kcal
                    </span>
                  )}
                </div>
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
              {loading ? (creandoDieta ? "Creando dieta..." : "Añadiendo...") : "Añadir comida"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default DietaComidaForm;
