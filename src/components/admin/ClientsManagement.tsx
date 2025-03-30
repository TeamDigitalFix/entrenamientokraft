
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ClientsTable } from "@/components/admin/ClientsTable";
import { AdminClientData } from "@/hooks/admin/useAdminClients";
import { AdminClientForm } from "@/components/admin/AdminClientForm";
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
import { Pencil, Plus, Search, UserX, RefreshCw, Trash } from "lucide-react";

interface ClientsManagementProps {
  clients: AdminClientData[];
  isLoading: boolean;
  searchTerm: string;
  page: number;
  pageSize: number;
  totalItems: number;
  showDeleted: boolean;
  setSearchTerm: (value: string) => void;
  setPage: (page: number) => void;
  setShowDeleted: (value: boolean) => void;
  showNewClientDialog: boolean;
  setShowNewClientDialog: (show: boolean) => void;
  showEditClientDialog: boolean;
  setShowEditClientDialog: (show: boolean) => void;
  newClientData: AdminClientData;
  setNewClientData: (data: AdminClientData) => void;
  editClientData: AdminClientData;
  setEditClientData: (data: AdminClientData) => void;
  clientToDelete: string | null;
  setClientToDelete: (id: string | null) => void;
  createClient: (data: AdminClientData) => void;
  updateClient: (data: AdminClientData) => void;
  deleteClient: (id: string) => void;
  restoreClient: (id: string) => void;
}

export const ClientsManagement: React.FC<ClientsManagementProps> = ({
  clients,
  isLoading,
  searchTerm,
  page,
  pageSize,
  totalItems,
  showDeleted,
  setSearchTerm,
  setPage,
  setShowDeleted,
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
  createClient,
  updateClient,
  deleteClient,
  restoreClient,
}) => {
  const handleEdit = (client: AdminClientData) => {
    setEditClientData({
      ...client,
      password: "", // Clear password for security
    });
    setShowEditClientDialog(true);
  };

  const handleDelete = (id: string) => {
    setClientToDelete(id);
  };

  const handleRestore = (id: string) => {
    restoreClient(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex w-full md:w-1/2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
            />
            <Label htmlFor="show-deleted" className="flex items-center">
              <Trash className="h-4 w-4 mr-1" />
              Mostrar eliminados
            </Label>
          </div>
          <Button onClick={() => setShowNewClientDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <ClientsTable
        clients={clients}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        setPage={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        showDeleted={showDeleted}
      />

      <AdminClientForm
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        title="Crear Nuevo Cliente"
        clientData={newClientData}
        setClientData={setNewClientData}
        onSubmit={createClient}
      />

      <AdminClientForm
        open={showEditClientDialog}
        onOpenChange={setShowEditClientDialog}
        title="Editar Cliente"
        clientData={editClientData}
        setClientData={setEditClientData}
        onSubmit={updateClient}
        isEdit={true}
      />

      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará al cliente como eliminado y no se mostrará en las listas por defecto.
              Puede restaurarlo más tarde si lo necesita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clientToDelete && deleteClient(clientToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
