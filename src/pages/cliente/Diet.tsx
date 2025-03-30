
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { UserRole } from "@/types/index";
import { useClientDiet } from "@/hooks/cliente/useClientDiet";
import DietCard from "@/components/cliente/diet/DietCard";

const ClientDiet = () => {
  const dietHook = useClientDiet();

  return (
    <DashboardLayout allowedRoles={[UserRole.CLIENT]}>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mi Dieta</h1>
        <p className="text-muted-foreground">Aquí puedes ver y seguir tu plan de alimentación personalizado</p>
        
        <DietCard dietHook={dietHook} />
      </div>
    </DashboardLayout>
  );
};

export default ClientDiet;
