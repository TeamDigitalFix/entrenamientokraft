
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CalendarDays, AlertTriangle, DollarSign, ArrowRight } from "lucide-react";
import { usePagos, Pago, PagoEstado } from "@/hooks/entrenador/usePagos";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export const PaymentAlerts = () => {
  const { dashboardStats, isLoadingStats, marcarComoPagado } = usePagos();
  
  const handleMarkAsPaid = (pagoId: string) => {
    if (!dashboardStats) return;
    
    const pago = [...dashboardStats.proximosPagos, ...dashboardStats.pagosAtrasados]
      .find(p => p.id === pagoId);
      
    if (pago) {
      marcarComoPagado(pago as Pago);
    }
  };

  if (isLoadingStats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-1" /> Alertas de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAlerts = dashboardStats && 
    (dashboardStats.proximosPagos.length > 0 || dashboardStats.pagosAtrasados.length > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <DollarSign className="h-5 w-5 mr-1" /> Alertas de Pagos
          {((dashboardStats?.atrasados || 0) > 0) && (
            <Badge variant="destructive" className="ml-2">
              {dashboardStats?.atrasados} Atrasados
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAlerts ? (
          <div className="text-center py-6">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground mt-2">No hay alertas de pago pendientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardStats?.pagosAtrasados.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-destructive" /> Pagos Atrasados
                </h3>
                <div className="space-y-2">
                  {dashboardStats.pagosAtrasados.map((pago) => (
                    <div 
                      key={pago.id} 
                      className="rounded-md border p-3 text-sm flex flex-col md:flex-row md:items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          {pago.suscripcion?.cliente.nombre} - ${pago.monto}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          Vencido el {format(parseISO(pago.fecha_programada), "PPP", { locale: es })}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsPaid(pago.id)}
                        >
                          Marcar Pagado
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {dashboardStats?.proximosPagos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-1" /> Próximos Pagos
                </h3>
                <div className="space-y-2">
                  {dashboardStats.proximosPagos.map((pago) => (
                    <div 
                      key={pago.id} 
                      className="rounded-md border p-3 text-sm flex flex-col md:flex-row md:items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          {pago.suscripcion?.cliente.nombre} - ${pago.monto}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          Programado para {format(parseISO(pago.fecha_programada), "PPP", { locale: es })}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsPaid(pago.id)}
                        >
                          Marcar Pagado
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button asChild variant="ghost" className="w-full mt-2">
              <Link to="/entrenador/pagos">
                Ver todos los pagos <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
