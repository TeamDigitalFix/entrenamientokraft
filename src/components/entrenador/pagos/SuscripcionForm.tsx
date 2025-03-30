
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/hooks/entrenador/useClients";
import { PlanPago, usePlanesPago } from "@/hooks/entrenador/usePlanesPago";
import { Suscripcion, SuscripcionInput } from "@/hooks/entrenador/useSuscripciones";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const suscripcionSchema = z.object({
  cliente_id: z.string().uuid({ message: "Seleccione un cliente" }),
  plan_id: z.string().uuid({ message: "Seleccione un plan" }),
  fecha_inicio: z.date({ required_error: "Seleccione una fecha de inicio" }),
  fecha_fin: z.date().nullable().optional(),
  notas: z.string().nullable().optional(),
  activo: z.boolean().default(true)
});

type SuscripcionFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SuscripcionInput) => void;
  isSubmitting: boolean;
  initialData?: Suscripcion | null;
};

export const SuscripcionForm = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData
}: SuscripcionFormProps) => {
  const { clients, isLoading: isLoadingClientes } = useClients();
  const { planes, isLoading: isLoadingPlanes } = usePlanesPago();
  const [selectedPlan, setSelectedPlan] = useState<PlanPago | null>(null);

  const form = useForm<z.infer<typeof suscripcionSchema>>({
    resolver: zodResolver(suscripcionSchema),
    defaultValues: {
      cliente_id: initialData?.cliente_id || "",
      plan_id: initialData?.plan_id || "",
      fecha_inicio: initialData?.fecha_inicio ? parseISO(initialData.fecha_inicio) : new Date(),
      fecha_fin: initialData?.fecha_fin ? parseISO(initialData.fecha_fin) : null,
      notas: initialData?.notas || "",
      activo: initialData?.activo !== undefined ? initialData.activo : true
    }
  });

  useEffect(() => {
    const planId = form.watch("plan_id");
    if (planId && planes) {
      const plan = planes.find(p => p.id === planId);
      setSelectedPlan(plan || null);
    }
  }, [form.watch("plan_id"), planes]);

  const handleSubmit = (data: z.infer<typeof suscripcionSchema>) => {
    onSubmit({
      cliente_id: data.cliente_id,
      plan_id: data.plan_id,
      fecha_inicio: format(data.fecha_inicio, 'yyyy-MM-dd'),
      fecha_fin: data.fecha_fin ? format(data.fecha_fin, 'yyyy-MM-dd') : null,
      notas: data.notas,
      activo: data.activo
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Suscripción" : "Crear Nueva Suscripción"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingClientes}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map((cliente) => (
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
              name="plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan de Pago</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingPlanes}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {planes?.filter(p => p.activo).map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.nombre} - ${plan.precio} / {plan.intervalo_dias} días
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPlan && (
              <div className="bg-muted/50 p-3 rounded-md text-sm">
                <p><strong>Plan:</strong> {selectedPlan.nombre}</p>
                <p><strong>Precio:</strong> ${selectedPlan.precio}</p>
                <p><strong>Intervalo:</strong> Cada {selectedPlan.intervalo_dias} días</p>
                {selectedPlan.descripcion && <p><strong>Descripción:</strong> {selectedPlan.descripcion}</p>}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="fecha_inicio"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fecha de Inicio</FormLabel>
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
                name="fecha_fin"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fecha de Fin (opcional)</FormLabel>
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
                              <span>Sin fecha de fin</span>
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
                          disabled={(date) => date < form.watch("fecha_inicio")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Suscripción Activa</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Suscripción"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
