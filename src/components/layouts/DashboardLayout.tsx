
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/index";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Menu, 
  Dumbbell, 
  Utensils, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Home, 
  BarChart2, 
  Users, 
  Activity,
  Pizza,
  LogOut,
  DollarSign
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/useTheme";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge = ({ count }: NotificationBadgeProps) => {
  if (count <= 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, allowedRoles = Object.values(UserRole) }) => {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user?.role === UserRole.CLIENT) {
      import("@/hooks/cliente/useClientMessages").then(({ useClientMessages }) => {
        const { unreadCount, updateUnreadCount } = useClientMessages();
        setUnreadCount(unreadCount || 0);
      }).catch(err => {
        console.error("Error loading useClientMessages:", err);
      });
    }
  }, [user?.role]);

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      navigate("/login");
    }
  }, [user, loading, allowedRoles, navigate]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  const renderClientMenu = () => (
    <>
      <Link to="/cliente/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
        <Home className="h-4 w-4 mr-2" />
        Dashboard
      </Link>
      
      <Link to="/cliente/rutina" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
        <Dumbbell className="h-4 w-4 mr-2" />
        Mi Rutina
      </Link>
      
      <Link to="/cliente/dieta" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
        <Utensils className="h-4 w-4 mr-2" />
        Mi Dieta
      </Link>
      
      <Link to="/cliente/citas" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
        <Calendar className="h-4 w-4 mr-2" />
        Mis Citas
      </Link>
      
      <Link to="/cliente/mensajes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1 relative">
        <MessageSquare className="h-4 w-4 mr-2" />
        Mensajes
        {unreadCount > 0 && (
          <NotificationBadge count={unreadCount} />
        )}
      </Link>
      
      <Link to="/cliente/progreso" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
        <BarChart2 className="h-4 w-4 mr-2" />
        Mi Progreso
      </Link>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="flex items-center justify-center h-16 border-b dark:border-gray-700">
          <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">KraftApp</Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {user.role === UserRole.ADMIN && (
            <>
              <Link to="/admin/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link to="/admin/entrenadores" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <Users className="h-4 w-4 mr-2" />
                Entrenadores
              </Link>
            </>
          )}
          {user.role === UserRole.TRAINER && (
            <>
              <Link to="/entrenador/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link to="/entrenador/clientes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <Users className="h-4 w-4 mr-2" />
                Clientes
              </Link>
              <Link to="/entrenador/ejercicios" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <Activity className="h-4 w-4 mr-2" />
                Ejercicios
              </Link>
              <Link to="/entrenador/alimentos" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <Pizza className="h-4 w-4 mr-2" />
                Alimentos
              </Link>
              <Link to="/entrenador/citas" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <Calendar className="h-4 w-4 mr-2" />
                Citas
              </Link>
              <Link to="/entrenador/mensajes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensajes
              </Link>
              <Link to="/entrenador/pagos" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <DollarSign className="h-4 w-4 mr-2" />
                Pagos
              </Link>
              <Link to="/entrenador/informes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                <FileText className="h-4 w-4 mr-2" />
                Informes
              </Link>
            </>
          )}
          {user.role === UserRole.CLIENT && (
            renderClientMenu()
          )}
        </nav>
        <div className="p-4">
          <Separator className="my-2 dark:border-gray-700" />
          <div className="flex items-center justify-between">
            <ModeToggle />
          </div>
          <button onClick={logout} className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 mt-2 text-left flex items-center">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild className="md:hidden z-10 absolute top-4 left-4">
          <button className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md">
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </SheetTrigger>
        <SheetContent className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-0" side="left">
          <SheetHeader className="flex items-center justify-center h-16 border-b dark:border-gray-700">
            <SheetTitle className="text-xl font-bold text-gray-800 dark:text-white">KraftApp</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {user.role === UserRole.ADMIN && (
              <>
                <Link to="/admin/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/admin/entrenadores" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <Users className="h-4 w-4 mr-2" />
                  Entrenadores
                </Link>
              </>
            )}
            {user.role === UserRole.TRAINER && (
              <>
                <Link to="/entrenador/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/entrenador/clientes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <Users className="h-4 w-4 mr-2" />
                  Clientes
                </Link>
                <Link to="/entrenador/ejercicios" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <Activity className="h-4 w-4 mr-2" />
                  Ejercicios
                </Link>
                <Link to="/entrenador/alimentos" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <Pizza className="h-4 w-4 mr-2" />
                  Alimentos
                </Link>
                <Link to="/entrenador/citas" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Citas
                </Link>
                <Link to="/entrenador/mensajes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mensajes
                </Link>
                <Link to="/entrenador/pagos" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pagos
                </Link>
                <Link to="/entrenador/informes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 my-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Informes
                </Link>
              </>
            )}
            {user.role === UserRole.CLIENT && (
              renderClientMenu()
            )}
          </nav>
          <div className="p-4">
            <Separator className="my-2 dark:border-gray-700" />
            <div className="flex items-center justify-between">
              <ModeToggle />
            </div>
            <button onClick={logout} className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2 mt-2 text-left flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex md:hidden justify-start p-4">
          <button 
            className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md" 
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

// Export as both default and named export
export { DashboardLayout };
export default DashboardLayout;
