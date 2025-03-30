
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ejercicio, NuevoEjercicio } from "@/types/ejercicios";

interface EjercicioFormProps {
  tipo: "crear" | "editar";
  ejercicio?: Ejercicio;
  onCancel: () => void;
  onSubmit: (ejercicio: NuevoEjercicio) => void;
}

export const EjercicioForm = ({
  tipo,
  ejercicio,
  onCancel,
  onSubmit,
}: EjercicioFormProps) => {
  const isCreating = tipo === "crear";
  const title = isCreating ? "Crear Nuevo Ejercicio" : "Editar Ejercicio";
  const description = isCreating
    ? "Completa el formulario para agregar un nuevo ejercicio a tu biblioteca."
    : "Actualiza la información del ejercicio.";
  const submitLabel = isCreating ? "Crear Ejercicio" : "Guardar Cambios";

  const [formData, setFormData] = useState<NuevoEjercicio>({
    nombre: "",
    grupo_muscular: "",
    descripcion: "",
    imagen_url: "",
    video_url: "",
    dificultad: "Intermedio",
    tipo: "Fuerza",
  });

  useEffect(() => {
    if (ejercicio && !isCreating) {
      setFormData({
        nombre: ejercicio.nombre,
        grupo_muscular: ejercicio.grupo_muscular,
        descripcion: ejercicio.descripcion || "",
        imagen_url: ejercicio.imagen_url || "",
        video_url: ejercicio.video_url || "",
        dificultad: ejercicio.dificultad || "Intermedio",
        tipo: ejercicio.tipo || "Fuerza",
      });
    }
  }, [ejercicio, isCreating]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className="text-right">
              Nombre*
            </Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grupo_muscular" className="text-right">
              Grupo Muscular*
            </Label>
            <Select
              value={formData.grupo_muscular}
              onValueChange={(value) =>
                handleSelectChange("grupo_muscular", value)
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un grupo muscular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pectoral">Pectoral</SelectItem>
                <SelectItem value="Espalda">Espalda</SelectItem>
                <SelectItem value="Piernas">Piernas</SelectItem>
                <SelectItem value="Brazos">Brazos</SelectItem>
                <SelectItem value="Hombros">Hombros</SelectItem>
                <SelectItem value="Core">Core</SelectItem>
                <SelectItem value="Completo">Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dificultad" className="text-right">
              Dificultad
            </Label>
            <Select
              value={formData.dificultad}
              onValueChange={(value) => handleSelectChange("dificultad", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona una dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Principiante">Principiante</SelectItem>
                <SelectItem value="Intermedio">Intermedio</SelectItem>
                <SelectItem value="Avanzado">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo" className="text-right">
              Tipo
            </Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleSelectChange("tipo", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fuerza">Fuerza</SelectItem>
                <SelectItem value="Compuesto">Compuesto</SelectItem>
                <SelectItem value="Aislamiento">Aislamiento</SelectItem>
                <SelectItem value="Peso corporal">Peso corporal</SelectItem>
                <SelectItem value="Isométrico">Isométrico</SelectItem>
                <SelectItem value="Cardio">Cardio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descripcion" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={handleChange}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imagen_url" className="text-right">
              URL de Imagen
            </Label>
            <Input
              id="imagen_url"
              name="imagen_url"
              value={formData.imagen_url || ""}
              onChange={handleChange}
              className="col-span-3"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="video_url" className="text-right">
              URL de Video
            </Label>
            <Input
              id="video_url"
              name="video_url"
              value={formData.video_url || ""}
              onChange={handleChange}
              className="col-span-3"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
