
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
import { UserRole } from "@/types/index";
import { useAuth } from "@/hooks/useAuth";
import { useAlimentos, Alimento, NuevoAlimento } from "@/hooks/entrenador/useAlimentos";
import { AlimentoForm } from "@/components/entrenador/AlimentoForm";
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

const TrainerFoods = () => {
  const { user } = useAuth();
  const entrenadorId = user?.id || "";
  const {
    filteredAlimentos,
    isLoading,
    searchTerm,
    setSearchTerm,
    crearAlimento,
    actualizarAlimento,
    eliminarAlimento
  } = useAlimentos(entrenadorId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAlimento, setSelectedAlimento] = useState<Alimento | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteAlimentoId, setDeleteAlimentoId] = useState<string | null>(null);

  const handleCreateAlimento = (nuevoAlimento: NuevoAlimento) => {
    crearAlimento(nuevoAlimento);
    setShowCreateDialog(false);
  };

  const handleEditAlimento = (alimento: NuevoAlimento) => {
    if (selectedAlimento) {
      actualizarAlimento({
        id: selectedAlimento.id,
        ...alimento
      });
      setShowEditDialog(false);
      setSelectedAlimento(null);
    }
  };

  const openEditDialog = (alimento: Alimento) => {
    setSelectedAlimento(alimento);
    setShowEditDialog(true);
  };

  const openDeleteAlert = (id: string) => {
    setDeleteAlimentoId(id);
    setShowDeleteAlert(true);
  };

  const handleDeleteAlimento = () => {
    if (deleteAlimentoId) {
      eliminarAlimento(deleteAlimentoId);
      setShowDeleteAlert(false);
      setDeleteAlimentoId(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Proteínas": return "success";
      case "Carbohidratos": return "warning";
      case "Grasas": return "destructive";
      case "Frutas": return "purple";
      case "Verduras": return "green";
      case "Lácteos": return "blue";
      default: return "secondary";
    }
  };

  return (
    <DashboardLayout allowedRoles={[UserRole.TRAINER]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Biblioteca de Alimentos</h1>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Alimento
              </Button>
            </DialogTrigger>
            <AlimentoForm
              tipo="crear"
              onCancel={() => setShowCreateDialog(false)}
              onSubmit={handleCreateAlimento}
            />
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Alimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, categoría..."
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
                  setSelectedAlimento(null);
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
                    <TableHead>Categoría</TableHead>
                    <TableHead>Calorías (100g)</TableHead>
                    <TableHead>Proteínas (g)</TableHead>
                    <TableHead>Carbohidratos (g)</TableHead>
                    <TableHead>Grasas (g)</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Cargando alimentos...
                      </TableCell>
                    </TableRow>
                  ) : filteredAlimentos && filteredAlimentos.length > 0 ? (
                    filteredAlimentos.map((alimento) => (
                      <TableRow key={alimento.id}>
                        <TableCell className="font-medium">{alimento.nombre}</TableCell>
                        <TableCell>
                          <Badge variant={getCategoryColor(alimento.categoria) as any}>
                            {alimento.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell>{alimento.calorias}</TableCell>
                        <TableCell>{alimento.proteinas}</TableCell>
                        <TableCell>{alimento.carbohidratos}</TableCell>
                        <TableCell>{alimento.grasas}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Ver">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Editar"
                              onClick={() => openEditDialog(alimento)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Eliminar"
                              onClick={() => openDeleteAlert(alimento.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No se encontraron alimentos. {searchTerm ? "Intenta con otra búsqueda." : "Crea tu primer alimento."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de Edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        {selectedAlimento && (
          <AlimentoForm
            tipo="editar"
            alimento={selectedAlimento}
            onCancel={() => setShowEditDialog(false)}
            onSubmit={handleEditAlimento}
          />
        )}
      </Dialog>

      {/* Alerta de Confirmación para Eliminar */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el alimento de forma permanente y no podrá ser recuperado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAlimento} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TrainerFoods;
