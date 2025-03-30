
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Eye
} from "lucide-react";

const TrainerExercises = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Datos de ejemplo (en producción, vendrían de Supabase)
  const exercises = [
    { id: 1, name: "Press de banca", muscleGroup: "Pectoral", difficulty: "Intermedio", type: "Fuerza" },
    { id: 2, name: "Sentadilla", muscleGroup: "Piernas", difficulty: "Intermedio", type: "Compuesto" },
    { id: 3, name: "Dominadas", muscleGroup: "Espalda", difficulty: "Avanzado", type: "Peso corporal" },
    { id: 4, name: "Curl de bíceps", muscleGroup: "Brazos", difficulty: "Principiante", type: "Aislamiento" },
    { id: 5, name: "Plancha", muscleGroup: "Core", difficulty: "Principiante", type: "Isométrico" },
  ];

  const filteredExercises = exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Principiante": return "success";
      case "Intermedio": return "warning";
      case "Avanzado": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <DashboardLayout allowedRoles={["entrenador"]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Biblioteca de Ejercicios</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Ejercicio
          </Button>
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
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
                  {filteredExercises.map((exercise) => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">{exercise.name}</TableCell>
                      <TableCell>{exercise.muscleGroup}</TableCell>
                      <TableCell>
                        <Badge variant={difficultyColor(exercise.difficulty) as any}>
                          {exercise.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{exercise.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" title="Ver">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Eliminar">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrainerExercises;
