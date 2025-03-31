
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Utensils, TrendingUp, Info, PlusCircle, Percent, Scale } from "lucide-react";
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
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// Define colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);
  const { clientsList, isLoading } = useReportes(selectedClient);

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
  };

  if (isLoading) {
    return <DashboardLayout><Skeleton className="w-[200px] h-[40px]" /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Informes</CardTitle>
          <CardDescription>Selecciona un cliente para ver sus informes.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientSelect onChange={handleClientChange} clientsList={clientsList} />
          {selectedClient ? (
            <ReportContent clientId={selectedClient} />
          ) : (
            <p className="mt-4 text-center text-muted-foreground">Selecciona un cliente para ver sus informes.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

interface ClientSelectProps {
  onChange: (clientId: string) => void;
  clientsList: any[];
}

const ClientSelect: React.FC<ClientSelectProps> = ({ onChange, clientsList }) => {
  if (clientsList.length === 0) {
    return <p>No hay clientes disponibles.</p>;
  }

  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Selecciona un cliente" />
      </SelectTrigger>
      <SelectContent>
        {clientsList.map((cliente) => (
          <SelectItem key={cliente.id} value={cliente.id}>
            {cliente.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface ReportContentProps {
  clientId: string;
}

const ReportContent: React.FC<ReportContentProps> = ({ clientId }) => {
  return (
    <Tabs defaultValue="overview" className="w-full mt-4">
      <TabsList>
        <TabsTrigger value="overview">
          <Info className="mr-2 h-4 w-4" />
          Vista General
        </TabsTrigger>
        <TabsTrigger value="progress">
          <TrendingUp className="mr-2 h-4 w-4" />
          Progreso
        </TabsTrigger>
        <TabsTrigger value="diet">
          <Utensils className="mr-2 h-4 w-4" />
          Dieta
        </TabsTrigger>
        <TabsTrigger value="routine">
          <Dumbbell className="mr-2 h-4 w-4" />
          Rutina
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <OverviewTab clientId={clientId} />
      </TabsContent>
      <TabsContent value="progress" className="space-y-4">
        <ProgressTab clientId={clientId} />
      </TabsContent>
      <TabsContent value="diet" className="space-y-4">
        <DietTab clientId={clientId} />
      </TabsContent>
      <TabsContent value="routine" className="space-y-4">
        <RoutineTab clientId={clientId} />
      </TabsContent>
    </Tabs>
  );
};

interface OverviewTabProps {
  clientId: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ clientId }) => {
  const { clients } = useClients();
  const client = clients.find(c => c.id === clientId);
  const { data: measurementData } = useProgress(clientId);
  const latestMeasurement = measurementData?.measurements?.[0];

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
          <p><strong>Peso actual:</strong> {latestMeasurement?.weight || 'N/A'} kg</p>
          <p><strong>Grasa corporal:</strong> {latestMeasurement?.bodyFat || 'N/A'}%</p>
          <p><strong>Masa muscular:</strong> {latestMeasurement?.muscleMass || 'N/A'} kg</p>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProgressTabProps {
  clientId: string;
}

const ProgressTab: React.FC<ProgressTabProps> = ({ clientId }) => {
  const { 
    data: measurementData, 
    isLoading: isProgressLoading 
  } = useProgress(clientId);

  if (isProgressLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!measurementData?.measurements || measurementData.measurements.length === 0) {
    return (
      <div className="text-center py-8">
        <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay datos de progreso disponibles para este cliente</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressChart measurements={measurementData.measurements} />
      <MeasurementTable measurements={measurementData.measurements} />
    </div>
  );
};

interface DietTabProps {
  clientId: string;
}

const DietTab: React.FC<DietTabProps> = ({ clientId }) => {
  const { 
    dietData, 
    isLoading: isDietLoading,
    isToggling
  } = useClientDiet(clientId);

  if (isDietLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!dietData || !dietData.diet) {
    return (
      <div className="text-center py-8">
        <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay dieta asignada para este cliente</p>
      </div>
    );
  }

  return (
    <DietCard 
      diet={dietData.diet} 
      isLoading={isDietLoading} 
      activeDay={dietData.activeDay}
      setActiveDay={dietData.setActiveDay}
      availableDays={dietData.availableDays}
      handleToggleMeal={dietData.handleToggleMeal}
      isToggling={isToggling}
      clientId={clientId}
    />
  );
};

interface RoutineTabProps {
  clientId: string;
}

const RoutineTab: React.FC<RoutineTabProps> = ({ clientId }) => {
  const { 
    routineData, 
    isLoading: isRoutineLoading 
  } = useClientRoutine(clientId);

  if (isRoutineLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!routineData || !routineData.routine) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay rutina asignada para este cliente</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{routineData.routine.name}</h2>
      <p className="mb-6">{routineData.routine.description}</p>
      
      <Accordion type="single" collapsible className="w-full">
        {routineData.weekdays.map((day) => (
          <AccordionItem key={day} value={day}>
            <AccordionTrigger className="text-lg font-medium">
              {day}
              {routineData.exercisesByDay[day]?.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {routineData.exercisesByDay[day].length} ejercicios
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              {routineData.exercisesByDay[day]?.length > 0 ? (
                <div className="space-y-4">
                  {routineData.exercisesByDay[day].map((exercise) => (
                    <Card key={exercise.id} className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {exercise.exercise.imageUrl && (
                          <div className="md:col-span-1">
                            <AspectRatio ratio={1 / 1}>
                              <img
                                src={exercise.exercise.imageUrl}
                                alt={exercise.exercise.name}
                                className="rounded-l object-cover h-full w-full"
                              />
                            </AspectRatio>
                          </div>
                        )}
                        <div className={`p-4 ${exercise.exercise.imageUrl ? 'md:col-span-4' : 'md:col-span-5'}`}>
                          <h3 className="text-lg font-semibold">{exercise.exercise.name}</h3>
                          <p className="text-sm text-muted-foreground">{exercise.exercise.muscleGroup}</p>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-xs text-muted-foreground">Series</span>
                              <p className="font-medium">{exercise.sets}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Repeticiones</span>
                              <p className="font-medium">{exercise.reps}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Peso</span>
                              <p className="font-medium">{exercise.weight || 'N/A'} kg</p>
                            </div>
                          </div>
                          {exercise.notes && (
                            <p className="mt-2 text-sm italic">{exercise.notes}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay ejercicios programados para este día</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

// Import useClients hook
import { useClients } from "@/hooks/entrenador/useClients";

// Export both as default and named export to ensure compatibility
export { Reports };
export default Reports;
