
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
  LogOut
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTheme } from "@/hooks/useTheme";
import { useClientMessages } from "@/hooks/cliente/useClientMessages";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
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

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, allowedRoles }) => {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const clientMessages = user?.role === UserRole.CLIENT ? useClientMessages() : null;

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      navigate("/login");
    }
  }, [user, loading, allowedRoles, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  const renderClientMenu = () => (
    <>
      <Link to="/cliente/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
        <Home className="h-4 w-4 mr-2" />
        Dashboard
      </Link>
      
      <Link to="/cliente/rutina" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
        <Dumbbell className="h-4 w-4 mr-2" />
        Mi Rutina
      </Link>
      
      <Link to="/cliente/dieta" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
        <Utensils className="h-4 w-4 mr-2" />
        Mi Dieta
      </Link>
      
      <Link to="/cliente/citas" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
        <Calendar className="h-4 w-4 mr-2" />
        Mis Citas
      </Link>
      
      <Link to="/cliente/mensajes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1 relative">
        <MessageSquare className="h-4 w-4 mr-2" />
        Mensajes
        {clientMessages?.unreadCount ? (
          <NotificationBadge count={clientMessages.unreadCount} />
        ) : null}
      </Link>
      
      <Link to="/cliente/progreso" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
        <BarChart2 className="h-4 w-4 mr-2" />
        Mi Progreso
      </Link>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar (hidden on small screens) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="flex items-center justify-center h-16 border-b dark:border-gray-700">
          <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">KraftApp</Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {user.role === UserRole.ADMIN && (
            <>
              <Link to="/admin/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link to="/admin/entrenadores" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                <Users className="h-4 w-4 mr-2" />
                Entrenadores
              </Link>
            </>
          )}
          {user.role === UserRole.TRAINER && (
            <>
              <Link to="/entrenador/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link to="/entrenador/clientes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                <Users className="h-4 w-4 mr-2" />
                Clientes
              </Link>
              <Link to="/entrenador/ejercicios" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                <Activity className="h-4 w-4 mr-2" />
                Ejercicios
              </Link>
              <Link to="/entrenador/alimentos" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                <Pizza className="h-4 w-4 mr-2" />
                Alimentos
              </Link>
              <Link to="/entrenador/citas" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                <Calendar className="h-4 w-4 mr-2" />
                Citas
              </Link>
              <Link to="/entrenador/mensajes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensajes
              </Link>
              <Link to="/entrenador/informes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
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
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <button onClick={logout} className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1 mt-2 text-left flex items-center">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger className="md:hidden absolute top-4 left-4">
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </SheetTrigger>
        <SheetContent className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
          <SheetHeader className="flex items-center justify-center h-16 border-b dark:border-gray-700">
            <SheetTitle className="text-xl font-bold text-gray-800 dark:text-white">KraftApp</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {user.role === UserRole.ADMIN && (
              <>
                <Link to="/admin/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/admin/entrenadores" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  <Users className="h-4 w-4 mr-2" />
                  Entrenadores
                </Link>
              </>
            )}
            {user.role === UserRole.TRAINER && (
              <>
                <Link to="/entrenador/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/entrenador/clientes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  <Users className="h-4 w-4 mr-2" />
                  Clientes
                </Link>
                <Link to="/entrenador/ejercicios" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  <Activity className="h-4 w-4 mr-2" />
                  Ejercicios
                </Link>
                <Link to="/entrenador/alimentos" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  <Pizza className="h-4 w-4 mr-2" />
                  Alimentos
                </Link>
                <Link to="/entrenador/citas" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Citas
                </Link>
                <Link to="/entrenador/mensajes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mensajes
                </Link>
                <Link to="/entrenador/informes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
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
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <button onClick={logout} className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1 mt-2 text-left flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
