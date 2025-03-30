
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  CheckSquare,
  XSquare
} from "lucide-react";
import { UserRole } from "@/types/index";
import { useCitas } from "@/hooks/entrenador/useCitas";
import { CitaForm } from "@/components/entrenador/CitaForm";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, isToday } from "date-fns";
import { es } from "date-fns/locale";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TrainerAppointments = () => {
  const { user } = useAuth();
  const entrenadorId = user?.id || "";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedCitaId, setSelectedCitaId] = useState<string | null>(null);
  
  const {
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedDate,
    setSelectedDate,
    filteredCitas,
    selectedTab,
    setSelectedTab,
    crearCita,
    actualizarCita,
    completarCita,
    cancelarCita,
    aceptarSolicitud,
    rechazarSolicitud,
    getCitasPorFecha,
    formatearFecha,
    formatearHora,
  } = useCitas(entrenadorId);

  // Obtener la cita seleccionada para editar o cancelar
  const selectedCita = filteredCitas.find(cita => cita.id === selectedCitaId);
  
  // Citas para el día actual o seleccionado
  const citasHoy = getCitasPorFecha(new Date());
  
  // Citas para el día seleccionado en el calendario
  const citasFechaSeleccionada = selectedDate 
    ? getCitasPorFecha(selectedDate)
    : [];

  const handleCompletarCita = async (id: string) => {
    await completarCita(id);
  };

  const handleCancelarCita = async () => {
    if (selectedCitaId) {
      await cancelarCita(selectedCitaId);
      setShowCancelDialog(false);
      setSelectedCitaId(null);
    }
  };

  const handleRechazarSolicitud = async () => {
    if (selectedCitaId) {
      await rechazarSolicitud(selectedCitaId);
      setShowRejectDialog(false);
      setSelectedCitaId(null);
    }
  };

  const handleAceptarSolicitud = async (id: string) => {
    await aceptarSolicitud(id);
  };

  const openEditForm = (id: string) => {
    setSelectedCitaId(id);
    setShowEditForm(true);
  };

  const openCancelDialog = (id: string) => {
    setSelectedCitaId(id);
    setShowCancelDialog(true);
  };

  const openRejectDialog = (id: string) => {
    setSelectedCitaId(id);
    setShowRejectDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programada": return "success";
      case "completada": return "secondary";
      case "cancelada": return "destructive";
      case "pendiente": return "warning";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "programada": return "Programada";
      case "completada": return "Completada";
      case "cancelada": return "Cancelada";
      case "pendiente": return "Solicitud pendiente";
      default: return status;
    }
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Citas</h1>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="pending">Solicitudes</TabsTrigger>
                  <TabsTrigger value="today">Hoy</TabsTrigger>
                  <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                  <TabsTrigger value="past">Pasadas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por cliente, tipo..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="w-[120px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                              Cargando citas...
                            </TableCell>
                          </TableRow>
                        ) : filteredCitas.length > 0 ? (
                          filteredCitas.map((cita) => (
                            <TableRow key={cita.id}>
                              <TableCell className="font-medium">{cita.cliente?.nombre}</TableCell>
                              <TableCell>{formatearFecha(cita.fecha)}</TableCell>
                              <TableCell>{formatearHora(cita.fecha)}</TableCell>
                              <TableCell>{cita.tipo || cita.titulo}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusColor(cita.estado) as any}>
                                  {getStatusText(cita.estado)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {cita.estado === "pendiente" ? (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Aceptar solicitud"
                                        onClick={() => handleAceptarSolicitud(cita.id)}
                                      >
                                        <CheckSquare className="h-4 w-4 text-success" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Rechazar solicitud"
                                        onClick={() => openRejectDialog(cita.id)}
                                      >
                                        <XSquare className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </>
                                  ) : cita.estado === "programada" && (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Completar"
                                        onClick={() => handleCompletarCita(cita.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 text-success" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Editar"
                                        onClick={() => openEditForm(cita.id)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Cancelar"
                                        onClick={() => openCancelDialog(cita.id)}
                                      >
                                        <XCircle className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                              No hay citas disponibles
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                {/* NUEVA PESTAÑA: Solicitudes pendientes */}
                <TabsContent value="pending">
                  <div className="space-y-4">
                    {filteredCitas.length > 0 ? (
                      filteredCitas.map((cita) => (
                        <Card key={cita.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{cita.cliente?.nombre}</h3>
                                <p className="text-sm text-muted-foreground">{cita.tipo || cita.titulo}</p>
                                <div className="flex flex-col mt-2">
                                  <div className="flex items-center">
                                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span className="text-sm">{formatearFecha(cita.fecha)}</span>
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span className="text-sm">{formatearHora(cita.fecha)}</span>
                                  </div>
                                  {cita.descripcion && (
                                    <div className="mt-2 p-2 bg-muted/50 rounded-md">
                                      <p className="text-sm">{cita.descripcion}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
                                  onClick={() => handleAceptarSolicitud(cita.id)}
                                >
                                  <CheckSquare className="h-4 w-4 mr-1" />
                                  Aceptar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20"
                                  onClick={() => openRejectDialog(cita.id)}
                                >
                                  <XSquare className="h-4 w-4 mr-1" />
                                  Rechazar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No hay solicitudes pendientes</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="today">
                  <div className="space-y-4">
                    {filteredCitas.length > 0 ? (
                      filteredCitas.map((cita) => (
                        <Card key={cita.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{cita.cliente?.nombre}</h3>
                                <p className="text-sm text-muted-foreground">{cita.tipo || cita.titulo}</p>
                                <div className="flex items-center mt-2">
                                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span className="text-sm">{formatearHora(cita.fecha)}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCompletarCita(cita.id)}
                                >
                                  Completar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditForm(cita.id)}
                                >
                                  Editar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No hay citas para hoy</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="upcoming">
                  <div className="space-y-4">
                    {filteredCitas.length > 0 ? (
                      filteredCitas.map((cita) => (
                        <Card key={cita.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{cita.cliente?.nombre}</h3>
                                <p className="text-sm text-muted-foreground">{cita.tipo || cita.titulo}</p>
                                <div className="flex flex-col mt-2">
                                  <div className="flex items-center">
                                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span className="text-sm">{formatearFecha(cita.fecha)}</span>
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span className="text-sm">{formatearHora(cita.fecha)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditForm(cita.id)}
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openCancelDialog(cita.id)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No hay citas próximas</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="past">
                  <div className="space-y-4">
                    {filteredCitas.length > 0 ? (
                      filteredCitas.map((cita) => (
                        <Card key={cita.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{cita.cliente?.nombre}</h3>
                                <p className="text-sm text-muted-foreground">{cita.tipo || cita.titulo}</p>
                                <div className="flex flex-col mt-2">
                                  <div className="flex items-center">
                                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span className="text-sm">{formatearFecha(cita.fecha)}</span>
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span className="text-sm">{formatearHora(cita.fecha)}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant={getStatusColor(cita.estado) as any}>
                                {getStatusText(cita.estado)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No hay citas pasadas</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Calendario</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                locale={es}
              />
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">
                  {selectedDate 
                    ? isToday(selectedDate) 
                      ? "Citas para hoy" 
                      : `Citas para ${format(selectedDate, "PPP", { locale: es })}`
                    : "Citas para hoy"
                  }
                </h3>
                {(selectedDate ? citasFechaSeleccionada : citasHoy).length > 0 ? (
                  <div className="space-y-2">
                    {(selectedDate ? citasFechaSeleccionada : citasHoy)
                      .filter(cita => cita.estado === "programada" || cita.estado === "pendiente")
                      .map((cita) => (
                        <div key={cita.id} className="flex justify-between items-center p-2 rounded-md border">
                          <div>
                            <p className="font-medium">{cita.cliente?.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatearHora(cita.fecha)} - {cita.tipo || cita.titulo}
                            </p>
                          </div>
                          <Badge variant={cita.estado === "pendiente" ? "warning" : "outline"}>
                            {cita.estado === "pendiente" ? "Pendiente" : formatearHora(cita.fecha)}
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay citas para este día</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showCreateForm && (
        <CitaForm
          tipo="crear"
          entrenadorId={entrenadorId}
          onSubmit={crearCita}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {showEditForm && selectedCita && (
        <CitaForm
          tipo="editar"
          cita={selectedCita}
          entrenadorId={entrenadorId}
          onSubmit={(data) => actualizarCita(selectedCita.id, data)}
          onCancel={() => {
            setShowEditForm(false);
            setSelectedCitaId(null);
          }}
        />
      )}

      {/* Diálogo para cancelar una cita */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Cita</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCitaId(null)}>
              No, mantener
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelarCita} className="bg-destructive text-destructive-foreground">
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para rechazar una solicitud */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar Solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas rechazar esta solicitud de cita? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCitaId(null)}>
              No, mantener
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRechazarSolicitud} className="bg-destructive text-destructive-foreground">
              Sí, rechazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TrainerAppointments;
