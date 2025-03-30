
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Suscripcion } from "@/hooks/entrenador/useSuscripciones";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Edit, ToggleLeft, ToggleRight, CalendarDays, DollarSign } from "lucide-react";

interface SuscripcionCardProps {
  suscripcion: Suscripcion;
  onEdit: (suscripcion: Suscripcion) => void;
  onToggleActive: (suscripcion: Suscripcion) => void;
  onViewPayments: (suscripcion: Suscripcion) => void;
}

export const SuscripcionCard: React.FC<SuscripcionCardProps> = ({ 
  suscripcion, 
  onEdit, 
  onToggleActive,
  onViewPayments
}) => {
  return (
    <Card className={`${!suscripcion.activo ? 'opacity-75 bg-muted/50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{suscripcion.cliente.nombre}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {suscripcion.plan.nombre} - ${suscripcion.plan.precio} cada {suscripcion.plan.intervalo_dias} días
            </CardDescription>
          </div>
          <Badge variant={suscripcion.activo ? "default" : "outline"}>
            {suscripcion.activo ? "Activa" : "Inactiva"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm space-y-1">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /> 
            <span>Inicio: {format(parseISO(suscripcion.fecha_inicio), "PPP", { locale: es })}</span>
          </div>
          {suscripcion.fecha_fin && (
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" /> 
              <span>Fin: {format(parseISO(suscripcion.fecha_fin), "PPP", { locale: es })}</span>
            </div>
          )}
          {suscripcion.notas && (
            <p className="text-sm text-muted-foreground mt-2 italic">{suscripcion.notas}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewPayments(suscripcion)}>
          <DollarSign className="h-4 w-4 mr-1" /> Ver Pagos
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onToggleActive(suscripcion)}>
          {suscripcion.activo ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
          {suscripcion.activo ? "Desactivar" : "Activar"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(suscripcion)}>
          <Edit className="h-4 w-4 mr-1" /> Editar
        </Button>
      </CardFooter>
    </Card>
  );
};
