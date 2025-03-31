
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Utensils, TrendingUp, Scale, Percent, PlusCircle, Info } from "lucide-react";
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
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("progress");
  
  const { clientsList } = useReportes(selectedClient, "month");
  
  const progressHook = useProgress(selectedClient !== "" ? selectedClient : undefined);
  const routineHook = useClientRoutine(selectedClient !== "" ? selectedClient : undefined);
  const dietHook = useClientDiet(selectedClient !== "" ? selectedClient : undefined);

  const handleAddMeasurement = (data: NewMeasurement) => {
    if (selectedClient !== "") {
      progressHook.addMeasurement({...data, clientId: selectedClient});
      setIsDialogOpen(false);
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    if (selectedClient !== "") {
      progressHook.deleteMeasurement(id);
    }
  };

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
            }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientsList.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedClient && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Medición
              </Button>
            )}
          </div>
        </div>
        
        {!selectedClient ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <Info className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-medium">Selecciona un cliente para ver su información</h3>
            <p>Podrás visualizar y gestionar el progreso, rutina y dieta de cada cliente</p>
          </div>
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
                  icon={<TrendingUp />}
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
