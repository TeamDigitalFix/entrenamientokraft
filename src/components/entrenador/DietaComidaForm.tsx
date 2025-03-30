
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const tiposComida = [
  { value: "Desayuno", label: "Desayuno" },
  { value: "Media mañana", label: "Media mañana" },
  { value: "Almuerzo", label: "Almuerzo" },
  { value: "Merienda", label: "Merienda" },
  { value: "Cena", label: "Cena" },
  { value: "Pre-entrenamiento", label: "Pre-entrenamiento" },
  { value: "Post-entrenamiento", label: "Post-entrenamiento" },
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
  const [creatingDieta, setCreatingDieta] = useState(false);
  const [selectedAlimento, setSelectedAlimento] = useState<AlimentoOption | null>(null);

  const form = useForm({
    defaultValues: {
      alimento_id: "",
      fecha: new Date(),
      tipo_comida: "Desayuno",
      cantidad: 100,
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

  // Actualizar información del alimento cuando se selecciona
  const handleAlimentoChange = (alimentoId: string) => {
    const alimento = alimentos.find(a => a.id === alimentoId);
    setSelectedAlimento(alimento || null);
    form.setValue("alimento_id", alimentoId);
  };

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      let dieta_id = dietaId;

      // Si no existe una dieta, crear una nueva
      if (!dieta_id) {
        setCreatingDieta(true);
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
        setCreatingDieta(false);
      }

      // Format the date as a string (YYYY-MM-DD)
      const formattedDate = format(values.fecha, "yyyy-MM-dd");

      // Insertar la comida en la dieta
      const { error: comidaError } = await supabase
        .from("dieta_comidas")
        .insert({
          dieta_id,
          alimento_id: values.alimento_id,
          tipo_comida: values.tipo_comida,
          cantidad: values.cantidad,
          dia: formattedDate, // Store the date as a string
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
        <DialogTitle>Añadir comida a la dieta</DialogTitle>
        <DialogDescription>
          Selecciona un alimento y completa la información para añadirlo al plan alimenticio del cliente.
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
                      <SelectValue placeholder="Selecciona un tipo" />
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
            name="cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad (g)*</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      disabled={loading}
                      min={1}
                    />
                    {selectedAlimento && (
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {Math.round((selectedAlimento.calorias * field.value) / 100)} kcal
                      </div>
                    )}
                  </div>
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
              {loading ? (creatingDieta ? "Creando dieta..." : "Añadiendo...") : "Añadir comida"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default DietaComidaForm;
