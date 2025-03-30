
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanPago } from "@/hooks/entrenador/usePlanesPago";
import { Edit, Trash, ToggleLeft, ToggleRight } from "lucide-react";

interface PlanPagoCardProps {
  plan: PlanPago;
  onEdit: (plan: PlanPago) => void;
  onToggleActive: (plan: PlanPago) => void;
  onDelete: (plan: PlanPago) => void;
}

export const PlanPagoCard: React.FC<PlanPagoCardProps> = ({ 
  plan, 
  onEdit, 
  onToggleActive,
  onDelete
}) => {
  return (
    <Card className={`${!plan.activo ? 'opacity-75 bg-muted/50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{plan.nombre}</CardTitle>
            <CardDescription className="text-sm mt-1">
              Cada {plan.intervalo_dias} días
            </CardDescription>
          </div>
          <Badge variant={plan.activo ? "default" : "outline"}>
            {plan.activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-2xl font-bold">${plan.precio}</div>
        {plan.descripcion && (
          <p className="text-sm text-muted-foreground mt-2">{plan.descripcion}</p>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onToggleActive(plan)}>
          {plan.activo ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
          {plan.activo ? "Desactivar" : "Activar"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
          <Edit className="h-4 w-4 mr-1" /> Editar
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(plan)}
        >
          <Trash className="h-4 w-4 mr-1" /> Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
};
