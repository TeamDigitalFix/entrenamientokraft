
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { TrainersTable } from "./TrainersTable";
import { TrainerForm } from "./TrainerForm";
import { Trainer } from "@/types/admin";

interface TrainersManagementProps {
  trainers: Trainer[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  page: number;
  pageSize: number;
  setSearchTerm: (term: string) => void;
  setPage: (setter: (prev: number) => number) => void;
  showNewTrainerDialog: boolean;
  setShowNewTrainerDialog: (show: boolean) => void;
  showEditTrainerDialog: boolean;
  setShowEditTrainerDialog: (show: boolean) => void;
  newTrainerData: {
    username: string;
    password: string;
    name: string;
    email: string;
    phone: string;
  };
  setNewTrainerData: (data: any) => void;
  editTrainerData: Trainer | null;
  setEditTrainerData: (trainer: Trainer | null) => void;
  trainerToDelete: Trainer | null;
  setTrainerToDelete: (trainer: Trainer | null) => void;
  createTrainer: () => void;
  updateTrainer: () => void;
  deleteTrainer: () => void;
}

export const TrainersManagement = ({
  trainers,
  isLoading,
  searchTerm,
  page,
  pageSize,
  setSearchTerm,
  setPage,
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
}: TrainersManagementProps) => {
  
  const handleNewTrainerChange = (field: string, value: string) => {
    setNewTrainerData({ ...newTrainerData, [field]: value });
  };

  const handleEditTrainerChange = (field: string, value: string) => {
    if (editTrainerData) {
      setEditTrainerData({ ...editTrainerData, [field]: value });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestión de Entrenadores</CardTitle>
          <CardDescription>Administra a los entrenadores del sistema</CardDescription>
        </div>
        <Dialog open={showNewTrainerDialog} onOpenChange={setShowNewTrainerDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Nuevo Entrenador
            </Button>
          </DialogTrigger>
          <TrainerForm
            type="create"
            data={newTrainerData}
            onCancel={() => setShowNewTrainerDialog(false)}
            onSubmit={createTrainer}
            onChange={handleNewTrainerChange}
          />
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar entrenadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[250px]"
            />
          </div>
        </div>
        
        <TrainersTable
          trainers={trainers}
          isLoading={isLoading}
          searchTerm={searchTerm}
          trainerToDelete={trainerToDelete}
          setTrainerToDelete={setTrainerToDelete}
          onEditTrainer={(trainer) => {
            setEditTrainerData(trainer);
            setShowEditTrainerDialog(true);
          }}
          onDeleteTrainer={deleteTrainer}
        />
        
        {/* Paginación */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!trainers || trainers.length < pageSize}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Diálogo de Edición de Entrenador */}
      <Dialog open={showEditTrainerDialog} onOpenChange={setShowEditTrainerDialog}>
        {editTrainerData && (
          <TrainerForm
            type="edit"
            data={editTrainerData}
            onCancel={() => setShowEditTrainerDialog(false)}
            onSubmit={updateTrainer}
            onChange={handleEditTrainerChange}
          />
        )}
      </Dialog>
    </Card>
  );
};
