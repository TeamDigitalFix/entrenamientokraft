
import React, { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Dumbbell, 
  Utensils, 
  Calendar, 
  MessageSquare, 
  BarChart2, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const DashboardLayout = ({ children, allowedRoles = [] }: DashboardLayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si no tiene permiso para acceder, redirigir según su rol
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }
    if (user.role === "entrenador") {
      return <Navigate to="/entrenador/dashboard" />;
    }
    if (user.role === "cliente") {
      return <Navigate to="/cliente/dashboard" />;
    }
    return <Navigate to="/login" />;
  }

  let sidebarItems: SidebarItem[] = [];

  // Dependiendo del rol, mostrar diferentes elementos en el sidebar
  if (user?.role === "admin") {
    sidebarItems = [
      { icon: <Home size={20} />, label: "Dashboard", path: "/admin/dashboard" },
      { icon: <Users size={20} />, label: "Entrenadores", path: "/admin/entrenadores" },
    ];
  } else if (user?.role === "entrenador") {
    sidebarItems = [
      { icon: <Home size={20} />, label: "Dashboard", path: "/entrenador/dashboard" },
      { icon: <Users size={20} />, label: "Clientes", path: "/entrenador/clientes" },
      { icon: <Dumbbell size={20} />, label: "Ejercicios", path: "/entrenador/ejercicios" },
      { icon: <Utensils size={20} />, label: "Alimentos", path: "/entrenador/alimentos" },
      { icon: <Calendar size={20} />, label: "Citas", path: "/entrenador/citas" },
      { icon: <MessageSquare size={20} />, label: "Mensajes", path: "/entrenador/mensajes" },
      { icon: <BarChart2 size={20} />, label: "Informes", path: "/entrenador/informes" },
    ];
  } else if (user?.role === "cliente") {
    sidebarItems = [
      { icon: <Home size={20} />, label: "Dashboard", path: "/cliente/dashboard" },
      { icon: <Dumbbell size={20} />, label: "Mi Rutina", path: "/cliente/rutina" },
      { icon: <Utensils size={20} />, label: "Mi Dieta", path: "/cliente/dieta" },
      { icon: <Calendar size={20} />, label: "Mis Citas", path: "/cliente/citas" },
      { icon: <MessageSquare size={20} />, label: "Mensajes", path: "/cliente/mensajes" },
      { icon: <BarChart2 size={20} />, label: "Mi Progreso", path: "/cliente/progreso" },
    ];
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar para mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 z-50 w-full bg-kraft-blue p-4 flex justify-between items-center">
          <h1 className="text-white font-bold text-xl">Kraft Training</h1>
          <Button variant="ghost" onClick={toggleSidebar} className="text-white">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div 
        className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out z-40 pt-16`
            : "relative"
        } bg-sidebar w-64 flex-shrink-0 flex flex-col`}
      >
        {!isMobile && (
          <div className="p-4 border-b border-sidebar-border flex items-center justify-center">
            <h1 className="font-bold text-xl text-white">Kraft Training</h1>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto py-4">
          <nav className="flex-1 px-2 space-y-1">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full flex items-center text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut size={20} className="mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? "pt-16" : ""}`}>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
