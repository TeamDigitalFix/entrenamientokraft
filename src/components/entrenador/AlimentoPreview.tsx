
import { Alimento } from "@/hooks/entrenador/useAlimentos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Utensils } from "lucide-react";

interface AlimentoPreviewProps {
  alimento: Alimento | null;
  isOpen: boolean;
  onClose: () => void;
}

const AlimentoPreview = ({ alimento, isOpen, onClose }: AlimentoPreviewProps) => {
  if (!alimento) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{alimento.nombre}</DialogTitle>
          <Badge variant={getCategoryColor(alimento.categoria) as any} className="w-fit">
            {alimento.categoria}
          </Badge>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          {alimento.imagen_url ? (
            <div className="flex justify-center">
              <img
                src={alimento.imagen_url}
                alt={alimento.nombre}
                className="h-48 object-cover rounded-md"
                onError={(e) => {
                  // If image fails to load, show a placeholder
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/300x200/gray/white?text=No+imagen";
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-48 bg-muted rounded-md">
              <Utensils className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <p className="text-muted-foreground text-sm">Calorías (100g)</p>
              <p className="text-2xl font-bold">{alimento.calorias}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-muted-foreground text-sm">Proteínas (g)</p>
              <p className="text-2xl font-bold">{alimento.proteinas}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-muted-foreground text-sm">Carbohidratos (g)</p>
              <p className="text-2xl font-bold">{alimento.carbohidratos}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-muted-foreground text-sm">Grasas (g)</p>
              <p className="text-2xl font-bold">{alimento.grasas}</p>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlimentoPreview;
