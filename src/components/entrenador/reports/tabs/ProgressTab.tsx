
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Scale } from "lucide-react";
import { useProgress } from "@/hooks/cliente/useProgress";
import MeasurementCard from "@/components/cliente/progress/MeasurementCard";
import MeasurementTable from "@/components/cliente/progress/MeasurementTable";
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface ProgressTabProps {
  clientId: string;
}

const ProgressTab: React.FC<ProgressTabProps> = ({ clientId }) => {
  const { 
    measurements, 
    isLoadingMeasurements,
    chartData
  } = useProgress(clientId);

  if (isLoadingMeasurements) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!measurements || measurements.length === 0) {
    return (
      <div className="text-center py-8">
        <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay datos de progreso disponibles para este cliente</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MeasurementCard 
          title="Peso"
          value={measurements[0]?.peso || null}
          unit="kg"
          icon={<Scale />}
          isLoading={isLoadingMeasurements}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Progreso</CardTitle>
          <CardDescription>Historial de mediciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Peso (kg)"
                  />
                  <Line type="monotone" dataKey="grasa" stroke="#82ca9d" name="Grasa (%)" />
                  <Line type="monotone" dataKey="musculo" stroke="#ffc658" name="Músculo (%)" />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No hay suficientes datos para mostrar el gráfico</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <MeasurementTable measurements={measurements} />
    </div>
  );
};

export default ProgressTab;
