
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pago, PagoInput, PagoEstado } from "@/hooks/entrenador/usePagos";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Suscripcion, useSuscripciones } from "@/hooks/entrenador/useSuscripciones";

const pagoSchema = z.object({
  suscripcion_id: z.string().uuid({ message: "Seleccione una suscripción" }),
  fecha_programada: z.date({ required_error: "Seleccione una fecha programada" }),
  fecha_pago: z.date().nullable().optional(),
  monto: z.coerce.number().positive({ message: "El monto debe ser mayor que 0" }),
  metodo_pago: z.string().nullable().optional(),
  notas: z.string().nullable().optional(),
  estado: z.enum(["pendiente", "pagado", "atrasado", "cancelado"]).default("pendiente")
});

type PagoFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PagoInput) => void;
  isSubmitting: boolean;
  initialData?: Pago | null;
  suscripcionId?: string;
};

export const PagoForm = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  suscripcionId
}: PagoFormProps) => {
  const { suscripciones, isLoading: isLoadingSuscripciones } = useSuscripciones();

  // Find the subscription from initialData or suscripcionId
  const subscriptionFromId = suscripciones?.find(s => s.id === (initialData?.suscripcion_id || suscripcionId));

  const form = useForm<z.infer<typeof pagoSchema>>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      suscripcion_id: initialData?.suscripcion_id || suscripcionId || "",
      fecha_programada: initialData?.fecha_programada ? parseISO(initialData.fecha_programada) : new Date(),
      fecha_pago: initialData?.fecha_pago ? parseISO(initialData.fecha_pago) : null,
      monto: initialData?.monto || (subscriptionFromId?.plan?.precio || 0),
      metodo_pago: initialData?.metodo_pago || "",
      notas: initialData?.notas || "",
      estado: initialData?.estado || "pendiente"
    }
  });

  const handleSubmit = (data: z.infer<typeof pagoSchema>) => {
    onSubmit({
      suscripcion_id: data.suscripcion_id,
      fecha_programada: format(data.fecha_programada, 'yyyy-MM-dd'),
      fecha_pago: data.fecha_pago ? format(data.fecha_pago, 'yyyy-MM-dd') : null,
      monto: data.monto,
      estado: data.estado as PagoEstado,
      metodo_pago: data.metodo_pago,
      notas: data.notas
    });
  };

  // Auto-select the subscription price when subscription changes
  React.useEffect(() => {
    const currentSuscripcionId = form.watch("suscripcion_id");
    if (currentSuscripcionId && suscripciones) {
      const suscripcion = suscripciones.find(s => s.id === currentSuscripcionId);
      if (suscripcion && suscripcion.plan) {
        form.setValue("monto", suscripcion.plan.precio);
      }
    }
  }, [form.watch("suscripcion_id"), suscripciones, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Pago" : "Crear Nuevo Pago"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="suscripcion_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suscripción</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingSuscripciones || !!suscripcionId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una suscripción" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suscripciones?.filter(s => s.activo).map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.cliente.nombre} - {sub.plan.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="fecha_programada"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fecha Programada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha</span>
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
                name="monto"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="fecha_pago"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fecha de Pago (dejar vacío si aún no pagado)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Sin fecha de pago</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
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
                name="metodo_pago"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Método de Pago</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej. Efectivo, Transferencia..." 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange as (value: string) => void}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales..." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Pago"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
