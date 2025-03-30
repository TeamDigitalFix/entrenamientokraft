
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { NuevaCita, Cita } from "@/hooks/entrenador/useCitas";

// Definir el esquema de validación
const citaSchema = z.object({
  cliente_id: z.string().min(1, "El cliente es requerido"),
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  fecha: z.date({
    required_error: "La fecha es requerida",
  }),
  hora: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
  duracion: z.number().min(15, "La duración mínima es de 15 minutos"),
  tipo: z.string().optional(),
});

type CitaFormProps = {
  tipo: "crear" | "editar";
  cita?: Cita;
  entrenadorId: string;
  onSubmit: (cita: NuevaCita) => Promise<any>;
  onCancel: () => void;
};

type Cliente = {
  id: string;
  nombre: string;
};

export const CitaForm = ({
  tipo,
  cita,
  entrenadorId,
  onSubmit,
  onCancel,
}: CitaFormProps) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Configurar el formulario
  const form = useForm<z.infer<typeof citaSchema>>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      cliente_id: cita?.cliente_id || "",
      titulo: cita?.titulo || "",
      descripcion: cita?.descripcion || "",
      fecha: cita ? new Date(cita.fecha) : new Date(),
      hora: cita ? format(new Date(cita.fecha), "HH:mm") : "09:00",
      duracion: cita?.duracion || 60,
      tipo: cita?.tipo || "",
    },
  });

  // Cargar clientes del entrenador
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("id, nombre")
          .eq("role", "cliente")
          .eq("entrenador_id", entrenadorId);

        if (error) throw error;

        setClientes(data || []);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        });
      }
    };

    fetchClientes();
  }, [entrenadorId, toast]);

  // Manejar el envío del formulario
  const handleSubmit = async (values: z.infer<typeof citaSchema>) => {
    setIsLoading(true);
    try {
      // Combinar fecha y hora
      const fechaHora = new Date(values.fecha);
      const [horas, minutos] = values.hora.split(":");
      fechaHora.setHours(parseInt(horas), parseInt(minutos));

      const nuevaCita: NuevaCita = {
        entrenador_id: entrenadorId,
        cliente_id: values.cliente_id,
        titulo: values.titulo,
        descripcion: values.descripcion || null,
        fecha: fechaHora.toISOString(),
        duracion: values.duracion,
        estado: "programada",
        tipo: values.tipo,
      };

      await onSubmit(nuevaCita);
      onCancel();
    } catch (error) {
      console.error("Error al guardar cita:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la cita",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tipo === "crear" ? "Nueva Cita" : "Editar Cita"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
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
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título de la cita" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Evaluación inicial">
                        Evaluación inicial
                      </SelectItem>
                      <SelectItem value="Evaluación mensual">
                        Evaluación mensual
                      </SelectItem>
                      <SelectItem value="Sesión de entrenamiento">
                        Sesión de entrenamiento
                      </SelectItem>
                      <SelectItem value="Ajuste de rutina">
                        Ajuste de rutina
                      </SelectItem>
                      <SelectItem value="Consulta de nutrición">
                        Consulta de nutrición
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la cita"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP", {
                                locale: es,
                              })
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
                name="hora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="time"
                          placeholder="HH:MM"
                          {...field}
                        />
                        <Clock className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duracion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (minutos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={15}
                      step={15}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Guardando..."
                  : tipo === "crear"
                  ? "Crear Cita"
                  : "Actualizar Cita"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
