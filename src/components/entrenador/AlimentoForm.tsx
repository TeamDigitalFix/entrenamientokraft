
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { NuevoAlimento, Alimento } from "@/hooks/entrenador/useAlimentos";
import { Textarea } from "@/components/ui/textarea";

interface AlimentoFormProps {
  tipo: "crear" | "editar" | "clonar";
  alimento?: Alimento;
  onCancel: () => void;
  onSubmit: (alimento: NuevoAlimento) => void;
}

export const AlimentoForm = ({
  tipo,
  alimento,
  onCancel,
  onSubmit,
}: AlimentoFormProps) => {
  const isCreating = tipo === "crear";
  const isCloning = tipo === "clonar";
  
  let title = "Crear Nuevo Alimento";
  let description = "Completa el formulario para agregar un nuevo alimento a tu biblioteca.";
  let submitLabel = "Crear Alimento";
  
  if (tipo === "editar") {
    title = "Editar Alimento";
    description = "Actualiza la información del alimento.";
    submitLabel = "Guardar Cambios";
  } else if (tipo === "clonar") {
    title = "Duplicar Alimento";
    description = "Edita este alimento para crear una nueva variante en tu biblioteca.";
    submitLabel = "Crear Copia";
  }

  const [formData, setFormData] = useState<NuevoAlimento>({
    nombre: "",
    categoria: "Proteínas",
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
    imagen_url: "",
  });

  useEffect(() => {
    if (alimento && (tipo === "editar" || tipo === "clonar")) {
      let nombreValue = alimento.nombre;
      
      // If cloning, add "- Copia" to the name
      if (isCloning) {
        nombreValue = `${alimento.nombre} - Copia`;
      }
      
      setFormData({
        nombre: nombreValue,
        categoria: alimento.categoria,
        calorias: alimento.calorias,
        proteinas: alimento.proteinas,
        carbohidratos: alimento.carbohidratos,
        grasas: alimento.grasas,
        imagen_url: alimento.imagen_url,
      });
    }
  }, [alimento, tipo, isCloning]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Convertir a número si el campo debe ser numérico
    if (["calorias", "proteinas", "carbohidratos", "grasas"].includes(name)) {
      const numValue = value === "" ? 0 : parseFloat(value);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
            <Label htmlFor="categoria" className="text-right">
              Categoría*
            </Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) =>
                handleSelectChange("categoria", value)
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Proteínas">Proteínas</SelectItem>
                <SelectItem value="Carbohidratos">Carbohidratos</SelectItem>
                <SelectItem value="Grasas">Grasas</SelectItem>
                <SelectItem value="Frutas">Frutas</SelectItem>
                <SelectItem value="Verduras">Verduras</SelectItem>
                <SelectItem value="Lácteos">Lácteos</SelectItem>
                <SelectItem value="Legumbres">Legumbres</SelectItem>
                <SelectItem value="Frutos secos">Frutos secos</SelectItem>
                <SelectItem value="Bebidas">Bebidas</SelectItem>
                <SelectItem value="Otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="calorias" className="text-right">
              Calorías (100g)*
            </Label>
            <Input
              id="calorias"
              name="calorias"
              type="number"
              min="0"
              step="1"
              value={formData.calorias || ""}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="proteinas" className="text-right">
              Proteínas (g)*
            </Label>
            <Input
              id="proteinas"
              name="proteinas"
              type="number"
              min="0"
              step="0.1"
              value={formData.proteinas || ""}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carbohidratos" className="text-right">
              Carbohidratos (g)*
            </Label>
            <Input
              id="carbohidratos"
              name="carbohidratos"
              type="number"
              min="0"
              step="0.1"
              value={formData.carbohidratos || ""}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grasas" className="text-right">
              Grasas (g)*
            </Label>
            <Input
              id="grasas"
              name="grasas"
              type="number"
              min="0"
              step="0.1"
              value={formData.grasas || ""}
              onChange={handleChange}
              className="col-span-3"
              required
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
