
import React from "react";
import { useForm } from "react-hook-form";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart2, TrendingUp, Scale, Percent, Dumbbell, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/index";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProgress } from "@/hooks/cliente/useProgress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Tipo para el formulario de mediciones
type MeasurementFormValues = {
  peso: string;
  grasa_corporal: string;
  masa_muscular: string;
  notas: string;
};

const ClientProgress = () => {
  const { 
    latestMeasurement,
    changes,
    chartData,
    isLoadingMeasurements,
    addMeasurement,
    isAddingMeasurement,
    isDialogOpen,
    setIsDialogOpen
  } = useProgress();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MeasurementFormValues>({
    defaultValues: {
      peso: "",
      grasa_corporal: "",
      masa_muscular: "",
      notas: ""
    }
  });

  const onSubmit = (data: MeasurementFormValues) => {
    addMeasurement({
      peso: parseFloat(data.peso),
      grasa_corporal: data.grasa_corporal ? parseFloat(data.grasa_corporal) : undefined,
      masa_muscular: data.masa_muscular ? parseFloat(data.masa_muscular) : undefined,
      notas: data.notas || undefined
    });
  };

  const openDialog = () => {
    reset();
    setIsDialogOpen(true);
  };

  // Configuración para los gráficos
  const chartConfig = {
    peso: {
      label: "Peso (kg)",
      color: "#3b82f6" // azul
    },
    grasa: {
      label: "Grasa Corporal (%)",
      color: "#ef4444" // rojo
    },
    musculo: {
      label: "Masa Muscular (%)",
      color: "#10b981" // verde
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
                {isLoadingMeasurements ? (
                  <p className="text-muted-foreground">Cargando...</p>
                ) : latestMeasurement ? (
                  <>
                    <p className="text-4xl font-bold">{latestMeasurement.peso} kg</p>
                    {changes.pesoChange !== null && (
                      <p className={`text-sm flex items-center mt-2 ${changes.pesoChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className="h-3 w-3 mr-1" /> {changes.pesoChange} kg desde el inicio
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Sin datos</p>
                )}
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
                {isLoadingMeasurements ? (
                  <p className="text-muted-foreground">Cargando...</p>
                ) : latestMeasurement && latestMeasurement.grasa_corporal !== null ? (
                  <>
                    <p className="text-4xl font-bold">{latestMeasurement.grasa_corporal}%</p>
                    {changes.grasaChange !== null && (
                      <p className={`text-sm flex items-center mt-2 ${changes.grasaChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className="h-3 w-3 mr-1" /> {changes.grasaChange}% desde el inicio
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Sin datos</p>
                )}
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
                {isLoadingMeasurements ? (
                  <p className="text-muted-foreground">Cargando...</p>
                ) : latestMeasurement && latestMeasurement.masa_muscular !== null ? (
                  <>
                    <p className="text-4xl font-bold">{latestMeasurement.masa_muscular}%</p>
                    {changes.musculoChange !== null && (
                      <p className={`text-sm flex items-center mt-2 ${changes.musculoChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className="h-3 w-3 mr-1" /> {changes.musculoChange > 0 ? '+' : ''}{changes.musculoChange}% desde el inicio
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Sin datos</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Evolución del Peso</CardTitle>
                <CardDescription>Historial completo</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {isLoadingMeasurements ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Cargando gráfica...</p>
                  </div>
                ) : chartData.length > 0 ? (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={50}
                          fontSize={12}
                        />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent 
                              labelClassName="font-medium text-xs" 
                              labelKey="peso"
                            />
                          } 
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="peso" 
                          stroke={chartConfig.peso.color} 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                          name={chartConfig.peso.label}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No hay datos suficientes para mostrar la gráfica</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Evolución de Composición Corporal</CardTitle>
                <CardDescription>Grasa y Masa Muscular</CardDescription>
              </div>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {isLoadingMeasurements ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Cargando gráfica...</p>
                  </div>
                ) : chartData.length > 0 ? (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={50}
                          fontSize={12}
                        />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent 
                              labelClassName="font-medium text-xs" 
                            />
                          } 
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="grasa" 
                          stroke={chartConfig.grasa.color} 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                          name={chartConfig.grasa.label}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="musculo" 
                          stroke={chartConfig.musculo.color} 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                          name={chartConfig.musculo.label}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No hay datos suficientes para mostrar la gráfica</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Diálogo para registrar nueva medición */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Medición</DialogTitle>
              <DialogDescription>
                Ingresa tus datos corporales actuales para hacer seguimiento de tu progreso
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-3">
                <div className="grid gap-2">
                  <Label htmlFor="peso" className="required">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    placeholder="Ej. 75.5"
                    {...register("peso", { 
                      required: "El peso es obligatorio",
                      min: { value: 30, message: "El peso mínimo es 30 kg" },
                      max: { value: 250, message: "El peso máximo es 250 kg" }
                    })}
                  />
                  {errors.peso && (
                    <p className="text-sm text-red-500">{errors.peso.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="grasa_corporal">Grasa Corporal (%)</Label>
                  <Input
                    id="grasa_corporal"
                    type="number"
                    step="0.1"
                    placeholder="Ej. 18.5"
                    {...register("grasa_corporal", { 
                      min: { value: 3, message: "El porcentaje mínimo es 3%" },
                      max: { value: 60, message: "El porcentaje máximo es 60%" }
                    })}
                  />
                  {errors.grasa_corporal && (
                    <p className="text-sm text-red-500">{errors.grasa_corporal.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="masa_muscular">Masa Muscular (%)</Label>
                  <Input
                    id="masa_muscular"
                    type="number"
                    step="0.1"
                    placeholder="Ej. 35.0"
                    {...register("masa_muscular", { 
                      min: { value: 10, message: "El porcentaje mínimo es 10%" },
                      max: { value: 60, message: "El porcentaje máximo es 60%" }
                    })}
                  />
                  {errors.masa_muscular && (
                    <p className="text-sm text-red-500">{errors.masa_muscular.message}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notas">Notas</Label>
                  <Textarea
                    id="notas"
                    placeholder="Observaciones, sensaciones o detalles relevantes"
                    className="min-h-[80px]"
                    {...register("notas")}
                  />
                </div>
              </div>
              
              <DialogFooter className="sm:justify-between">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isAddingMeasurement}
                >
                  {isAddingMeasurement ? "Guardando..." : "Guardar Medición"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ClientProgress;
