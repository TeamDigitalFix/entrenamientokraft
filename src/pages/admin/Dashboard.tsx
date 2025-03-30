
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Dumbbell, Plus, Edit, Trash2, RefreshCw, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@/types";

// Tipo para los entrenadores
interface Trainer {
  id: string;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  clientCount: number;
  createdAt: Date;
}

// Tipo para las estadísticas
interface Stats {
  totalTrainers: number;
  activeTrainers: number;
  totalClients: number;
  clientsWithDiets: number;
  clientsWithRoutines: number;
  totalExercises: number;
  totalFoods: number;
}

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [newTrainerData, setNewTrainerData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: ""
  });
  const [editTrainerData, setEditTrainerData] = useState<Trainer | null>(null);
  const [showNewTrainerDialog, setShowNewTrainerDialog] = useState(false);
  const [showEditTrainerDialog, setShowEditTrainerDialog] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Consulta de estadísticas generales
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // Contar entrenadores
        const { data: trainers, error: trainersError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('role', 'entrenador')
          .eq('eliminado', false);
        
        if (trainersError) throw trainersError;
        
        // Contar clientes
        const { data: clients, error: clientsError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('role', 'cliente')
          .eq('eliminado', false);
        
        if (clientsError) throw clientsError;
        
        // Contar clientes con dietas
        const { data: clientsWithDiets, error: dietsError } = await supabase
          .from('dietas')
          .select('cliente_id')
          .distinct();
        
        if (dietsError) throw dietsError;
        
        // Contar clientes con rutinas
        const { data: clientsWithRoutines, error: routinesError } = await supabase
          .from('rutinas')
          .select('cliente_id')
          .distinct();
        
        if (routinesError) throw routinesError;
        
        // Contar ejercicios
        const { data: exercises, error: exercisesError } = await supabase
          .from('ejercicios')
          .select('id');
        
        if (exercisesError) throw exercisesError;
        
        // Contar alimentos
        const { data: foods, error: foodsError } = await supabase
          .from('alimentos')
          .select('id');
        
        if (foodsError) throw foodsError;
        
        const stats: Stats = {
          totalTrainers: trainers?.length || 0,
          activeTrainers: trainers?.length || 0, // Todos los no eliminados se consideran activos
          totalClients: clients?.length || 0,
          clientsWithDiets: clientsWithDiets?.length || 0,
          clientsWithRoutines: clientsWithRoutines?.length || 0,
          totalExercises: exercises?.length || 0,
          totalFoods: foods?.length || 0
        };
        
        return stats;
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        toast.error("Error al cargar estadísticas");
        return {
          totalTrainers: 0,
          activeTrainers: 0,
          totalClients: 0,
          clientsWithDiets: 0,
          clientsWithRoutines: 0,
          totalExercises: 0,
          totalFoods: 0
        };
      }
    }
  });

  // Consulta de entrenadores
  const { data: trainers, isLoading: trainersLoading, refetch: refetchTrainers } = useQuery({
    queryKey: ['admin-trainers', page, searchTerm],
    queryFn: async () => {
      try {
        // Consulta básica de entrenadores
        let query = supabase
          .from('usuarios')
          .select('id, username, nombre, email, telefono, creado_en')
          .eq('role', 'entrenador')
          .eq('eliminado', false);
        
        // Aplicar búsqueda si hay término
        if (searchTerm) {
          query = query.or(`nombre.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        
        // Aplicar paginación
        const from = (page - 1) * pageSize;
        query = query.range(from, from + pageSize - 1);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Para cada entrenador, contar sus clientes
        const trainersWithClientCount = await Promise.all(
          (data || []).map(async (trainer) => {
            const { data: clients, error: clientsError } = await supabase
              .from('usuarios')
              .select('id')
              .eq('role', 'cliente')
              .eq('entrenador_id', trainer.id)
              .eq('eliminado', false);
            
            if (clientsError) {
              console.error("Error al contar clientes:", clientsError);
              return {
                id: trainer.id,
                username: trainer.username,
                name: trainer.nombre,
                email: trainer.email,
                phone: trainer.telefono,
                clientCount: 0,
                createdAt: new Date(trainer.creado_en)
              };
            }
            
            return {
              id: trainer.id,
              username: trainer.username,
              name: trainer.nombre,
              email: trainer.email,
              phone: trainer.telefono,
              clientCount: clients?.length || 0,
              createdAt: new Date(trainer.creado_en)
            };
          })
        );
        
        return trainersWithClientCount;
      } catch (error) {
        console.error("Error al obtener entrenadores:", error);
        toast.error("Error al cargar entrenadores");
        return [];
      }
    }
  });

  // Consulta de actividad reciente (últimos 5 registros)
  const { data: recentActivity, isLoading: activityLoading, refetch: refetchActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      try {
        // Obtener los últimos 5 usuarios creados (de cualquier rol)
        const { data: recentUsers, error: usersError } = await supabase
          .from('usuarios')
          .select('id, nombre, role, creado_en')
          .order('creado_en', { ascending: false })
          .limit(5);
        
        if (usersError) throw usersError;
        
        return recentUsers.map(user => ({
          type: 'user',
          title: `Nuevo ${user.role === 'entrenador' ? 'entrenador' : user.role === 'cliente' ? 'cliente' : 'administrador'} registrado`,
          description: `${user.nombre} se unió al sistema`,
          date: new Date(user.creado_en)
        }));
      } catch (error) {
        console.error("Error al obtener actividad reciente:", error);
        toast.error("Error al cargar actividad reciente");
        return [];
      }
    }
  });

  // Función para crear un nuevo entrenador
  const createTrainer = async () => {
    try {
      // Validar datos
      if (!newTrainerData.username || !newTrainerData.password || !newTrainerData.name) {
        toast.error("Por favor completa los campos obligatorios");
        return;
      }
      
      // Verificar si el username ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('username', newTrainerData.username)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingUser) {
        toast.error("El nombre de usuario ya está en uso");
        return;
      }
      
      // Insertar nuevo entrenador
      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            username: newTrainerData.username,
            password: newTrainerData.password,
            role: 'entrenador',
            nombre: newTrainerData.name,
            email: newTrainerData.email || null,
            telefono: newTrainerData.phone || null
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Entrenador creado exitosamente");
      setShowNewTrainerDialog(false);
      
      // Limpiar formulario
      setNewTrainerData({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: ""
      });
      
      // Refrescar datos
      refetchTrainers();
      refetchStats();
      refetchActivity();
    } catch (error) {
      console.error("Error al crear entrenador:", error);
      toast.error("Error al crear el entrenador");
    }
  };

  // Función para actualizar un entrenador
  const updateTrainer = async () => {
    if (!editTrainerData) return;
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nombre: editTrainerData.name,
          email: editTrainerData.email,
          telefono: editTrainerData.phone
        })
        .eq('id', editTrainerData.id)
        .select();
      
      if (error) throw error;
      
      toast.success("Entrenador actualizado exitosamente");
      setShowEditTrainerDialog(false);
      refetchTrainers();
    } catch (error) {
      console.error("Error al actualizar entrenador:", error);
      toast.error("Error al actualizar el entrenador");
    }
  };

  // Función para eliminar un entrenador (soft delete)
  const deleteTrainer = async () => {
    if (!trainerToDelete) return;
    
    try {
      // Primero, reasignar los clientes de este entrenador (ponerlos sin entrenador asignado)
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ entrenador_id: null })
        .eq('entrenador_id', trainerToDelete.id);
      
      if (updateError) throw updateError;
      
      // Luego, marcar al entrenador como eliminado
      const { error: deleteError } = await supabase
        .from('usuarios')
        .update({ eliminado: true })
        .eq('id', trainerToDelete.id);
      
      if (deleteError) throw deleteError;
      
      toast.success("Entrenador eliminado exitosamente");
      setTrainerToDelete(null);
      
      // Refrescar datos
      refetchTrainers();
      refetchStats();
    } catch (error) {
      console.error("Error al eliminar entrenador:", error);
      toast.error("Error al eliminar el entrenador");
    }
  };

  // Refrescar todos los datos
  const refreshData = () => {
    refetchStats();
    refetchTrainers();
    refetchActivity();
    toast.info("Datos actualizados");
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <Button onClick={refreshData} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar datos
          </Button>
        </div>
        
        <Tabs defaultValue="dashboard" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="trainers">Entrenadores</TabsTrigger>
          </TabsList>
          
          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Entrenadores</CardTitle>
                    <Users size={20} className="text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.totalTrainers}</div>
                    <p className="text-xs text-muted-foreground">
                      {statsLoading ? "..." : stats?.activeTrainers} activos
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                    <Users size={20} className="text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.totalClients}</div>
                    <p className="text-xs text-muted-foreground">
                      {statsLoading ? "..." : `${stats?.clientsWithRoutines} con rutinas, ${stats?.clientsWithDiets} con dietas`}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Ejercicios</CardTitle>
                    <Dumbbell size={20} className="text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.totalExercises}</div>
                    <p className="text-xs text-muted-foreground">
                      En la base de datos
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Alimentos</CardTitle>
                    <Dumbbell size={20} className="text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsLoading ? "..." : stats?.totalFoods}</div>
                    <p className="text-xs text-muted-foreground">
                      En la base de datos
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Actividad Reciente */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="text-center py-4">Cargando actividad reciente...</div>
                  ) : recentActivity && recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="border-b pb-4 last:border-0">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">No hay actividad reciente</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Gestión de Entrenadores */}
          <TabsContent value="trainers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestión de Entrenadores</CardTitle>
                  <CardDescription>Administra a los entrenadores del sistema</CardDescription>
                </div>
                <Dialog open={showNewTrainerDialog} onOpenChange={setShowNewTrainerDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Nuevo Entrenador
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Entrenador</DialogTitle>
                      <DialogDescription>
                        Completa el formulario para agregar un nuevo entrenador al sistema.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username*
                        </Label>
                        <Input
                          id="username"
                          value={newTrainerData.username}
                          onChange={(e) => setNewTrainerData({...newTrainerData, username: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          Contraseña*
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={newTrainerData.password}
                          onChange={(e) => setNewTrainerData({...newTrainerData, password: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nombre*
                        </Label>
                        <Input
                          id="name"
                          value={newTrainerData.name}
                          onChange={(e) => setNewTrainerData({...newTrainerData, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newTrainerData.email}
                          onChange={(e) => setNewTrainerData({...newTrainerData, email: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                          Teléfono
                        </Label>
                        <Input
                          id="phone"
                          value={newTrainerData.phone}
                          onChange={(e) => setNewTrainerData({...newTrainerData, phone: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewTrainerDialog(false)}>Cancelar</Button>
                      <Button onClick={createTrainer}>Crear Entrenador</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar entrenadores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-[250px]"
                    />
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Clientes</TableHead>
                        <TableHead>Fecha Registro</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainersLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Cargando entrenadores...
                          </TableCell>
                        </TableRow>
                      ) : trainers && trainers.length > 0 ? (
                        trainers.map((trainer) => (
                          <TableRow key={trainer.id}>
                            <TableCell className="font-medium">{trainer.name}</TableCell>
                            <TableCell>{trainer.username}</TableCell>
                            <TableCell>{trainer.email || "-"}</TableCell>
                            <TableCell>{trainer.phone || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{trainer.clientCount}</Badge>
                            </TableCell>
                            <TableCell>{trainer.createdAt.toLocaleDateString()}</TableCell>
                            <TableCell className="text-right flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditTrainerData(trainer);
                                  setShowEditTrainerDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setTrainerToDelete(trainer)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar entrenador?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción eliminará al entrenador {trainerToDelete?.name}. 
                                      Sus clientes quedarán sin entrenador asignado.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={deleteTrainer}>Eliminar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No se encontraron entrenadores
                            {searchTerm && " con la búsqueda actual"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Paginación */}
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!trainers || trainers.length < pageSize}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Diálogo de Edición de Entrenador */}
            <Dialog open={showEditTrainerDialog} onOpenChange={setShowEditTrainerDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Entrenador</DialogTitle>
                  <DialogDescription>
                    Actualiza la información del entrenador.
                  </DialogDescription>
                </DialogHeader>
                {editTrainerData && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-name" className="text-right">
                        Nombre
                      </Label>
                      <Input
                        id="edit-name"
                        value={editTrainerData.name}
                        onChange={(e) => setEditTrainerData({...editTrainerData, name: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editTrainerData.email || ""}
                        onChange={(e) => setEditTrainerData({...editTrainerData, email: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-phone" className="text-right">
                        Teléfono
                      </Label>
                      <Input
                        id="edit-phone"
                        value={editTrainerData.phone || ""}
                        onChange={(e) => setEditTrainerData({...editTrainerData, phone: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditTrainerDialog(false)}>Cancelar</Button>
                  <Button onClick={updateTrainer}>Guardar Cambios</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
