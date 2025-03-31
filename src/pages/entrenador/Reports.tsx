
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, Dumbbell, Utensils, TrendingUp, Scale, Percent, PlusCircle, Info } from "lucide-react";
import { UserRole } from "@/types/index";
import { useReportes } from "@/hooks/entrenador/useReportes";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgress } from "@/hooks/cliente/useProgress";
import { useClientRoutine } from "@/hooks/cliente/useClientRoutine";
import { useClientDiet } from "@/hooks/cliente/useClientDiet";
import MeasurementCard from "@/components/cliente/progress/MeasurementCard";
import ProgressChart from "@/components/cliente/progress/ProgressChart";
import MeasurementTable from "@/components/cliente/progress/MeasurementTable";
import MeasurementForm from "@/components/cliente/progress/MeasurementForm";
import DietCard from "@/components/cliente/diet/DietCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { NewMeasurement } from "@/types/progress";
import { 
  ResponsiveContainer, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart,
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Bar
} from "recharts";

// Define colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

const TrainerReports = () => {
  const isMobile = useIsMobile();
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("month");
  const [activeTab, setActiveTab] = useState<string>("general");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
  
  const progressHook = useProgress(selectedClient !== "all" ? selectedClient : undefined);
  const routineHook = useClientRoutine(selectedClient !== "all" ? selectedClient : undefined);
  const dietHook = useClientDiet(selectedClient !== "all" ? selectedClient : undefined);

  const handleGenerateReport = () => {
    generateReport(selectedClient, dateRange);
  };

  const handleAddMeasurement = (data: NewMeasurement) => {
    if (selectedClient !== "all") {
      progressHook.addMeasurement({...data, clientId: selectedClient}); // Changed clienteId to clientId
      setIsDialogOpen(false);
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    if (selectedClient !== "all") {
      progressHook.deleteMeasurement(id);
    }
  };

  const hasActivityData = activityData && activityData.length > 0;
  const hasProgressData = progressData && progressData.length > 0;
  const hasDistributionData = clientDistributionData && clientDistributionData.length > 0;

  const chartConfig = {
    peso: {
      label: "Peso (kg)",
      color: "#3b82f6"
    },
    grasa: {
      label: "Grasa Corporal (%)",
      color: "#ef4444"
    },
    musculo: {
      label: "Masa Muscular (%)",
      color: "#10b981"
    }
  };

  const MeasurementFormContainer = () => {
    if (isMobile) {
      return (
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerContent className="px-4 pb-6 pt-2 max-h-[90vh]">
            <div className="mx-auto w-full max-w-sm">
              <h3 className="text-lg font-semibold py-3 text-center">Registrar Nueva Medición</h3>
              <MeasurementForm
                onSubmit={handleAddMeasurement}
                onCancel={() => setIsDialogOpen(false)}
                isSubmitting={progressHook.isAddingMeasurement}
              />
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Nueva Medición</DialogTitle>
            <DialogDescription>
              Ingresa datos corporales para hacer seguimiento del progreso
            </DialogDescription>
          </DialogHeader>
          
          <MeasurementForm
            onSubmit={handleAddMeasurement}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={progressHook.isAddingMeasurement}
          />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Informes y Estadísticas</h1>
            <p className="text-muted-foreground">Visualiza y gestiona el progreso de tus clientes</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Select value={selectedClient} onValueChange={(value) => {
              setSelectedClient(value);
              if (value !== "all") {
                setActiveTab("progress");
              } else {
                setActiveTab("general");
              }
            }}>
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
            
            {selectedClient === "all" && (
              <>
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
              </>
            )}
            
            {selectedClient !== "all" && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Medición
              </Button>
            )}
          </div>
        </div>
        
        {selectedClient === "all" ? (
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
              <TabsTrigger value="general"><BarChart className="h-4 w-4 mr-2" /> Actividad</TabsTrigger>
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
        ) : (
          <Tabs defaultValue="progress" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
              <TabsTrigger value="progress"><TrendingUp className="h-4 w-4 mr-2" /> Progreso</TabsTrigger>
              <TabsTrigger value="routine"><Dumbbell className="h-4 w-4 mr-2" /> Rutina</TabsTrigger>
              <TabsTrigger value="diet"><Utensils className="h-4 w-4 mr-2" /> Dieta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <MeasurementCard
                  title="Peso Actual"
                  value={progressHook.latestMeasurement?.peso || null}
                  unit="kg"
                  icon={<Scale />}
                  change={progressHook.changes.pesoChange}
                  isPositiveGood={false}
                  isLoading={progressHook.isLoadingMeasurements}
                />
                
                <MeasurementCard
                  title="Grasa Corporal"
                  value={progressHook.latestMeasurement?.grasa_corporal || null}
                  unit="%"
                  icon={<Percent />}
                  change={progressHook.changes.grasaChange}
                  isPositiveGood={false}
                  isLoading={progressHook.isLoadingMeasurements}
                />
                
                <MeasurementCard
                  title="Masa Muscular"
                  value={progressHook.latestMeasurement?.masa_muscular || null}
                  unit="%"
                  icon={<Dumbbell />}
                  change={progressHook.changes.musculoChange}
                  isPositiveGood={true}
                  isLoading={progressHook.isLoadingMeasurements}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <ProgressChart
                  title="Evolución del Peso"
                  description="Historial completo"
                  icon={<TrendingUp />}
                  data={progressHook.chartData}
                  dataKeys={["peso"]}
                  chartConfig={chartConfig}
                  isLoading={progressHook.isLoadingMeasurements}
                  onAddClick={() => setIsDialogOpen(true)}
                />
                
                <ProgressChart
                  title="Evolución de Composición Corporal"
                  description="Grasa y Masa Muscular"
                  icon={<BarChart />}
                  data={progressHook.chartData}
                  dataKeys={["grasa", "musculo"]}
                  chartConfig={chartConfig}
                  isLoading={progressHook.isLoadingMeasurements}
                  onAddClick={() => setIsDialogOpen(true)}
                />
              </div>
              
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Historial de Mediciones</CardTitle>
                    <CardDescription>Registro completo de todas las mediciones</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {progressHook.isLoadingMeasurements ? (
                    <div className="flex justify-center p-4">
                      <p>Cargando historial...</p>
                    </div>
                  ) : progressHook.measurements && progressHook.measurements.length > 0 ? (
                    <MeasurementTable 
                      measurements={progressHook.measurements} 
                      onDelete={handleDeleteMeasurement}
                      isDeleting={progressHook.isDeletingMeasurement}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 space-y-3 border rounded-md">
                      <Info className="h-12 w-12 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">Aún no hay mediciones registradas</p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar Primera Medición
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="routine" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>{routineHook.routine?.name || "Rutina Actual"}</CardTitle>
                    <CardDescription>Programa de entrenamiento personalizado</CardDescription>
                  </div>
                  <Dumbbell className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-6">
                  {routineHook.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <span className="ml-2 text-muted-foreground">Cargando rutina...</span>
                    </div>
                  ) : !routineHook.routine || routineHook.routine.exercises.length === 0 ? (
                    <div className="text-center py-8">
                      <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Este cliente no tiene una rutina asignada. Puedes asignarle una desde la sección de Clientes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Tabs value={routineHook.activeDay} onValueChange={routineHook.setActiveDay} className="w-full">
                        <TabsList className="w-full grid grid-cols-7 mb-4">
                          {routineHook.availableDays.map(day => (
                            <TabsTrigger 
                              key={day} 
                              value={day}
                              className="text-xs sm:text-sm"
                            >
                              {day}
                              {routineHook.routine.exercisesByDay[day]?.length > 0 && (
                                <Badge variant="secondary" className="ml-1 px-1.5 min-w-5 h-5 text-xs hidden sm:flex items-center justify-center">
                                  {routineHook.routine.exercisesByDay[day].length}
                                </Badge>
                              )}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {routineHook.availableDays.map(day => (
                          <TabsContent key={day} value={day} className="space-y-4">
                            {routineHook.routine.exercisesByDay[day]?.length > 0 ? (
                              <Accordion type="single" collapsible className="w-full">
                                {routineHook.routine.exercisesByDay[day].map((exercise) => (
                                  <AccordionItem key={exercise.id} value={exercise.id}>
                                    <AccordionTrigger className="hover:no-underline py-3 px-4 data-[state=open]:bg-accent/50 rounded-t-md">
                                      <div className="flex justify-between w-full items-center">
                                        <div className="flex items-center">
                                          <span className="font-medium">{exercise.name}</span>
                                          <Badge variant="outline" className="ml-2">
                                            {exercise.muscleGroup}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="outline">{exercise.sets} series</Badge>
                                          <Badge variant="outline">{exercise.reps} reps</Badge>
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="bg-accent/20 rounded-b-md px-4 pb-4 pt-2">
                                      <div className="space-y-3">
                                        {(exercise.imageUrl || exercise.videoUrl) && (
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                            {exercise.imageUrl && (
                                              <div className="relative">
                                                <p className="text-sm font-medium mb-1">Imagen de referencia</p>
                                                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                                                  <img 
                                                    src={exercise.imageUrl} 
                                                    alt={`Imagen de ${exercise.name}`}
                                                    className="object-cover w-full h-full"
                                                    onError={(e) => {
                                                      const target = e.target as HTMLImageElement;
                                                      target.src = "/placeholder.svg";
                                                    }}
                                                  />
                                                </AspectRatio>
                                              </div>
                                            )}
                                            
                                            {exercise.videoUrl && (
                                              <div className="relative">
                                                <p className="text-sm font-medium mb-1">Video tutorial</p>
                                                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                                                  {extractYouTubeVideoId(exercise.videoUrl) ? (
                                                    <iframe
                                                      src={`https://www.youtube.com/embed/${extractYouTubeVideoId(exercise.videoUrl)}`}
                                                      title={`Video de ${exercise.name}`}
                                                      className="w-full h-full border-0"
                                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                      allowFullScreen
                                                    ></iframe>
                                                  ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                      <p className="text-sm text-muted-foreground">
                                                        URL de video no válida
                                                      </p>
                                                    </div>
                                                  )}
                                                </AspectRatio>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {exercise.weight && (
                                            <div>
                                              <h4 className="text-sm font-medium mb-1">Peso</h4>
                                              <Badge variant="secondary">{exercise.weight} kg</Badge>
                                            </div>
                                          )}
                                          
                                          {exercise.notes && (
                                            <div className="col-span-full">
                                              <h4 className="text-sm font-medium mb-1">Notas</h4>
                                              <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex items-center pt-2">
                                          <Badge variant={exercise.completed ? "success" : "secondary"} className="ml-auto">
                                            {exercise.completed ? "Completado" : "Pendiente"}
                                          </Badge>
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            ) : (
                              <div className="text-center py-8">
                                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">No hay ejercicios programados para {day}</p>
                              </div>
                            )}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="diet" className="space-y-4 mt-4">
              <DietCard dietHook={dietHook} />
            </TabsContent>
          </Tabs>
        )}
        
        <MeasurementFormContainer />
      </div>
    </DashboardLayout>
  );
};

export default TrainerReports;
