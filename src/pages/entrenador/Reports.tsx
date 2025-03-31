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
  const { data: reportes, isLoading, isError } = useReportes(selectedClient);

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
  };

  if (isLoading) {
    return <DashboardLayout><Skeleton className="w-[200px] h-[40px]" /></DashboardLayout>;
  }

  if (isError) {
    return <DashboardLayout>Error al cargar los reportes.</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Informes</CardTitle>
          <CardDescription>Selecciona un cliente para ver sus informes.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientSelect onChange={handleClientChange} />
          {selectedClient && reportes ? (
            <ReportContent reportes={reportes} />
          ) : (
            <p>Selecciona un cliente para ver sus informes.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

interface ClientSelectProps {
  onChange: (clientId: string) => void;
}

const ClientSelect: React.FC<ClientSelectProps> = ({ onChange }) => {
  const { data: clientes, isLoading, isError } = useReportes();

  if (isLoading) {
    return <Skeleton className="w-[200px] h-[40px]" />;
  }

  if (isError) {
    return <p>Error al cargar la lista de clientes.</p>;
  }

  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Selecciona un cliente" />
      </SelectTrigger>
      <SelectContent>
        {clientes && clientes.map((cliente) => (
          <SelectItem key={cliente.id} value={cliente.id}>
            {cliente.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface ReportContentProps {
  reportes: any;
}

const ReportContent: React.FC<ReportContentProps> = ({ reportes }) => {
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
        <OverviewTab reportes={reportes} />
      </TabsContent>
      <TabsContent value="progress" className="space-y-4">
        <ProgressTab reportes={reportes} />
      </TabsContent>
      <TabsContent value="diet" className="space-y-4">
        <DietTab reportes={reportes} />
      </TabsContent>
      <TabsContent value="routine" className="space-y-4">
        <RoutineTab reportes={reportes} />
      </TabsContent>
    </Tabs>
  );
};

interface OverviewTabProps {
  reportes: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ reportes }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Nombre:</strong> {reportes.client.name}</p>
          <p><strong>Email:</strong> {reportes.client.email}</p>
          {/* Add more client info here */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display progress summary here */}
          <p>Peso actual: {reportes.latestMeasurement?.weight || 'N/A'}</p>
          {/* Add more progress info here */}
        </CardContent>
      </Card>
    </div>
  );
};

interface ProgressTabProps {
  reportes: any;
}

const ProgressTab: React.FC<ProgressTabProps> = ({ reportes }) => {
  return (
    <div>
      <h2>Progreso</h2>
      {/* Display charts and tables related to progress */}
      <p>Aquí se mostrará información detallada sobre el progreso del cliente.</p>
    </div>
  );
};

interface DietTabProps {
  reportes: any;
}

const DietTab: React.FC<DietTabProps> = ({ reportes }) => {
  return (
    <div>
      <h2>Dieta</h2>
      {/* Display diet information */}
      <p>Aquí se mostrará información detallada sobre la dieta del cliente.</p>
    </div>
  );
};

interface RoutineTabProps {
  reportes: any;
}

const RoutineTab: React.FC<RoutineTabProps> = ({ reportes }) => {
  return (
    <div>
      <h2>Rutina</h2>
      {/* Display routine information */}
      <p>Aquí se mostrará información detallada sobre la rutina del cliente.</p>
    </div>
  );
};

// Export both as default and named export to ensure compatibility
export { Reports };
export default Reports;
