
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTrainer: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función para restaurar la ruta después de una recarga
  const restorePathAfterRefresh = (user: User) => {
    const lastPath = sessionStorage.getItem("lastPath");
    if (lastPath && lastPath !== "/login" && lastPath !== "/") {
      console.log("Restaurando ruta guardada:", lastPath);
      navigate(lastPath);
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar la aplicación
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("kraftUser");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Intentar restaurar la ruta - ejecutar después de un pequeño delay
          // para asegurarnos de que la navegación esté lista
          setTimeout(() => {
            restorePathAfterRefresh(parsedUser);
          }, 100);
        }
      } catch (error) {
        console.error("Error al inicializar la autenticación:", error);
        localStorage.removeItem("kraftUser");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate]);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Consultar a Supabase para encontrar al usuario
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
      
      if (error || !data) {
        throw new Error("Credenciales inválidas");
      }
      
      // Convertir el resultado de Supabase a nuestro tipo User
      const loggedInUser: User = {
        id: data.id,
        username: data.username,
        password: "", // No almacenar contraseñas en el cliente
        role: data.role as UserRole,
        name: data.nombre,
        email: data.email || undefined,
        phone: data.telefono || undefined,
        createdAt: new Date(data.creado_en),
        updatedAt: new Date(data.actualizado_en),
        deleted: data.eliminado || false,
        trainerId: data.entrenador_id || undefined
      };
      
      setUser(loggedInUser);
      localStorage.setItem("kraftUser", JSON.stringify(loggedInUser));
      
      toast.success(`Bienvenido, ${loggedInUser.name}`);
      
      // Redirigir según el rol
      if (loggedInUser.role === UserRole.ADMIN) {
        navigate("/admin/dashboard");
      } else if (loggedInUser.role === UserRole.TRAINER) {
        navigate("/entrenador/dashboard");
      } else {
        navigate("/cliente/dashboard");
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      toast.error("Usuario o contraseña incorrectos");
      throw new Error("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kraftUser");
    sessionStorage.removeItem("lastPath");
    toast.info("Sesión cerrada correctamente");
    navigate("/login");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isTrainer = user?.role === UserRole.TRAINER;
  const isClient = user?.role === UserRole.CLIENT;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isTrainer,
        isClient
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
