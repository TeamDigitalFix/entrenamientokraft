
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, TrendingUp, Scale, Percent, Dumbbell, PlusCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProgress } from "@/hooks/cliente/useProgress";
import MeasurementCard from "@/components/cliente/progress/MeasurementCard";
import ProgressChart from "@/components/cliente/progress/ProgressChart";
import MeasurementTable from "@/components/cliente/progress/MeasurementTable";
import MeasurementForm from "@/components/cliente/progress/MeasurementForm";
import { NewMeasurement } from "@/types/progress";

const ClientProgress = () => {
  const { 
    measurements,
    latestMeasurement,
    changes,
    chartData,
    isLoadingMeasurements,
    addMeasurement,
    isAddingMeasurement,
    isDialogOpen,
    setIsDialogOpen
  } = useProgress();

  const handleAddMeasurement = (data: NewMeasurement) => {
    console.log("Formulario enviado con datos:", data);
    addMeasurement(data);
  };

  const openDialog = () => {
    setIsDialogOpen(true);
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

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mi Progreso</h1>
            <p className="text-muted-foreground">Visualiza y haz seguimiento de tus avances</p>
          </div>
          <Button 
            onClick={openDialog}
            className="mt-2 sm:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Medición
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <MeasurementCard
            title="Peso Actual"
            value={latestMeasurement?.peso || null}
            unit="kg"
            icon={<Scale />}
            change={changes.pesoChange}
            isPositiveGood={false}
            isLoading={isLoadingMeasurements}
          />
          
          <MeasurementCard
            title="Grasa Corporal"
            value={latestMeasurement?.grasa_corporal || null}
            unit="%"
            icon={<Percent />}
            change={changes.grasaChange}
            isPositiveGood={false}
            isLoading={isLoadingMeasurements}
          />
          
          <MeasurementCard
            title="Masa Muscular"
            value={latestMeasurement?.masa_muscular || null}
            unit="%"
            icon={<Dumbbell />}
            change={changes.musculoChange}
            isPositiveGood={true}
            isLoading={isLoadingMeasurements}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <ProgressChart
            title="Evolución del Peso"
            description="Historial completo"
            icon={<TrendingUp />}
            data={chartData}
            dataKeys={["peso"]}
            chartConfig={chartConfig}
            isLoading={isLoadingMeasurements}
            onAddClick={openDialog}
          />
          
          <ProgressChart
            title="Evolución de Composición Corporal"
            description="Grasa y Masa Muscular"
            icon={<BarChart2 />}
            data={chartData}
            dataKeys={["grasa", "musculo"]}
            chartConfig={chartConfig}
            isLoading={isLoadingMeasurements}
            onAddClick={openDialog}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Historial de Mediciones</CardTitle>
            <CardDescription>Registro completo de todas tus mediciones</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMeasurements ? (
              <div className="flex justify-center p-4">
                <p>Cargando historial...</p>
              </div>
            ) : measurements && measurements.length > 0 ? (
              <MeasurementTable measurements={measurements} />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 space-y-3 border rounded-md">
                <Info className="h-12 w-12 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">Aún no has registrado ninguna medición</p>
                <Button onClick={openDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Registrar Primera Medición
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Medición</DialogTitle>
              <DialogDescription>
                Ingresa tus datos corporales actuales para hacer seguimiento de tu progreso
              </DialogDescription>
            </DialogHeader>
            
            <MeasurementForm
              onSubmit={handleAddMeasurement}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={isAddingMeasurement}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ClientProgress;
