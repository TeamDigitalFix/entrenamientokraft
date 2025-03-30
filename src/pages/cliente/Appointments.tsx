
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { useClientAppointments, AppointmentRequest } from "@/hooks/cliente/useClientAppointments";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addHours } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Schema de validación para el formulario de solicitud de cita
const appointmentFormSchema = z.object({
  titulo: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  descripcion: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres" }),
  fecha: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: "Fecha inválida",
  }),
  duracion: z.coerce.number().min(15, { message: "La duración mínima es de 15 minutos" })
});

const ClientAppointments = () => {
  const { 
    upcomingAppointments, 
    pastAppointments, 
    isLoading, 
    isRequesting, 
    requestAppointment,
    cancelAppointment
  } = useClientAppointments();
  
  const [openRequestDialog, setOpenRequestDialog] = useState(false);

  // Configurar el formulario
  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      fecha: format(addHours(new Date(), 24), "yyyy-MM-dd'T'HH:mm"),
      duracion: 30
    },
  });

  // Manejar envío del formulario
  const onSubmit = async (values: z.infer<typeof appointmentFormSchema>) => {
    const appointmentData: AppointmentRequest = {
      titulo: values.titulo,
      descripcion: values.descripcion,
      fecha: new Date(values.fecha).toISOString(),
      duracion: values.duracion
    };

    const result = await requestAppointment(appointmentData);
    if (result) {
      setOpenRequestDialog(false);
      form.reset();
    }
  };

  // Función para obtener la etiqueta de estado
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            Pendiente de confirmación
          </span>
        );
      case "programada":
        return (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            Programada
          </span>
        );
      case "completada":
        return (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
            Completada
          </span>
        );
      case "cancelada":
        return (
          <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mis Citas</h1>
        <p className="text-muted-foreground">Gestiona tus citas programadas con tu entrenador</p>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Próximas Citas</CardTitle>
                <CardDescription>Citas programadas con tu entrenador</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{appointment.titulo}</p>
                          {getStatusBadge(appointment.estado)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {appointment.formattedDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Ver detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {appointment.titulo} {getStatusBadge(appointment.estado)}
                              </DialogTitle>
                              <DialogDescription>
                                {appointment.formattedDate} - Duración: {appointment.duracion} minutos
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <h4 className="text-sm font-medium mb-2">Descripción:</h4>
                              <p className="text-sm text-muted-foreground">
                                {appointment.descripcion || "Sin descripción"}
                              </p>
                            </div>
                            <div className="py-2">
                              <h4 className="text-sm font-medium mb-2">Entrenador:</h4>
                              <p className="text-sm text-muted-foreground">
                                {appointment.entrenador_nombre || "Sin asignar"}
                              </p>
                            </div>
                            <div className="py-2">
                              <h4 className="text-sm font-medium mb-2">Estado:</h4>
                              <p className="text-sm text-muted-foreground">
                                {appointment.estado === 'pendiente' ? 'Pendiente de confirmación' : 
                                 appointment.estado === 'programada' ? 'Programada' : 
                                 appointment.estado === 'completada' ? 'Completada' : 'Cancelada'}
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {(appointment.estado === "programada" || appointment.estado === "pendiente") && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="bg-destructive/10 hover:bg-destructive/20 border-destructive/20">
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Cancelarás tu cita {appointment.estado === "pendiente" ? "pendiente de confirmación" : "programada"}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Volver</AlertDialogCancel>
                                <AlertDialogAction onClick={() => cancelAppointment(appointment.id)}>
                                  Sí, cancelar cita
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No tienes citas programadas</p>
                </div>
              )}
              
              <Dialog open={openRequestDialog} onOpenChange={setOpenRequestDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4">Solicitar nueva cita</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Solicitar nueva cita</DialogTitle>
                    <DialogDescription>
                      Completa el formulario para solicitar una nueva cita con tu entrenador.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="titulo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Consulta de rutina" {...field} />
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
                                placeholder="Detalla el motivo de la cita" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fecha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha y hora</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormDescription>
                              Selecciona la fecha y hora que prefieras
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="duracion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duración (minutos)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit" disabled={isRequesting}>
                          {isRequesting ? "Solicitando..." : "Solicitar cita"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Historial de Citas</CardTitle>
                <CardDescription>Tus citas pasadas</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : pastAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pastAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{appointment.titulo}</p>
                          {getStatusBadge(appointment.estado)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {appointment.formattedDate}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Ver detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {appointment.titulo} {getStatusBadge(appointment.estado)}
                            </DialogTitle>
                            <DialogDescription>
                              {appointment.formattedDate} - Duración: {appointment.duracion} minutos
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <h4 className="text-sm font-medium mb-2">Descripción:</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.descripcion || "Sin descripción"}
                            </p>
                          </div>
                          <div className="py-2">
                            <h4 className="text-sm font-medium mb-2">Entrenador:</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.entrenador_nombre || "Sin asignar"}
                            </p>
                          </div>
                          <div className="py-2">
                            <h4 className="text-sm font-medium mb-2">Estado:</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.estado === 'pendiente' ? 'Pendiente de confirmación' : 
                               appointment.estado === 'completada' ? 'Completada' : 
                               appointment.estado === 'cancelada' ? 'Cancelada' : 'Programada'}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No tienes citas pasadas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientAppointments;
