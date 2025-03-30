
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  UserX, 
  RefreshCw,
  Dumbbell
} from "lucide-react";
import { UserRole } from "@/types/index";
import { useClients, ClientData } from "@/hooks/entrenador/useClients";
import { ClientForm } from "@/components/entrenador/ClientForm";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const TrainerClients = () => {
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
    clientToDeactivate,
    setClientToDeactivate,
    createClient,
    updateClient,
    deactivateClient
  } = useClients(searchTerm);

  const handleOpenEditDialog = (client: ClientData) => {
    setEditClientData(client);
    setShowEditClientDialog(true);
  };

  // Formatear la fecha de último ingreso
  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
          <Button onClick={() => setShowNewClientDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
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
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">Cargando clientes...</TableCell>
                    </TableRow>
                  ) : clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">No se encontraron clientes</TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.nombre}</TableCell>
                        <TableCell>{client.email || "-"}</TableCell>
                        <TableCell>{client.telefono || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={client.eliminado ? "secondary" : "success"}>
                            {client.eliminado ? "Inactivo" : "Activo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatLastActive(client.actualizado_en)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Rutina">
                              <Dumbbell className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Editar"
                              onClick={() => handleOpenEditDialog(client)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Desactivar"
                              onClick={() => setClientToDeactivate(client.id as string)}
                              disabled={client.eliminado === true}
                            >
                              <UserX className="h-4 w-4 text-destructive" />
                            </Button>
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

      {/* Formulario para nuevo cliente */}
      <ClientForm 
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        title="Nuevo Cliente"
        clientData={newClientData}
        setClientData={setNewClientData}
        onSubmit={createClient}
      />

      {/* Formulario para editar cliente */}
      <ClientForm 
        open={showEditClientDialog}
        onOpenChange={setShowEditClientDialog}
        title="Editar Cliente"
        clientData={editClientData}
        setClientData={setEditClientData}
        onSubmit={updateClient}
        isEdit
      />

      {/* Diálogo de confirmación para desactivar cliente */}
      <AlertDialog open={!!clientToDeactivate} onOpenChange={(open) => !open && setClientToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará al cliente. Podrás reactivarlo más adelante si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => clientToDeactivate && deactivateClient(clientToDeactivate)}>
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TrainerClients;
