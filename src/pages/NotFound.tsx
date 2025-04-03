
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/index";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const handleRedirection = () => {
      // Verificar si hay una ruta guardada en sessionStorage
      const savedPath = sessionStorage.getItem("lastPath");
      
      console.error(
        "404 Error: Ruta no encontrada:",
        location.pathname
      );

      // Si el usuario está autenticado
      if (user) {
        // Si hay una ruta guardada y no es la página actual (para evitar bucles)
        if (savedPath && savedPath !== location.pathname && savedPath !== "/") {
          console.log("Redirigiendo a la ruta guardada:", savedPath);
          navigate(savedPath);
          return true;
        }
        
        // Si no hay ruta guardada, intentar redirigir según el rol
        const dashboardRoutes = {
          [UserRole.ADMIN]: "/admin/dashboard",
          [UserRole.TRAINER]: "/entrenador/dashboard",
          [UserRole.CLIENT]: "/cliente/dashboard"
        };
        
        const dashboardRoute = dashboardRoutes[user.role];
        
        if (dashboardRoute) {
          console.log(`Redirigiendo al dashboard de ${user.role}:`, dashboardRoute);
          navigate(dashboardRoute);
          return true;
        }
      } else {
        // Si no hay usuario autenticado, redirigir a login
        console.log("No hay usuario autenticado, redirigiendo a login");
        navigate("/login");
        return true;
      }
      
      return false;
    };

    // Intentar redireccionar
    const redirected = handleRedirection();
    
    // Si no se ha redireccionado, mostrar la página 404
    if (!redirected) {
      setIsRedirecting(false);
    }

    // Timeout de seguridad para evitar que el usuario se quede atrapado en la página 404
    const timeout = setTimeout(() => {
      setIsRedirecting(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [location.pathname, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 md:p-8">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Oops! Página no encontrada</p>
        
        {isRedirecting ? (
          <>
            <p className="text-gray-500 dark:text-gray-500 mb-4">Redirigiendo a una página disponible...</p>
            <div className="animate-pulse flex justify-center">
              <div className="h-2 w-16 bg-blue-500 rounded"></div>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-500 mb-4">No se pudo redireccionar automáticamente.</p>
            <div className="flex flex-col space-y-2 mt-4">
              <button 
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Ir a Login
              </button>
              <button 
                onClick={() => window.location.href = "/"}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Ir al Inicio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotFound;
