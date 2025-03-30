
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/index";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redireccionar usuarios autenticados a sus dashboards
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case UserRole.ADMIN:
          navigate("/admin/dashboard");
          break;
        case UserRole.TRAINER:
          navigate("/entrenador/dashboard");
          break;
        case UserRole.CLIENT:
          navigate("/cliente/dashboard");
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="w-full p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">KraftApp</div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700">
            Iniciar Sesión
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Gestiona tu entrenamiento personal
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            La plataforma integral para entrenadores y clientes que optimiza la gestión de rutinas, 
            dietas y seguimiento de progreso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/login")} 
              className="text-base md:text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
            >
              Comenzar ahora
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="w-full p-4 text-center text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} KraftApp. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
