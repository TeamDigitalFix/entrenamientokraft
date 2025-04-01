
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useClients } from "@/hooks/entrenador/useClients";
import { useProgress } from "@/hooks/cliente/useProgress";

interface OverviewTabProps {
  clientId: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ clientId }) => {
  const { clients } = useClients();
  const client = clients.find(c => c.id === clientId);
  const { measurements, latestMeasurement } = useProgress(clientId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Nombre:</strong> {client?.nombre || 'N/A'}</p>
          <p><strong>Email:</strong> {client?.email || 'N/A'}</p>
          <p><strong>Teléfono:</strong> {client?.telefono || 'N/A'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Peso actual:</strong> {latestMeasurement?.peso || 'N/A'} kg</p>
          <p><strong>Grasa corporal:</strong> {latestMeasurement?.grasa_corporal || 'N/A'}%</p>
          <p><strong>Masa muscular:</strong> {latestMeasurement?.masa_muscular || 'N/A'} kg</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
