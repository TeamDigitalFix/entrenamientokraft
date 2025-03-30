
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ResetDataDialogProps {
  onResetComplete?: () => void;
}

export const ResetDataDialog = ({ onResetComplete }: ResetDataDialogProps) => {
  const [isResetting, setIsResetting] = React.useState(false);

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      
      // Call the Supabase function to reset all application data
      const { error } = await supabase.rpc('reset_application_data');
      
      if (error) {
        throw error;
      }
      
      toast.success("Datos de la aplicación restablecidos correctamente", {
        description: "Se han eliminado todos los datos excepto el usuario administrador"
      });
      
      if (onResetComplete) {
        onResetComplete();
      }
    } catch (error) {
      console.error("Error al restablecer los datos:", error);
      toast.error("Error al restablecer los datos", {
        description: "Ha ocurrido un error al intentar restablecer los datos de la aplicación"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      className="gap-2" 
      onClick={handleResetData} 
      disabled={isResetting}
    >
      <Trash2 className="h-4 w-4" />
      {isResetting ? "Restableciendo..." : "Restablecer Datos"}
    </Button>
  );
};
