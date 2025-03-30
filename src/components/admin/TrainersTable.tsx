
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
import { Edit, Trash2 } from "lucide-react";
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
import { Trainer } from "@/types/admin";

interface TrainersTableProps {
  trainers: Trainer[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  trainerToDelete: Trainer | null;
  setTrainerToDelete: (trainer: Trainer | null) => void;
  onEditTrainer: (trainer: Trainer) => void;
  onDeleteTrainer: () => void;
}

export const TrainersTable = ({
  trainers,
  isLoading,
  searchTerm,
  trainerToDelete,
  setTrainerToDelete,
  onEditTrainer,
  onDeleteTrainer
}: TrainersTableProps) => {
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
            <TableHead>Fecha Registro</TableHead>
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
                    onClick={() => onEditTrainer(trainer)}
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
                        <AlertDialogAction onClick={onDeleteTrainer}>Eliminar</AlertDialogAction>
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
  );
};
