
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  RotateCcw,
  Dumbbell,
  Utensils,
  RotateCw
} from "lucide-react";
import { UserRole } from "@/types/index";
import { useClients, ClientData } from "@/hooks/entrenador/useClients";
import { ClientForm } from "@/components/entrenador/ClientForm";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const TrainerClients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const {
    clients,
    isLoading,
    refetch,
    showNewClientDialog,
    setShowNewClientDialog,
    showEditClientDialog,
    setShowEditClientDialog,
    newClientData,
    setNewClientData,
    editClientData,
    setEditClientData,
    clientToDelete,
    setClientToDelete,
    clientToReset,
    setClientToReset,
    createClient,
    updateClient,
    deleteClient,
    recoverClient,
    resetClientData
  } = useClients(searchTerm);

  useEffect(() => {
    setShowNewClientDialog(false);
    setShowEditClientDialog(false);
    setClientToDelete(null);
    setClientToReset(null);
    
    return () => {
      setShowNewClientDialog(false);
      setShowEditClientDialog(false);
      setClientToDelete(null);
      setClientToReset(null);
    };
  }, [setShowNewClientDialog, setShowEditClientDialog, setClientToDelete, setClientToReset]);

  const handleCreateClient = (data: ClientData) => {
    createClient(data);
  };

  const handleUpdateClient = (data: ClientData) => {
    updateClient(data);
  };

  const handleOpenEditDialog = (client: ClientData) => {
    setEditClientData({
      ...client,
      password: "" // No enviamos la contraseña actual para que tenga que escribir una nueva si quiere cambiarla
    });
    setShowEditClientDialog(true);
  };

  const handleDeleteClient = (clientId: string) => {
    setClientToDelete(clientId);
  };

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
    }
  };

  const handleRecoverClient = (clientId: string) => {
    recoverClient(clientId);
  };

  const handleResetClient = (clientId: string) => {
    setClientToReset(clientId);
  };

  const confirmResetClient = () => {
    if (clientToReset) {
      resetClientData(clientToReset);
    }
  };

  const navigateToRoutine = (clientId: string) => {
    navigate(`/entrenador/cliente/${clientId}/rutina`);
  };

  const navigateToDiet = (clientId: string) => {
    navigate(`/entrenador/cliente/${clientId}/dieta`);
  };

  const formatLastLogin = (date: string | null) => {
    if (!date) return "Nunca";
    
    try {
      return `hace ${formatDistanceToNow(new Date(date), { locale: es })}`;
    } catch (error) {
      return "Fecha inválida";
    }
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
          <Button onClick={() => setShowNewClientDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Mis Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Ingreso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Cargando clientes...
                      </TableCell>
                    </TableRow>
                  ) : clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No se encontraron clientes
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.nombre}</TableCell>
                        <TableCell>{client.email || "—"}</TableCell>
                        <TableCell>{client.telefono || "—"}</TableCell>
                        <TableCell>
                          {client.eliminado ? (
                            <Badge variant="destructive">Eliminado</Badge>
                          ) : (
                            <Badge variant="success">Activo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatLastLogin(client.ultimo_ingreso)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {!client.eliminado ? (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  title="Rutina"
                                  onClick={() => navigateToRoutine(client.id!)}
                                >
                                  <Dumbbell className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  title="Dieta"
                                  onClick={() => navigateToDiet(client.id!)}
                                >
                                  <Utensils className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  title="Editar"
                                  onClick={() => handleOpenEditDialog(client)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  title="Eliminar"
                                  onClick={() => handleDeleteClient(client.id!)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  title="Restablecer datos"
                                  onClick={() => handleResetClient(client.id!)}
                                >
                                  <RotateCw className="h-4 w-4 text-amber-500" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="icon" 
                                title="Recuperar"
                                onClick={() => handleRecoverClient(client.id!)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ClientForm
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        title="Crear Nuevo Cliente"
        clientData={newClientData}
        setClientData={setNewClientData}
        onSubmit={handleCreateClient}
      />

      <ClientForm
        open={showEditClientDialog}
        onOpenChange={setShowEditClientDialog}
        title="Editar Cliente"
        clientData={editClientData}
        setClientData={setEditClientData}
        onSubmit={handleUpdateClient}
        isEdit={true}
      />

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al cliente seleccionado. Podrás recuperarlo después si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClient} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!clientToReset} onOpenChange={(open) => !open && setClientToReset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restablecer datos del cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los datos del cliente (rutinas, dietas, mensajes, citas, progresos, etc.), 
              pero mantendrá su cuenta activa. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetClient} className="bg-amber-500 text-white hover:bg-amber-600">
              Restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TrainerClients;
