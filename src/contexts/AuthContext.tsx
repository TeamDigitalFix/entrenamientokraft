
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "@/types";

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

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar la aplicación
    const storedUser = localStorage.getItem("kraftUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // TODO: Implementar la validación con Supabase
      // Por ahora, simularemos un usuario para desarrollo
      
      // En producción, esto se reemplazará con una consulta a Supabase
      const mockUser: User = {
        id: "1",
        username,
        password: "", // No almacenar contraseñas en el cliente
        role: username.includes("admin") 
          ? UserRole.ADMIN 
          : username.includes("entrenador") 
            ? UserRole.TRAINER 
            : UserRole.CLIENT,
        name: "Usuario de Prueba",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setUser(mockUser);
      localStorage.setItem("kraftUser", JSON.stringify(mockUser));
      
      // Redirigir según el rol
      if (mockUser.role === UserRole.ADMIN) {
        navigate("/admin/dashboard");
      } else if (mockUser.role === UserRole.TRAINER) {
        navigate("/entrenador/dashboard");
      } else {
        navigate("/cliente/dashboard");
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      throw new Error("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kraftUser");
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
