
import { Ejercicio } from "@/types/ejercicios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface EjercicioPreviewProps {
  ejercicio: Ejercicio | null;
  isOpen: boolean;
  onClose: () => void;
}

const EjercicioPreview = ({ ejercicio, isOpen, onClose }: EjercicioPreviewProps) => {
  if (!ejercicio) return null;

  const difficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case "Principiante": return "success";
      case "Intermedio": return "warning";
      case "Avanzado": return "destructive";
      case "Básico": return "success";
      default: return "secondary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{ejercicio.nombre}</DialogTitle>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline">{ejercicio.grupo_muscular}</Badge>
            {ejercicio.dificultad && (
              <Badge variant={difficultyColor(ejercicio.dificultad) as any}>
                {ejercicio.dificultad}
              </Badge>
            )}
            {ejercicio.tipo && (
              <Badge variant="secondary">{ejercicio.tipo}</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          {ejercicio.imagen_url ? (
            <div className="flex justify-center">
              <img
                src={ejercicio.imagen_url}
                alt={ejercicio.nombre}
                className="h-48 object-cover rounded-md"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-48 bg-muted rounded-md">
              <Activity className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {ejercicio.descripcion && (
            <Card className="p-4">
              <h3 className="font-medium mb-2">Descripción</h3>
              <p className="text-muted-foreground">{ejercicio.descripcion}</p>
            </Card>
          )}

          {ejercicio.video_url && (
            <Card className="p-4">
              <h3 className="font-medium mb-2">Video demostrativo</h3>
              <a 
                href={ejercicio.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Ver video
              </a>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EjercicioPreview;
