
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils } from "lucide-react";
import DietCard from "@/components/cliente/diet/DietCard";
import { useClientDiet } from "@/hooks/cliente/useClientDiet";

interface DietTabProps {
  clientId: string;
}

const DietTab: React.FC<DietTabProps> = ({ clientId }) => {
  const dietHook = useClientDiet(clientId);

  // Log diet data for debugging
  console.log("Diet data in DietTab:", dietHook.diet);

  if (dietHook.isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!dietHook.diet) {
    return (
      <div className="text-center py-8">
        <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No hay dieta asignada para este cliente</p>
      </div>
    );
  }

  return <DietCard dietHook={dietHook} />;
};

export default DietTab;
