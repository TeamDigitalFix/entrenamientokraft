
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { useStats } from "@/hooks/admin/useStats";
import { useRecentActivity } from "@/hooks/admin/useRecentActivity";
import { useTrainers } from "@/hooks/admin/useTrainers";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { TrainersManagement } from "@/components/admin/TrainersManagement";

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Hooks para cada sección del dashboard
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useStats();
  const { activity, isLoading: activityLoading, refetch: refetchActivity } = useRecentActivity();
  const { 
    trainers, 
    isLoading: trainersLoading, 
    refetch: refetchTrainers,
    showNewTrainerDialog,
    setShowNewTrainerDialog,
    showEditTrainerDialog,
    setShowEditTrainerDialog,
    newTrainerData,
    setNewTrainerData,
    editTrainerData,
    setEditTrainerData,
    trainerToDelete,
    setTrainerToDelete,
    createTrainer,
    updateTrainer,
    deleteTrainer
  } = useTrainers(page, searchTerm, pageSize);

  // Refrescar todos los datos
  const refreshData = () => {
    refetchStats();
    refetchTrainers();
    refetchActivity();
    toast.info("Datos actualizados");
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <Button onClick={refreshData} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar datos
          </Button>
        </div>
        
        <Tabs defaultValue="dashboard" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="trainers">Entrenadores</TabsTrigger>
          </TabsList>
          
          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* Estadísticas */}
              <DashboardStats stats={stats} isLoading={statsLoading} />
              
              {/* Actividad Reciente */}
              <RecentActivity activity={activity} isLoading={activityLoading} />
            </div>
          </TabsContent>
          
          {/* Gestión de Entrenadores */}
          <TabsContent value="trainers">
            <TrainersManagement
              trainers={trainers}
              isLoading={trainersLoading}
              searchTerm={searchTerm}
              page={page}
              pageSize={pageSize}
              setSearchTerm={setSearchTerm}
              setPage={setPage}
              showNewTrainerDialog={showNewTrainerDialog}
              setShowNewTrainerDialog={setShowNewTrainerDialog}
              showEditTrainerDialog={showEditTrainerDialog}
              setShowEditTrainerDialog={setShowEditTrainerDialog}
              newTrainerData={newTrainerData}
              setNewTrainerData={setNewTrainerData}
              editTrainerData={editTrainerData}
              setEditTrainerData={setEditTrainerData}
              trainerToDelete={trainerToDelete}
              setTrainerToDelete={setTrainerToDelete}
              createTrainer={createTrainer}
              updateTrainer={updateTrainer}
              deleteTrainer={deleteTrainer}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
