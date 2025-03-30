
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Edit, RotateCcw, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Trainer, DeletedTrainer } from "@/types/admin";

interface TrainersTableProps {
  trainers: (Trainer | DeletedTrainer)[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  showDeleted: boolean;
  trainerToDelete: Trainer | null;
  trainerToPermanentDelete: DeletedTrainer | null;
  trainerToRestore: DeletedTrainer | null;
  setTrainerToDelete: (trainer: Trainer | null) => void;
  setTrainerToPermanentDelete: (trainer: DeletedTrainer | null) => void;
  setTrainerToRestore: (trainer: DeletedTrainer | null) => void;
  onEditTrainer: (trainer: Trainer) => void;
  onDeleteTrainer: () => void;
  onPermanentDeleteTrainer: () => void;
  onRestoreTrainer: () => void;
}

export const TrainersTable = ({
  trainers,
  isLoading,
  searchTerm,
  showDeleted,
  trainerToDelete,
  trainerToPermanentDelete,
  trainerToRestore,
  setTrainerToDelete,
  setTrainerToPermanentDelete,
  setTrainerToRestore,
  onEditTrainer,
  onDeleteTrainer,
  onPermanentDeleteTrainer,
  onRestoreTrainer
}: TrainersTableProps) => {
  // Format date with time
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Clientes</TableHead>
            <TableHead>{showDeleted ? "Eliminado" : "Registro"}</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </TableCell>
            </TableRow>
          ) : trainers && trainers.length > 0 ? (
            trainers.map((trainer) => (
              <TableRow key={trainer.id} className={trainer.deleted ? "bg-red-50" : ""}>
                <TableCell className="font-medium">
                  {trainer.name}
                  {trainer.deleted && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Eliminado
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{trainer.username}</TableCell>
                <TableCell>{trainer.email || "-"}</TableCell>
                <TableCell>{trainer.phone || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{trainer.clientCount}</Badge>
                </TableCell>
                <TableCell>
                  {showDeleted && 'deletedAt' in trainer
                    ? formatDateTime(trainer.deletedAt)
                    : trainer.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right flex justify-end space-x-2">
                  {!showDeleted ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTrainer(trainer as Trainer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setTrainerToDelete(trainer as Trainer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Enviar entrenador a papelera?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción moverá al entrenador {trainerToDelete?.name} a la papelera. 
                              Sus clientes quedarán sin entrenador asignado.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onDeleteTrainer}>Enviar a papelera</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTrainerToRestore(trainer as DeletedTrainer)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Restaurar entrenador?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción restaurará al entrenador {trainerToRestore?.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onRestoreTrainer}>Restaurar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setTrainerToPermanentDelete(trainer as DeletedTrainer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar permanentemente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente al entrenador {trainerToPermanentDelete?.name}. 
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onPermanentDeleteTrainer}>Eliminar permanentemente</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No se encontraron entrenadores
                {searchTerm && " con la búsqueda actual"}
                {showDeleted && " en la papelera"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
