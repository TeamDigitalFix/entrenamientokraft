
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
}

const tiposComida = [
  "Desayuno",
  "Media mañana",
  "Almuerzo",
  "Merienda",
  "Cena",
  "Pre-entrenamiento",
  "Post-entrenamiento",
];

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

  const form = useForm({
    defaultValues: {
      alimento_id: "",
      tipo_comida: "Desayuno",
      fecha: new Date(),
      cantidad: 100,
    },
  });

  // Cargar alimentos disponibles
  useEffect(() => {
    const fetchAlimentos = async () => {
      try {
        const { data, error } = await supabase
          .from("alimentos")
          .select("id, nombre, categoria");

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

      // Convert date to YYYY-MM-DD format
      const formattedDate = format(values.fecha, "yyyy-MM-dd");
      
      // Insert the meal into the diet
      const { error: comidaError } = await supabase
        .from("dieta_comidas")
        .insert({
          dieta_id,
          alimento_id: values.alimento_id,
          tipo_comida: values.tipo_comida,
          cantidad: values.cantidad,
          dia: formattedDate, // Store the date in YYYY-MM-DD format as text
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

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Añadir alimento a la dieta</DialogTitle>
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
                  onValueChange={field.onChange}
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
                        {alimento.nombre} - {alimento.categoria}
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
                      <SelectValue placeholder="Selecciona el tipo de comida" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposComida.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
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
            name="fecha"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={loading}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad (en gramos)*</FormLabel>
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

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (creandoDieta ? "Creando dieta..." : "Añadiendo...") : "Añadir alimento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default DietaComidaForm;
