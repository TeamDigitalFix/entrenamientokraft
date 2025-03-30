
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

const TrainerFoods = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Datos de ejemplo (en producción, vendrían de Supabase)
  const foods = [
    { id: 1, name: "Pechuga de pollo", category: "Proteínas", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { id: 2, name: "Arroz integral", category: "Carbohidratos", calories: 112, protein: 2.6, carbs: 23, fat: 0.9 },
    { id: 3, name: "Aguacate", category: "Grasas", calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
    { id: 4, name: "Huevo entero", category: "Proteínas", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
    { id: 5, name: "Batata", category: "Carbohidratos", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  ];

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Proteínas": return "success";
      case "Carbohidratos": return "warning";
      case "Grasas": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <DashboardLayout allowedRoles={["entrenador"]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Biblioteca de Alimentos</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Alimento
          </Button>
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
                    <TableHead>Categoría</TableHead>
                    <TableHead>Calorías (100g)</TableHead>
                    <TableHead>Proteínas (g)</TableHead>
                    <TableHead>Carbohidratos (g)</TableHead>
                    <TableHead>Grasas (g)</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFoods.map((food) => (
                    <TableRow key={food.id}>
                      <TableCell className="font-medium">{food.name}</TableCell>
                      <TableCell>
                        <Badge variant={getCategoryColor(food.category) as any}>
                          {food.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{food.calories}</TableCell>
                      <TableCell>{food.protein}</TableCell>
                      <TableCell>{food.carbs}</TableCell>
                      <TableCell>{food.fat}</TableCell>
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

export default TrainerFoods;
