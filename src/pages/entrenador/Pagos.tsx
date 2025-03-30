import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { UserRole } from "@/types/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Plus, Search, Filter, CreditCard, CalendarDays } from "lucide-react";
import { PlanPagoForm } from "@/components/entrenador/pagos/PlanPagoForm";
import { PlanPagoCard } from "@/components/entrenador/pagos/PlanPagoCard";
import { SuscripcionForm } from "@/components/entrenador/pagos/SuscripcionForm";
import { SuscripcionCard } from "@/components/entrenador/pagos/SuscripcionCard";
import { PagoForm } from "@/components/entrenador/pagos/PagoForm";
import { PagoCard } from "@/components/entrenador/pagos/PagoCard";
import { GenerarPagosForm } from "@/components/entrenador/pagos/GenerarPagosForm";
import { usePlanesPago } from "@/hooks/entrenador/usePlanesPago";
import { useSuscripciones } from "@/hooks/entrenador/useSuscripciones";
import { usePagos } from "@/hooks/entrenador/usePagos";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PagosPage = () => {
  const [activeTab, setActiveTab] = useState("pagos");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedSuscripcionId, setSelectedSuscripcionId] = useState<string | undefined>(undefined);
  const [isGeneratingPayments, setIsGeneratingPayments] = useState(false);

  const {
    planes,
    isLoading: isLoadingPlanes,
    isCreating: isCreatingPlan,
    isUpdating: isUpdatingPlan,
    crearPlan,
    actualizarPlan,
    toggleActivoPlan,
    isEditing: isEditingPlan,
    setIsEditing: setIsEditingPlan,
    currentPlan,
    setCurrentPlan
  } = usePlanesPago();

  const {
    suscripciones,
    isLoading: isLoadingSuscripciones,
    isCreating: isCreatingSuscripcion,
    isUpdating: isUpdatingSuscripcion,
    crearSuscripcion,
    actualizarSuscripcion,
    toggleActivoSuscripcion,
    isEditing: isEditingSuscripcion,
    setIsEditing: setIsEditingSuscripcion,
    currentSuscripcion,
    setCurrentSuscripcion
  } = useSuscripciones();

  const {
    pagos,
    isLoading: isLoadingPagos,
    isCreating: isCreatingPago,
    isUpdating: isUpdatingPago,
    crearPago,
    actualizarPago,
    marcarComoPagado,
    generarPagosFuturos,
    isEditing: isEditingPago,
    setIsEditing: setIsEditingPago,
    currentPago,
    setCurrentPago
  } = usePagos(selectedSuscripcionId);

  const filteredPlanes = planes?.filter(plan => 
    plan.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plan.descripcion && plan.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSuscripciones = suscripciones?.filter(suscripcion => 
    suscripcion.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suscripcion.plan.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (suscripcion.notas && suscripcion.notas.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPagos = pagos?.filter(pago => {
    const matchesSearch = 
      (pago.suscripcion?.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.suscripcion?.plan.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pago.notas && pago.notas.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pago.metodo_pago && pago.metodo_pago.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = !statusFilter || pago.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handlePlanSubmit = (data: any) => {
    if (currentPlan) {
      actualizarPlan({ ...currentPlan, ...data });
    } else {
      crearPlan(data);
    }
  };

  const handleSuscripcionSubmit = (data: any) => {
    if (currentSuscripcion) {
      actualizarSuscripcion({ ...currentSuscripcion, ...data });
    } else {
      crearSuscripcion(data);
    }
  };

  const handlePagoSubmit = (data: any) => {
    if (currentPago) {
      actualizarPago({ ...currentPago, ...data });
    } else {
      crearPago(data);
    }
  };

  const handleGenerarPagos = (cantidad: number) => {
    if (!currentSuscripcion) return;

    generarPagosFuturos({
      suscripcion: currentSuscripcion,
      cantidadPagos: cantidad
    });
    setIsGeneratingPayments(false);
  };

  const handleViewSuscripcionPayments = (suscripcion: any) => {
    setSelectedSuscripcionId(suscripcion.id);
    setActiveTab("pagos");
  };

  const renderPlanesTab = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          setCurrentPlan(null);
          setIsEditingPlan(true);
        }}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Plan
        </Button>
      </div>

      {isLoadingPlanes ? (
        <div className="text-center py-8">Cargando planes...</div>
      ) : filteredPlanes && filteredPlanes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlanes.map((plan) => (
            <PlanPagoCard
              key={plan.id}
              plan={plan}
              onEdit={(plan) => {
                setCurrentPlan(plan);
                setIsEditingPlan(true);
              }}
              onToggleActive={(plan) => toggleActivoPlan(plan)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No hay planes de pago</h3>
          <p className="text-muted-foreground mb-6">Crea tu primer plan de pago para empezar a gestionar suscripciones</p>
          <Button onClick={() => {
            setCurrentPlan(null);
            setIsEditingPlan(true);
          }}>
            <Plus className="h-4 w-4 mr-2" /> Crear Plan de Pago
          </Button>
        </div>
      )}

      <PlanPagoForm
        isOpen={isEditingPlan}
        onClose={() => setIsEditingPlan(false)}
        onSubmit={handlePlanSubmit}
        isSubmitting={isCreatingPlan || isUpdatingPlan}
        initialData={currentPlan}
      />
    </>
  );

  const renderSuscripcionesTab = () => (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar suscripciones..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => {
            setCurrentSuscripcion(null);
            setIsEditingSuscripcion(true);
          }}
          disabled={!planes || planes.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" /> Nueva Suscripción
        </Button>
      </div>

      {isLoadingSuscripciones ? (
        <div className="text-center py-8">Cargando suscripciones...</div>
      ) : filteredSuscripciones && filteredSuscripciones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuscripciones.map((suscripcion) => (
            <SuscripcionCard
              key={suscripcion.id}
              suscripcion={suscripcion}
              onEdit={(suscripcion) => {
                setCurrentSuscripcion(suscripcion);
                setIsEditingSuscripcion(true);
              }}
              onToggleActive={(suscripcion) => toggleActivoSuscripcion(suscripcion)}
              onViewPayments={handleViewSuscripcionPayments}
            />
          ))}
        </div>
      ) : planes && planes.length > 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No hay suscripciones</h3>
          <p className="text-muted-foreground mb-6">Crea tu primera suscripción para empezar a gestionar pagos</p>
          <Button onClick={() => {
            setCurrentSuscripcion(null);
            setIsEditingSuscripcion(true);
          }}>
            <Plus className="h-4 w-4 mr-2" /> Crear Suscripción
          </Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No hay planes de pago activos</h3>
          <p className="text-muted-foreground mb-6">Primero debes crear al menos un plan de pago</p>
          <Button onClick={() => {
            setActiveTab("planes");
          }}>
            <Plus className="h-4 w-4 mr-2" /> Ir a Planes de Pago
          </Button>
        </div>
      )}

      <SuscripcionForm
        isOpen={isEditingSuscripcion}
        onClose={() => setIsEditingSuscripcion(false)}
        onSubmit={handleSuscripcionSubmit}
        isSubmitting={isCreatingSuscripcion || isUpdatingSuscripcion}
        initialData={currentSuscripcion}
      />

      {currentSuscripcion && (
        <GenerarPagosForm
          isOpen={isGeneratingPayments}
          onClose={() => setIsGeneratingPayments(false)}
          onSubmit={handleGenerarPagos}
          isSubmitting={false}
          suscripcion={currentSuscripcion}
        />
      )}
    </>
  );

  const renderPagosTab = () => (
    <>
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-4">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pagos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-auto">
                <span className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter ? 
                    `Estado: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}` : 
                    "Todos los estados"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedSuscripcionId && (
              <Button 
                variant="outline" 
                onClick={() => setSelectedSuscripcionId(undefined)}
              >
                Ver Todos
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {selectedSuscripcionId && (
            <Button 
              variant="outline" 
              onClick={() => {
                const suscripcion = suscripciones?.find(s => s.id === selectedSuscripcionId);
                if (suscripcion) {
                  setCurrentSuscripcion(suscripcion);
                  setIsGeneratingPayments(true);
                }
              }}
              disabled={!selectedSuscripcionId}
            >
              <CalendarDays className="h-4 w-4 mr-2" /> Generar Pagos
            </Button>
          )}
          
          <Button 
            onClick={() => {
              setCurrentPago(null);
              setIsEditingPago(true);
            }}
            disabled={!suscripciones || suscripciones.filter(s => s.activo).length === 0}
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo Pago
          </Button>
        </div>
      </div>

      {selectedSuscripcionId && (
        <div className="mb-4">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {suscripciones?.find(s => s.id === selectedSuscripcionId)?.cliente?.nombre} - 
            {suscripciones?.find(s => s.id === selectedSuscripcionId)?.plan?.nombre}
          </Badge>
        </div>
      )}

      {isLoadingPagos ? (
        <div className="text-center py-8">Cargando pagos...</div>
      ) : filteredPagos && filteredPagos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPagos.map((pago) => (
            <PagoCard
              key={pago.id}
              pago={pago}
              onEdit={(pago) => {
                setCurrentPago(pago);
                setIsEditingPago(true);
              }}
              onMarkAsPaid={(pago) => marcarComoPagado(pago)}
            />
          ))}
        </div>
      ) : suscripciones && suscripciones.length > 0 ? (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No hay pagos{selectedSuscripcionId ? " para esta suscripción" : ""}</h3>
          <p className="text-muted-foreground mb-6">
            {selectedSuscripcionId ? 
              "Genera pagos para esta suscripción" : 
              "Crea tu primer pago o genera pagos para una suscripción"}
          </p>
          {selectedSuscripcionId ? (
            <Button 
              onClick={() => {
                const suscripcion = suscripciones?.find(s => s.id === selectedSuscripcionId);
                if (suscripcion) {
                  setCurrentSuscripcion(suscripcion);
                  setIsGeneratingPayments(true);
                }
              }}
            >
              <CalendarDays className="h-4 w-4 mr-2" /> Generar Pagos
            </Button>
          ) : (
            <Button onClick={() => {
              setCurrentPago(null);
              setIsEditingPago(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Crear Pago
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No hay suscripciones activas</h3>
          <p className="text-muted-foreground mb-6">Primero debes crear al menos una suscripción</p>
          <Button onClick={() => {
            setActiveTab("suscripciones");
          }}>
            <Plus className="h-4 w-4 mr-2" /> Ir a Suscripciones
          </Button>
        </div>
      )}

      <PagoForm
        isOpen={isEditingPago}
        onClose={() => setIsEditingPago(false)}
        onSubmit={handlePagoSubmit}
        isSubmitting={isCreatingPago || isUpdatingPago}
        initialData={currentPago}
        suscripcionId={selectedSuscripcionId}
      />
    </>
  );

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pagos y Contabilidad</h1>
            <p className="text-muted-foreground">Gestiona tus planes de pago, suscripciones y cobros</p>
          </div>
        </div>

        <Tabs 
          defaultValue="pagos" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pagos">
              <DollarSign className="h-4 w-4 mr-2" /> Pagos
            </TabsTrigger>
            <TabsTrigger value="suscripciones">
              <CreditCard className="h-4 w-4 mr-2" /> Suscripciones
            </TabsTrigger>
            <TabsTrigger value="planes">
              <CalendarDays className="h-4 w-4 mr-2" /> Planes de Pago
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pagos" className="space-y-4">
            {renderPagosTab()}
          </TabsContent>
          
          <TabsContent value="suscripciones" className="space-y-4">
            {renderSuscripcionesTab()}
          </TabsContent>
          
          <TabsContent value="planes" className="space-y-4">
            {renderPlanesTab()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PagosPage;
