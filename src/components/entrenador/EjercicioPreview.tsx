
import { Ejercicio } from "@/types/ejercicios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useState } from "react";

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

  // Function to extract YouTube video ID from a YouTube URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Get YouTube video ID if there's a video URL
  const videoId = ejercicio.video_url ? getYouTubeVideoId(ejercicio.video_url) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
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
          {/* Display image */}
          {ejercicio.imagen_url ? (
            <div className="flex justify-center">
              <img
                src={ejercicio.imagen_url}
                alt={ejercicio.nombre}
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
              <Activity className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Description section */}
          {ejercicio.descripcion && (
            <Card className="p-4">
              <h3 className="font-medium mb-2">Descripción</h3>
              <p className="text-muted-foreground">{ejercicio.descripcion}</p>
            </Card>
          )}

          {/* Embedded YouTube video */}
          {videoId ? (
            <Card className="p-4">
              <h3 className="font-medium mb-2">Video demostrativo</h3>
              <div className="aspect-video overflow-hidden rounded-md">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`Video de ${ejercicio.nombre}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </Card>
          ) : ejercicio.video_url ? (
            <Card className="p-4">
              <h3 className="font-medium mb-2">Video demostrativo</h3>
              <p className="text-red-500">No se pudo cargar el video. URL no válida.</p>
              <a 
                href={ejercicio.video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Ver video externo
              </a>
            </Card>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EjercicioPreview;
