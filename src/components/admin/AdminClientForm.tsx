
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminClientData } from "@/hooks/admin/useAdminClients";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  clientData: AdminClientData;
  setClientData: React.Dispatch<React.SetStateAction<AdminClientData>>;
  onSubmit: (data: AdminClientData) => void;
  isEdit?: boolean;
}

export const AdminClientForm: React.FC<AdminClientFormProps> = ({
  open,
  onOpenChange,
  title,
  clientData,
  setClientData,
  onSubmit,
  isEdit = false
}) => {
  const { data: trainers = [] } = useQuery({
    queryKey: ["trainers-dropdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre")
        .eq("role", "entrenador")
        .eq("eliminado", false);

      if (error) {
        console.error("Error fetching trainers:", error);
        return [];
      }
      return data || [];
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(clientData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTrainerChange = (value: string) => {
    setClientData(prev => ({
      ...prev,
      entrenador_id: value === "null" ? null : value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                name="nombre"
                value={clientData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={clientData.email || ""}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={clientData.telefono || ""}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="entrenador_id">Entrenador asignado</Label>
              <Select 
                value={clientData.entrenador_id || "null"} 
                onValueChange={handleTrainerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar entrenador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Sin asignar</SelectItem>
                  {trainers.map((trainer: any) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                name="username"
                value={clientData.username}
                onChange={handleChange}
                required
                aria-describedby="username-description"
              />
              <p id="username-description" className="text-xs text-muted-foreground">
                El nombre de usuario debe ser único en el sistema
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">
                {isEdit ? "Nueva contraseña (dejar en blanco para mantener actual)" : "Contraseña"}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={clientData.password || ""}
                onChange={handleChange}
                required={!isEdit}
                placeholder={isEdit ? "••••••••" : ""}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{isEdit ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
