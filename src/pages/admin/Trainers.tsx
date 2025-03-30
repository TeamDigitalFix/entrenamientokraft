
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTrainers } from "@/hooks/admin/useTrainers";
import { TrainersManagement } from "@/components/admin/TrainersManagement";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const TrainersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const pageSize = 10;

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
    trainerToPermanentDelete,
    setTrainerToPermanentDelete,
    trainerToRestore,
    setTrainerToRestore,
    createTrainer,
    updateTrainer,
    deleteTrainer,
    permanentDeleteTrainer,
    restoreTrainer
  } = useTrainers(page, searchTerm, showDeleted, pageSize);

  // Refrescar todos los datos
  const refreshData = () => {
    refetchTrainers();
    toast.info("Datos actualizados");
  };

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Entrenadores</h1>
          <Button onClick={refreshData} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar datos
          </Button>
        </div>
        
        <TrainersManagement
          trainers={trainers}
          isLoading={trainersLoading}
          searchTerm={searchTerm}
          page={page}
          pageSize={pageSize}
          showDeleted={showDeleted}
          setSearchTerm={setSearchTerm}
          setPage={setPage}
          setShowDeleted={setShowDeleted}
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
          trainerToPermanentDelete={trainerToPermanentDelete}
          setTrainerToPermanentDelete={setTrainerToPermanentDelete}
          trainerToRestore={trainerToRestore}
          setTrainerToRestore={setTrainerToRestore}
          createTrainer={createTrainer}
          updateTrainer={updateTrainer}
          deleteTrainer={deleteTrainer}
          permanentDeleteTrainer={permanentDeleteTrainer}
          restoreTrainer={restoreTrainer}
        />
      </div>
    </DashboardLayout>
  );
};

export default TrainersPage;
