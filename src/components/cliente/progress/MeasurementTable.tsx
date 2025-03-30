
import React from "react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ProgressMeasurement } from "@/types/progress";

type MeasurementTableProps = {
  measurements: ProgressMeasurement[];
};

const MeasurementTable = ({ measurements }: MeasurementTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Peso (kg)</TableHead>
            <TableHead>Grasa (%)</TableHead>
            <TableHead>Músculo (%)</TableHead>
            <TableHead>Notas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {measurements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MeasurementTable;
