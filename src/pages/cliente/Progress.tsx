
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, TrendingUp, Scale, Percent, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ClientProgress = () => {
  // Datos de ejemplo para las gráficas
  const progressData = [
    { name: 'Semana 1', peso: 75, grasa: 20 },
    { name: 'Semana 2', peso: 74.2, grasa: 19.5 },
    { name: 'Semana 3', peso: 73.5, grasa: 19 },
    { name: 'Semana 4', peso: 72.8, grasa: 18.5 },
    { name: 'Semana 5', peso: 72, grasa: 18 },
    { name: 'Semana 6', peso: 71.5, grasa: 17.5 },
    { name: 'Semana 7', peso: 71, grasa: 17 },
    { name: 'Semana 8', peso: 70.5, grasa: 16.5 },
  ];

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mi Progreso</h1>
        <p className="text-muted-foreground">Visualiza y haz seguimiento de tus avances</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Peso Actual</CardTitle>
                <CardDescription>Última medición</CardDescription>
              </div>
              <Scale className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-4xl font-bold">70.5 kg</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" /> -4.5 kg desde el inicio
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Grasa Corporal</CardTitle>
                <CardDescription>Última medición</CardDescription>
              </div>
              <Percent className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-4xl font-bold">16.5%</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" /> -3.5% desde el inicio
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Masa Muscular</CardTitle>
                <CardDescription>Última medición</CardDescription>
              </div>
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-4xl font-bold">35%</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" /> +2.5% desde el inicio
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Evolución del Peso</CardTitle>
                <CardDescription>Últimas 8 semanas</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={progressData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="peso" stroke="#3b82f6" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Evolución de Grasa Corporal</CardTitle>
                <CardDescription>Últimas 8 semanas</CardDescription>
              </div>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={progressData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="grasa" stroke="#ef4444" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Registrar Nueva Medición</CardTitle>
              <CardDescription>Actualiza tus mediciones corporales</CardDescription>
            </div>
            <Scale className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button className="w-full mt-2">Registrar Medición</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientProgress;
