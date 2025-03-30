
import React from "react";
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
    password: string;
    name: string;
    email: string;
    phone: string;
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

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {isCreating && (
          <>
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
                Contraseña*
              </Label>
              <Input
                id="password"
                type="password"
                value={(data as any).password}
                onChange={(e) => onChange("password", e.target.value)}
                className="col-span-3"
              />
            </div>
          </>
        )}
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
