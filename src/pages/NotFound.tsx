
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/index";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Si el usuario está autenticado, redirigir según su rol
    if (user) {
      const path = location.pathname;
      
      // Intenta redirigir al usuario a la página correcta basado en la URL actual
      if (path.includes("/admin/") && user.role === UserRole.ADMIN) {
        // Si la URL contiene /admin/ y el usuario es administrador, redirigir al dashboard
        navigate("/admin/dashboard");
      } else if (path.includes("/entrenador/") && user.role === UserRole.TRAINER) {
        // Si la URL contiene /entrenador/ y el usuario es entrenador, redirigir al dashboard
        navigate("/entrenador/dashboard");
      } else if (path.includes("/cliente/") && user.role === UserRole.CLIENT) {
        // Si la URL contiene /cliente/ y el usuario es cliente, redirigir al dashboard
        navigate("/cliente/dashboard");
      } else {
        // Redirigir al dashboard según el rol del usuario
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
            navigate("/login");
        }
      }
    } else {
      // Si no hay usuario autenticado, redirigir a login
      navigate("/login");
    }
  }, [location.pathname, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Oops! Página no encontrada</p>
        <p className="text-gray-500 dark:text-gray-500 mb-4">Redirigiendo a una página disponible...</p>
      </div>
    </div>
  );
};

export default NotFound;
