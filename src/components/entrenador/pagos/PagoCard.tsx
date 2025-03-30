
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pago } from "@/hooks/entrenador/usePagos";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Edit, Check, AlertCircle, FileText, CreditCard } from "lucide-react";

interface PagoCardProps {
  pago: Pago;
  onEdit: (pago: Pago) => void;
  onMarkAsPaid: (pago: Pago) => void;
}

export const PagoCard: React.FC<PagoCardProps> = ({ 
  pago, 
  onEdit, 
  onMarkAsPaid
}) => {
  const today = new Date();
  const isPastDue = isBefore(parseISO(pago.fecha_programada), today) && pago.estado === "pendiente";
  const isUpcoming = isAfter(parseISO(pago.fecha_programada), today) && 
                    isBefore(parseISO(pago.fecha_programada), new Date(today.setDate(today.getDate() + 7))) && 
                    pago.estado === "pendiente";

  const getBadgeVariant = () => {
    switch (pago.estado) {
      case "pagado": return "outline";
      case "atrasado": return "destructive";
      case "cancelado": return "secondary";
      case "pendiente": return isPastDue ? "destructive" : (isUpcoming ? "warning" : "default");
      default: return "default";
    }
  };

  const getStatusText = () => {
    switch (pago.estado) {
      case "pagado": return "Pagado";
      case "atrasado": return "Atrasado";
      case "cancelado": return "Cancelado";
      case "pendiente": return isPastDue ? "Vencido" : (isUpcoming ? "Próximo" : "Pendiente");
      default: return pago.estado;
    }
  };

  const StatusIcon = () => {
    if (pago.estado === "pagado") return <Check className="h-4 w-4" />;
    if (pago.estado === "atrasado" || isPastDue) return <AlertCircle className="h-4 w-4" />;
    return null;
  };

  return (
    <Card className={`${pago.estado === "cancelado" ? 'opacity-75 bg-muted/50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">
              {pago.suscripcion ? `${pago.suscripcion.cliente.nombre}` : 'Cliente'}
              <span className="text-sm ml-2 font-normal text-muted-foreground">
                ({pago.suscripcion ? pago.suscripcion.plan.nombre : 'Plan'})
              </span>
            </CardTitle>
            <CardDescription className="text-sm mt-1 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {format(parseISO(pago.fecha_programada), "PPP", { locale: es })}
            </CardDescription>
          </div>
          <Badge variant={getBadgeVariant()} className="flex items-center gap-1">
            <StatusIcon />
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">${pago.monto}</span>
          {pago.fecha_pago && (
            <span className="text-xs text-muted-foreground">
              Pagado el {format(parseISO(pago.fecha_pago), "PPP", { locale: es })}
            </span>
          )}
        </div>
        {pago.metodo_pago && (
          <div className="text-sm mt-1 flex items-center text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5 mr-1" />
            {pago.metodo_pago}
          </div>
        )}
        {pago.notas && (
          <div className="text-sm mt-2 flex items-start">
            <FileText className="h-3.5 w-3.5 mr-1 mt-0.5" />
            <span className="text-muted-foreground">{pago.notas}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-end gap-2">
        {(pago.estado === "pendiente" || pago.estado === "atrasado") && (
          <Button variant="default" size="sm" onClick={() => onMarkAsPaid(pago)}>
            <Check className="h-4 w-4 mr-1" /> Marcar Pagado
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onEdit(pago)}>
          <Edit className="h-4 w-4 mr-1" /> Editar
        </Button>
      </CardFooter>
    </Card>
  );
};
