
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import { AdminClientData } from "@/hooks/admin/useAdminClients";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientsTableProps {
  clients: AdminClientData[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  showDeleted: boolean;
  setPage: (page: number) => void;
  onEdit: (client: AdminClientData) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  isLoading,
  page,
  pageSize,
  totalItems,
  showDeleted,
  setPage,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const formatLastLogin = (date: string | null) => {
    if (!date) return "Nunca";
    try {
      return `Hace ${formatDistanceToNow(new Date(date), { locale: es })}`;
    } catch (error) {
      return "Fecha inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Entrenador</TableHead>
            <TableHead>Último Ingreso</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No se encontraron clientes
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.nombre}</TableCell>
                <TableCell>{client.username}</TableCell>
                <TableCell>{client.email || "-"}</TableCell>
                <TableCell>{client.entrenador_nombre || "Sin asignar"}</TableCell>
                <TableCell>{formatLastLogin(client.ultimo_ingreso)}</TableCell>
                <TableCell>
                  {client.eliminado ? (
                    <Badge variant="destructive">Eliminado</Badge>
                  ) : (
                    <Badge variant="outline">Activo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {!client.eliminado && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(client)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {client.eliminado ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRestore(client.id!)}
                        title="Restaurar"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPermanentDelete(client.id!)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(client.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end space-x-2 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
