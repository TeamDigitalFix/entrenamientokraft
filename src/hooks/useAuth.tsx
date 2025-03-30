
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/index";
import { UserRole } from "@/types/index";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay un usuario en localStorage
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Invalid credentials");
      }

      const userData: User = {
        id: data.id,
        username: data.username,
        password: data.password,
        role: data.role as UserRole,
        name: data.nombre,
        email: data.email || undefined,
        phone: data.telefono || undefined,
        createdAt: new Date(data.creado_en),
        updatedAt: new Date(data.actualizado_en),
        deleted: data.eliminado || false,
        trainerId: data.entrenador_id || undefined,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // Redireccionar según el rol
      if (userData.role === UserRole.ADMIN) {
        navigate("/admin/dashboard");
      } else if (userData.role === UserRole.TRAINER) {
        navigate("/entrenador/dashboard");
      } else if (userData.role === UserRole.CLIENT) {
        navigate("/cliente/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
