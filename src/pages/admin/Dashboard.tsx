
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { ResetDataDialog } from "@/components/admin/ResetDataDialog";
import { Button } from "@/components/ui/button";
import { ClientsManagement } from "@/components/admin/ClientsManagement";
import { TrainersManagement } from "@/components/admin/TrainersManagement";
import { useStats } from "@/hooks/admin/useStats";
import { useRecentActivity } from "@/hooks/admin/useRecentActivity";
import { useAdminClients } from "@/hooks/admin/useAdminClients";
import { useTrainers } from "@/hooks/admin/useTrainers";
import { Database, RefreshCw, Users } from "lucide-react";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("resumen");
  const [searchTerm, setSearchTerm] = useState("");
  const [trainerSearchTerm, setTrainerSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [trainerPage, setTrainerPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showDeletedTrainers, setShowDeletedTrainers] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const { data: statsData, isLoading: isLoadingStats } = useStats();
  const { data: activityData, isLoading: isLoadingActivity } = useRecentActivity();

  const { 
    clients, 
    totalItems,
    isLoading: isLoadingClients, 
    trainers: trainersList,
    showNewClientDialog,
    setShowNewClientDialog,
    showEditClientDialog,
    setShowEditClientDialog,
    newClientData,
    setNewClientData,
    editClientData,
    setEditClientData,
    clientToDelete,
    setClientToDelete,
    clientToPermanentDelete,
    setClientToPermanentDelete,
    createClient,
    updateClient,
    deleteClient,
    restoreClient,
    permanentDeleteClient
  } = useAdminClients(page, searchTerm, showDeleted);

  const {
    trainers,
    isLoading: isLoadingTrainers,
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
    restoreTrainer,
    permanentDeleteTrainer
  } = useTrainers(trainerPage, trainerSearchTerm, showDeletedTrainers);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h1 className="text-3xl font-bold">Panel Administrativo</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowResetDialog(true)}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reiniciar Datos
              </Button>
            </div>
          </div>

          <Tabs 
            defaultValue="resumen" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="entrenadores" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Entrenadores
              </TabsTrigger>
              <TabsTrigger value="clientes" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resumen" className="space-y-4">
              <DashboardStats data={statsData} isLoading={isLoadingStats} />
              <RecentActivity data={activityData} isLoading={isLoadingActivity} />
            </TabsContent>

            <TabsContent value="entrenadores">
              <TrainersManagement
                trainers={trainers}
                isLoading={isLoadingTrainers}
                searchTerm={trainerSearchTerm}
                setSearchTerm={setTrainerSearchTerm}
                page={trainerPage}
                setPage={setTrainerPage}
                showDeleted={showDeletedTrainers}
                setShowDeleted={setShowDeletedTrainers}
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
                restoreTrainer={restoreTrainer}
                permanentDeleteTrainer={permanentDeleteTrainer}
              />
            </TabsContent>

            <TabsContent value="clientes">
              <ClientsManagement
                clients={clients}
                isLoading={isLoadingClients}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                page={page}
                pageSize={10}
                totalItems={totalItems}
                showDeleted={showDeleted}
                setShowDeleted={setShowDeleted}
                showNewClientDialog={showNewClientDialog}
                setShowNewClientDialog={setShowNewClientDialog}
                showEditClientDialog={showEditClientDialog}
                setShowEditClientDialog={setShowEditClientDialog}
                newClientData={newClientData}
                setNewClientData={setNewClientData}
                editClientData={editClientData}
                setEditClientData={setEditClientData}
                clientToDelete={clientToDelete}
                setClientToDelete={setClientToDelete}
                clientToPermanentDelete={clientToPermanentDelete}
                setClientToPermanentDelete={setClientToPermanentDelete}
                createClient={createClient}
                updateClient={updateClient}
                deleteClient={deleteClient}
                restoreClient={restoreClient}
                permanentDeleteClient={permanentDeleteClient}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ResetDataDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
