
import React, { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ProgressMeasurement } from "@/types/progress";
import { Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type MeasurementTableProps = {
  measurements: ProgressMeasurement[];
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
};

const MeasurementTable = ({ 
  measurements, 
  onDelete,
  isDeleting = false
}: MeasurementTableProps) => {
  const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(null);
  
  const handleDelete = () => {
    if (measurementToDelete && onDelete) {
      onDelete(measurementToDelete);
      setMeasurementToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setMeasurementToDelete(id);
  };

  const cancelDelete = () => {
    setMeasurementToDelete(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Peso (kg)</TableHead>
              <TableHead>Grasa (%)</TableHead>
              <TableHead>Músculo (%)</TableHead>
              <TableHead>Notas</TableHead>
              {onDelete && <TableHead className="w-[80px]">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {measurements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onDelete ? 6 : 5} className="text-center py-6 text-muted-foreground">
                  No hay mediciones registradas
                </TableCell>
              </TableRow>
            ) : (
              measurements.map((measurement) => (
                <TableRow key={measurement.id}>
                  <TableCell>
                    {format(new Date(measurement.fecha), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>{measurement.peso}</TableCell>
                  <TableCell>{measurement.grasa_corporal || "-"}</TableCell>
                  <TableCell>{measurement.masa_muscular || "-"}</TableCell>
                  <TableCell className="max-w-sm truncate">
                    {measurement.notas || "-"}
                  </TableCell>
                  {onDelete && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => confirmDelete(measurement.id)}
                        disabled={isDeleting}
                        title="Eliminar medición"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!measurementToDelete} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la medición seleccionada y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MeasurementTable;
