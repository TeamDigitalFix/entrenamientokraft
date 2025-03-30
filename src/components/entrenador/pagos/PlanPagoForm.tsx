
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlanPago } from "@/hooks/entrenador/usePlanesPago";
import { Switch } from "@/components/ui/switch";

const planPagoSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido" }),
  descripcion: z.string().nullable().optional(),
  precio: z.coerce.number().positive({ message: "El precio debe ser mayor que 0" }),
  intervalo_dias: z.coerce.number().int().positive({ message: "El intervalo debe ser mayor que 0" }),
  activo: z.boolean().default(true)
});

type PlanPagoFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof planPagoSchema>) => void;
  isSubmitting: boolean;
  initialData?: PlanPago | null;
};

export const PlanPagoForm = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData
}: PlanPagoFormProps) => {
  const form = useForm<z.infer<typeof planPagoSchema>>({
    resolver: zodResolver(planPagoSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      descripcion: initialData?.descripcion || "",
      precio: initialData?.precio || 0,
      intervalo_dias: initialData?.intervalo_dias || 30,
      activo: initialData?.activo !== undefined ? initialData.activo : true
    }
  });

  const handleSubmit = (data: z.infer<typeof planPagoSchema>) => {
    onSubmit({
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      intervalo_dias: data.intervalo_dias,
      activo: data.activo
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Plan de Pago" : "Crear Nuevo Plan de Pago"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Plan</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Plan Mensual" {...field} />
                  </FormControl>
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
                      placeholder="Descripción del plan..." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="precio"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intervalo_dias"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Intervalo (días)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
