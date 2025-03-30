
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
  Clock
} from "lucide-react";

const TrainerAppointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Datos de ejemplo (en producción, vendrían de Supabase)
  const appointments = [
    { id: 1, clientName: "Ana Martínez", date: "2023-11-15", time: "14:30", status: "scheduled", type: "Evaluación mensual" },
    { id: 2, clientName: "Carlos Rodríguez", date: "2023-11-15", time: "16:00", status: "scheduled", type: "Ajuste de rutina" },
    { id: 3, clientName: "Laura García", date: "2023-11-16", time: "10:00", status: "scheduled", type: "Sesión de entrenamiento" },
    { id: 4, clientName: "Pedro Sánchez", date: "2023-11-17", time: "18:30", status: "scheduled", type: "Consulta de nutrición" },
    { id: 5, clientName: "María López", date: "2023-11-18", time: "15:00", status: "canceled", type: "Evaluación inicial" },
  ];

  const filteredAppointments = appointments.filter(appointment => 
    appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayAppointments = appointments.filter(appointment => 
    appointment.date === "2023-11-15" && appointment.status === "scheduled"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "success";
      case "completed": return "secondary";
      case "canceled": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <DashboardLayout allowedRoles={["entrenador"]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Citas</h1>
          <Button>
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
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
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
                        {filteredAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">{appointment.clientName}</TableCell>
                            <TableCell>{appointment.date}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>{appointment.type}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(appointment.status) as any}>
                                {appointment.status === "scheduled" ? "Programada" : 
                                 appointment.status === "completed" ? "Completada" : "Cancelada"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" title="Completar">
                                  <CheckCircle className="h-4 w-4 text-success" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Cancelar">
                                  <XCircle className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="today">
                  <div className="space-y-4">
                    {todayAppointments.length > 0 ? (
                      todayAppointments.map((appointment) => (
                        <Card key={appointment.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{appointment.clientName}</h3>
                                <p className="text-sm text-muted-foreground">{appointment.type}</p>
                                <div className="flex items-center mt-2">
                                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span className="text-sm">{appointment.time}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">Completar</Button>
                                <Button variant="outline" size="sm">Editar</Button>
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
                  <p className="text-center text-muted-foreground py-4">Selecciona una fecha para ver las citas próximas</p>
                </TabsContent>
                
                <TabsContent value="past">
                  <p className="text-center text-muted-foreground py-4">Selecciona una fecha para ver las citas pasadas</p>
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
              />
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Citas para hoy</h3>
                {todayAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {todayAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex justify-between items-center p-2 rounded-md border">
                        <div>
                          <p className="font-medium">{appointment.clientName}</p>
                          <p className="text-xs text-muted-foreground">{appointment.time} - {appointment.type}</p>
                        </div>
                        <Badge variant="outline">{appointment.time}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay citas para hoy</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerAppointments;
