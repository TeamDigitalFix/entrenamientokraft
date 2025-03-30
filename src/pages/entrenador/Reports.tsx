
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
import { UserRole } from "@/types/index";
import { useReportes } from "@/hooks/entrenador/useReportes";
import { Skeleton } from "@/components/ui/skeleton";

const TrainerReports = () => {
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("month");
  
  const {
    activityData,
    progressData,
    clientDistributionData,
    exerciseDistributionData,
    clientsList,
    activityStats,
    progressStats,
    topPerformers,
    isLoading,
    generateReport
  } = useReportes(selectedClient, dateRange);
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const handleGenerateReport = () => {
    generateReport(selectedClient, dateRange);
  };

  // Verificar si hay datos para mostrar
  const hasActivityData = activityData && activityData.length > 0;
  const hasProgressData = progressData && progressData.length > 0;
  const hasDistributionData = clientDistributionData && clientDistributionData.length > 0;

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
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
                {clientsList.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.nombre}</SelectItem>
                ))}
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
            
            <Button onClick={handleGenerateReport}>Generar informe</Button>
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
                {isLoading ? (
                  <div className="h-[400px]">
                    <Skeleton className="w-full h-full" />
                  </div>
                ) : hasActivityData ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        width={500}
                        height={300}
                        data={activityData}
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
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">No hay datos de actividad disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Sesiones</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-12" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{activityStats?.totalSesiones || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className={`${activityStats?.cambioSesiones && activityStats.cambioSesiones > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {activityStats?.cambioSesiones && activityStats.cambioSesiones > 0 ? '↑' : '↓'} {Math.abs(activityStats?.cambioSesiones || 0)}%
                        </span> vs. período anterior
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ejercicios Completados</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-12" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{activityStats?.totalEjercicios || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className={`${activityStats?.cambioEjercicios && activityStats.cambioEjercicios > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {activityStats?.cambioEjercicios && activityStats.cambioEjercicios > 0 ? '↑' : '↓'} {Math.abs(activityStats?.cambioEjercicios || 0)}%
                        </span> vs. período anterior
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-12" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{activityStats?.porcentajeAsistencia || 0}%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className={`${activityStats?.cambioAsistencia && activityStats.cambioAsistencia > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {activityStats?.cambioAsistencia && activityStats.cambioAsistencia > 0 ? '↑' : '↓'} {Math.abs(activityStats?.cambioAsistencia || 0)}%
                        </span> vs. período anterior
                      </p>
                    </>
                  )}
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
                {isLoading ? (
                  <div className="h-[400px]">
                    <Skeleton className="w-full h-full" />
                  </div>
                ) : hasProgressData ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        width={500}
                        height={300}
                        data={progressData}
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
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">No hay datos de progreso disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Reducción Media de Peso</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-12" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{progressStats?.reduccionPeso > 0 ? `-${progressStats.reduccionPeso}` : `+${Math.abs(progressStats?.reduccionPeso || 0)}`} kg</div>
                      <p className="text-xs text-muted-foreground mt-1">En el último trimestre</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Reducción % Grasa</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-12" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{progressStats?.reduccionGrasa > 0 ? `-${progressStats.reduccionGrasa}` : `+${Math.abs(progressStats?.reduccionGrasa || 0)}`}%</div>
                      <p className="text-xs text-muted-foreground mt-1">En el último trimestre</p>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Aumento Masa Muscular</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-12" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{progressStats?.aumentoMuscular > 0 ? `+${progressStats.aumentoMuscular}` : `-${Math.abs(progressStats?.aumentoMuscular || 0)}`} kg</div>
                      <p className="text-xs text-muted-foreground mt-1">En el último trimestre</p>
                    </>
                  )}
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
                  {isLoading ? (
                    <div className="h-[300px]">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ) : hasDistributionData && selectedClient === "all" ? (
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
                  ) : selectedClient !== "all" ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Distribución disponible solo para vista general</p>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">No hay datos de distribución disponibles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Ejercicios</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px]">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ) : exerciseDistributionData && exerciseDistributionData.length > 0 && selectedClient === "all" ? (
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
                  ) : selectedClient !== "all" ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">Distribución disponible solo para vista general</p>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">No hay datos de ejercicios disponibles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {selectedClient === "all" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cliente Más Activo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="w-full h-12" />
                    ) : topPerformers ? (
                      <>
                        <div className="text-lg font-bold">{topPerformers.clienteMasActivo.nombre}</div>
                        <p className="text-xs text-muted-foreground mt-1">{topPerformers.clienteMasActivo.sesiones} sesiones este mes</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No hay datos disponibles</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ejercicio Más Popular</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="w-full h-12" />
                    ) : topPerformers ? (
                      <>
                        <div className="text-lg font-bold">{topPerformers.ejercicioMasPopular.nombre}</div>
                        <p className="text-xs text-muted-foreground mt-1">Usado en {topPerformers.ejercicioMasPopular.porcentaje}% de las rutinas</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No hay datos disponibles</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Mayor Progreso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="w-full h-12" />
                    ) : topPerformers ? (
                      <>
                        <div className="text-lg font-bold">{topPerformers.mayorProgreso.nombre}</div>
                        <p className="text-xs text-muted-foreground mt-1">{topPerformers.mayorProgreso.reduccion}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No hay datos disponibles</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TrainerReports;
