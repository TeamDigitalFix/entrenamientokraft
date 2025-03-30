
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trainer } from "@/types/admin";

interface TrainerFormProps {
  type: "create" | "edit";
  data: {
    username: string;
    password?: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | Trainer;
  onCancel: () => void;
  onSubmit: () => void;
  onChange: (field: string, value: string) => void;
}

export const TrainerForm = ({ 
  type, 
  data, 
  onCancel, 
  onSubmit, 
  onChange 
}: TrainerFormProps) => {
  const isCreating = type === "create";
  const title = isCreating ? "Crear Nuevo Entrenador" : "Editar Entrenador";
  const description = isCreating 
    ? "Completa el formulario para agregar un nuevo entrenador al sistema."
    : "Actualiza la información del entrenador.";
  const submitLabel = isCreating ? "Crear Entrenador" : "Guardar Cambios";
  
  const [showPassword, setShowPassword] = useState(false);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Username*
          </Label>
          <Input
            id="username"
            value={data.username}
            onChange={(e) => onChange("username", e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">
            {isCreating ? "Contraseña*" : "Nueva Contraseña"}
          </Label>
          <div className="col-span-3 relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={(data as any).password || ""}
              onChange={(e) => onChange("password", e.target.value)}
              className="pr-12"
              placeholder={isCreating ? "" : "Dejar en blanco para no cambiar"}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nombre*
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">
            Teléfono
          </Label>
          <Input
            id="phone"
            value={data.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </DialogFooter>
    </DialogContent>
  );
};
