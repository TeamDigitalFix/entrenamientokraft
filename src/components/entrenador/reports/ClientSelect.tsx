
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientSelectProps {
  onChange: (clientId: string) => void;
  clientsList: any[];
}

const ClientSelect: React.FC<ClientSelectProps> = ({ onChange, clientsList }) => {
  if (clientsList.length === 0) {
    return <p>No hay clientes disponibles.</p>;
  }

  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Selecciona un cliente" />
      </SelectTrigger>
      <SelectContent>
        {clientsList.map((cliente) => (
          <SelectItem key={cliente.id} value={cliente.id}>
            {cliente.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ClientSelect;
