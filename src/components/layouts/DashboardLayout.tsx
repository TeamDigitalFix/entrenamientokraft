import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/index";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const DashboardLayout = ({ children, allowedRoles }: DashboardLayoutProps) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

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
                Dashboard
              </Link>
              <Link to="/admin/entrenadores" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                Entrenadores
              </Link>
            </>
          )}
          {user.role === UserRole.TRAINER && (
            <>
              <Link to="/entrenador/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                Dashboard
              </Link>
              <Link to="/entrenador/clientes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                Clientes
              </Link>
              <Link to="/entrenador/ejercicios" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                Ejercicios
              </Link>
              <Link to="/entrenador/alimentos" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                Alimentos
              </Link>
              <Link to="/entrenador/citas" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                Citas
              </Link>
              <Link to="/entrenador/mensajes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                Mensajes
              </Link>
              <Link to="/entrenador/informes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                Informes
              </Link>
            </>
          )}
          {user.role === UserRole.CLIENT && (
            <Link to="/cliente/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
              Dashboard
            </Link>
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
          <button onClick={logout} className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1 text-left">Cerrar sesión</button>
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
                  Dashboard
                </Link>
                <Link to="/admin/entrenadores" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  Entrenadores
                </Link>
              </>
            )}
            {user.role === UserRole.TRAINER && (
              <>
                <Link to="/entrenador/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  Dashboard
                </Link>
                <Link to="/entrenador/clientes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  Clientes
                </Link>
                <Link to="/entrenador/ejercicios" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  Ejercicios
                </Link>
                <Link to="/entrenador/alimentos" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  Alimentos
                </Link>
                <Link to="/entrenador/citas" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  Citas
                </Link>
                <Link to="/entrenador/mensajes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  Mensajes
                </Link>
                <Link to="/entrenador/informes" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                  Informes
                </Link>
              </>
            )}
            {user.role === UserRole.CLIENT && (
              <Link to="/cliente/dashboard" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1">
                Dashboard
              </Link>
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
            <button onClick={logout} className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-1 text-left">Cerrar sesión</button>
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
