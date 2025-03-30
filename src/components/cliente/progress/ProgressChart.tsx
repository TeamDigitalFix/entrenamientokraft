
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ChartDataPoint } from "@/types/progress";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";

type ProgressChartProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: ChartDataPoint[];
  dataKeys: string[];
  chartConfig: Record<string, any>;
  isLoading: boolean;
  onAddClick: () => void;
};

const ProgressChart = ({
  title,
  description,
  icon,
  data,
  dataKeys,
  chartConfig,
  isLoading,
  onAddClick,
}: ProgressChartProps) => {
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
        <div className="h-72">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Cargando gráfica...</p>
            </div>
          ) : data.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    fontSize={12}
                  />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelClassName="font-medium text-xs"
                        labelKey={dataKeys[0]}
                      />
                    }
                  />
                  <Legend />
                  {dataKeys.map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={chartConfig[key]?.color}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                      name={chartConfig[key]?.label}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <Info className="h-12 w-12 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">
                No hay datos suficientes para mostrar la gráfica
              </p>
              <Button variant="outline" size="sm" onClick={onAddClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar primera medición
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
