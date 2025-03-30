import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Eye,
  RotateCcw
} from "lucide-react";
import { useEjercicios } from "@/hooks/entrenador/useEjercicios";
import { EjercicioForm } from "@/components/entrenador/EjercicioForm";
import { Ejercicio, NuevoEjercicio } from "@/types/ejercicios";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/index";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TrainerExercises = () => {
  const { user } = useAuth();
  const entrenadorId = user?.id || "";
  const { 
    filteredEjercicios, 
    isLoading, 
    searchTerm, 
    setSearchTerm,
    crearEjercicio,
    actualizarEjercicio,
    eliminarEjercicio 
  } = useEjercicios(entrenadorId);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEjercicio, setSelectedEjercicio] = useState<Ejercicio | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteEjercicioId, setDeleteEjercicioId] = useState<string | null>(null);

  const handleCreateEjercicio = (nuevoEjercicio: NuevoEjercicio) => {
    crearEjercicio(nuevoEjercicio);
    setShowCreateDialog(false);
  };

  const handleEditEjercicio = (ejercicio: NuevoEjercicio) => {
    if (selectedEjercicio) {
      actualizarEjercicio({ 
        id: selectedEjercicio.id, 
        ...ejercicio 
      });
      setShowEditDialog(false);
      setSelectedEjercicio(null);
    }
  };

  const openEditDialog = (ejercicio: Ejercicio) => {
    setSelectedEjercicio(ejercicio);
    setShowEditDialog(true);
  };

  const openDeleteAlert = (id: string) => {
    setDeleteEjercicioId(id);
    setShowDeleteAlert(true);
  };

  const handleDeleteEjercicio = () => {
    if (deleteEjercicioId) {
      eliminarEjercicio(deleteEjercicioId);
      setShowDeleteAlert(false);
      setDeleteEjercicioId(null);
    }
  };

  const difficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case "Principiante": return "success";
      case "Intermedio": return "warning";
      case "Avanzado": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Biblioteca de Ejercicios</h1>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ejercicio
              </Button>
            </DialogTrigger>
            <EjercicioForm
              tipo="crear"
              onCancel={() => setShowCreateDialog(false)}
              onSubmit={handleCreateEjercicio}
            />
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Ejercicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, grupo muscular..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" title="Filtrar">
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                title="Refrescar"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedEjercicio(null);
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Grupo Muscular</TableHead>
                    <TableHead>Dificultad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Cargando ejercicios...
                      </TableCell>
                    </TableRow>
                  ) : filteredEjercicios && filteredEjercicios.length > 0 ? (
                    filteredEjercicios.map((ejercicio) => (
                      <TableRow key={ejercicio.id}>
                        <TableCell className="font-medium">{ejercicio.nombre}</TableCell>
                        <TableCell>{ejercicio.grupo_muscular}</TableCell>
                        <TableCell>
                          <Badge variant={difficultyColor(ejercicio.dificultad) as any}>
                            {ejercicio.dificultad || "No especificado"}
                          </Badge>
                        </TableCell>
                        <TableCell>{ejercicio.tipo || "No especificado"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Ver">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Editar"
                              onClick={() => openEditDialog(ejercicio)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Eliminar"
                              onClick={() => openDeleteAlert(ejercicio.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No se encontraron ejercicios. {searchTerm ? "Intenta con otra búsqueda." : "Crea tu primer ejercicio."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        {selectedEjercicio && (
          <EjercicioForm
            tipo="editar"
            ejercicio={selectedEjercicio}
            onCancel={() => setShowEditDialog(false)}
            onSubmit={handleEditEjercicio}
          />
        )}
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el ejercicio de forma permanente y no podrá ser recuperado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEjercicio} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TrainerExercises;
