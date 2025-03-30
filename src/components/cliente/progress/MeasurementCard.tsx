
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

type MeasurementCardProps = {
  title: string;
  description?: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  change?: number | null;
  isPositiveGood?: boolean;
  isLoading: boolean;
};

const MeasurementCard = ({
  title,
  description = "Última medición",
  value,
  unit,
  icon,
  change = null,
  isPositiveGood = false,
  isLoading,
}: MeasurementCardProps) => {
  // Determine if change is positive, negative or neutral
  const getChangeColorClass = () => {
    if (change === null || change === 0) return "text-muted-foreground";
    if (isPositiveGood) {
      return change > 0 ? "text-green-600" : "text-red-600";
    } else {
      return change < 0 ? "text-green-600" : "text-red-600";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="h-5 w-5 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-24">
          {isLoading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : value !== null ? (
            <>
              <p className="text-4xl font-bold">
                {value} {unit}
              </p>
              {change !== null && (
                <p className={`text-sm flex items-center mt-2 ${getChangeColorClass()}`}>
                  <TrendingUp className="h-3 w-3 mr-1" /> {change > 0 ? "+" : ""}
                  {change} {unit} desde el inicio
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <p className="text-muted-foreground">Sin datos</p>
              <p className="text-xs text-muted-foreground mt-2">
                Registra tu primera medición
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MeasurementCard;
