
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const TrainerReports = () => {
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("month");
  
  // Datos de ejemplo para los gráficos
  const clientActivityData = [
    { name: "Lun", sesiones: 3, ejercicios: 24 },
    { name: "Mar", sesiones: 2, ejercicios: 16 },
    { name: "Mié", sesiones: 4, ejercicios: 32 },
    { name: "Jue", sesiones: 3, ejercicios: 20 },
    { name: "Vie", sesiones: 5, ejercicios: 40 },
    { name: "Sáb", sesiones: 1, ejercicios: 10 },
    { name: "Dom", sesiones: 0, ejercicios: 0 },
  ];
  
  const clientProgressData = [
    { name: "Semana 1", peso: 75, grasa: 20 },
    { name: "Semana 2", peso: 74.2, grasa: 19.5 },
    { name: "Semana 3", peso: 73.5, grasa: 19 },
    { name: "Semana 4", peso: 72.8, grasa: 18.5 },
    { name: "Semana 5", peso: 72, grasa: 18 },
    { name: "Semana 6", peso: 71.5, grasa: 17.5 },
    { name: "Semana 7", peso: 71, grasa: 17 },
    { name: "Semana 8", peso: 70.5, grasa: 16.5 },
  ];
  
  const clientDistributionData = [
    { name: "Activos", value: 12 },
    { name: "Inactivos", value: 3 },
  ];
  
  const exerciseDistributionData = [
    { name: "Pectoral", value: 25 },
    { name: "Espalda", value: 20 },
    { name: "Piernas", value: 30 },
    { name: "Brazos", value: 15 },
    { name: "Core", value: 10 },
  ];
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <DashboardLayout allowedRoles={["entrenador"]}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Informes y Estadísticas</h1>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                <SelectItem value="1">Ana Martínez</SelectItem>
                <SelectItem value="2">Carlos Rodríguez</SelectItem>
                <SelectItem value="3">Laura García</SelectItem>
                <SelectItem value="4">Pedro Sánchez</SelectItem>
                <SelectItem value="5">María López</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Rango de fechas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
            
            <Button>Generar informe</Button>
          </div>
        </div>
        
        <Tabs defaultValue="activity">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="activity"><BarChart className="h-4 w-4 mr-2" /> Actividad</TabsTrigger>
            <TabsTrigger value="progress"><LineChart className="h-4 w-4 mr-2" /> Progreso</TabsTrigger>
            <TabsTrigger value="distribution"><PieChart className="h-4 w-4 mr-2" /> Distribución</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      width={500}
                      height={300}
                      data={clientActivityData}
                      margin={{
                        top: 20,
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
                      <Bar dataKey="sesiones" name="Sesiones" fill="#8884d8" />
                      <Bar dataKey="ejercicios" name="Ejercicios" fill="#82ca9d" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Sesiones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↑ 12%</span> vs. período anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ejercicios Completados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">↑ 8%</span> vs. período anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-red-500">↓ 3%</span> vs. período anterior
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Progreso de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      width={500}
                      height={300}
                      data={clientProgressData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="peso" name="Peso (kg)" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="grasa" name="% Grasa Corporal" stroke="#82ca9d" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Reducción Media de Peso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-4.5 kg</div>
                  <p className="text-xs text-muted-foreground mt-1">En el último trimestre</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Reducción % Grasa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-3.5%</div>
                  <p className="text-xs text-muted-foreground mt-1">En el último trimestre</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Aumento Masa Muscular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2.2 kg</div>
                  <p className="text-xs text-muted-foreground mt-1">En el último trimestre</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart width={400} height={300}>
                        <Pie
                          data={clientDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {clientDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Ejercicios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart width={400} height={300}>
                        <Pie
                          data={exerciseDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {exerciseDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cliente Más Activo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">Ana Martínez</div>
                  <p className="text-xs text-muted-foreground mt-1">12 sesiones este mes</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ejercicio Más Popular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">Sentadilla</div>
                  <p className="text-xs text-muted-foreground mt-1">Usado en 85% de las rutinas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Mayor Progreso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">Carlos Rodríguez</div>
                  <p className="text-xs text-muted-foreground mt-1">-6.5kg en 3 meses</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TrainerReports;
