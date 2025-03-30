
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

const ClientProgress = () => {
  const isMobile = useIsMobile();
  const { 
    measurements,
    latestMeasurement,
    changes,
    chartData,
    isLoadingMeasurements,
    addMeasurement,
    isAddingMeasurement,
    deleteMeasurement,
    isDeletingMeasurement,
    isDialogOpen,
    setIsDialogOpen
  } = useProgress();

  const handleAddMeasurement = (data: NewMeasurement) => {
    console.log("Formulario enviado con datos:", data);
    addMeasurement(data);
  };

  const handleDeleteMeasurement = (id: string) => {
    deleteMeasurement(id);
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

  // Use Drawer for mobile, Dialog for desktop
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
                isSubmitting={isAddingMeasurement}
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
              Ingresa tus datos corporales para hacer seguimiento de tu progreso
            </DialogDescription>
          </DialogHeader>
          
          <MeasurementForm
            onSubmit={handleAddMeasurement}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={isAddingMeasurement}
          />
        </DialogContent>
      </Dialog>
    );
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
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Historial de Mediciones</CardTitle>
              <CardDescription>Registro completo de todas tus mediciones</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingMeasurements ? (
              <div className="flex justify-center p-4">
                <p>Cargando historial...</p>
              </div>
            ) : measurements && measurements.length > 0 ? (
              <MeasurementTable 
                measurements={measurements} 
                onDelete={handleDeleteMeasurement}
                isDeleting={isDeletingMeasurement}
              />
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
        
        <MeasurementFormContainer />
      </div>
    </DashboardLayout>
  );
};

export default ClientProgress;
