
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Suscripcion } from "@/hooks/entrenador/useSuscripciones";

const generarPagosSchema = z.object({
  cantidad: z.coerce.number().int().min(1, { message: "Debe generar al menos 1 pago" }).max(12, { message: "Máximo 12 pagos a la vez" })
});

type GenerarPagosFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cantidad: number) => void;
  isSubmitting: boolean;
  suscripcion: Suscripcion | null;
};

export const GenerarPagosForm = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  suscripcion
}: GenerarPagosFormProps) => {
  const form = useForm<z.infer<typeof generarPagosSchema>>({
    resolver: zodResolver(generarPagosSchema),
    defaultValues: {
      cantidad: 3
    }
  });

  const handleSubmit = (data: z.infer<typeof generarPagosSchema>) => {
    onSubmit(data.cantidad);
  };

  // Prevent rendering the dialog content if suscripcion is null
  if (!suscripcion) {
    return null;
  }

  return (
    <Dialog open={isOpen && !!suscripcion} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Generar Pagos Futuros
          </DialogTitle>
        </DialogHeader>
        <div className="bg-muted/50 p-3 rounded-md text-sm mb-4">
          <p><strong>Cliente:</strong> {suscripcion.cliente.nombre}</p>
          <p><strong>Plan:</strong> {suscripcion.plan.nombre}</p>
          <p><strong>Monto por pago:</strong> ${suscripcion.plan.precio}</p>
          <p><strong>Intervalo:</strong> Cada {suscripcion.plan.intervalo_dias} días</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cantidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad de Pagos a Generar</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="12" {...field} />
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
                {isSubmitting ? "Generando..." : "Generar Pagos"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
