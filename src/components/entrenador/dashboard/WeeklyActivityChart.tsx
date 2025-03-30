
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { WeeklyActivity } from "@/hooks/entrenador/useDashboardActivity";

interface WeeklyActivityChartProps {
  isLoading: boolean;
  weeklyActivity: WeeklyActivity | undefined;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border rounded-md shadow-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ isLoading, weeklyActivity }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Semanal</CardTitle>
        <CardDescription>Resumen de actividad de la última semana</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : weeklyActivity && weeklyActivity.workouts.length > 0 ? (
          <Tabs defaultValue="workouts">
            <TabsList className="mb-4">
              <TabsTrigger value="workouts">Ejercicios</TabsTrigger>
              <TabsTrigger value="meals">Comidas</TabsTrigger>
            </TabsList>
            <TabsContent value="workouts">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyActivity.workouts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Ejercicios Completados"
                      stroke="#8884d8" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="meals">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyActivity.meals}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Comidas Completadas"
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No hay datos de actividad disponibles para esta semana. A medida que tus clientes completen ejercicios, 
              verás sus estadísticas reflejadas aquí.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
