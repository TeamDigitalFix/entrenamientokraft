
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Restablecer Datos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Restablecer todos los datos?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará todos los datos de la aplicación, incluyendo usuarios, entrenadores,
            clientes, rutinas, dietas, pagos y toda la información del sistema excepto el usuario administrador.
            <br /><br />
            <span className="font-bold text-destructive">
              Esta acción no se puede deshacer.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleResetData}
            disabled={isResetting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isResetting ? "Restableciendo..." : "Sí, restablecer datos"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
