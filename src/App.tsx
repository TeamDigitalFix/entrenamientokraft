
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Páginas de autenticación
import Login from "./pages/Login";

// Páginas de administrador
import AdminDashboard from "./pages/admin/Dashboard";
import TrainersPage from "./pages/admin/Trainers";

// Páginas de entrenador
import TrainerDashboard from "./pages/entrenador/Dashboard";

// Páginas de cliente
import ClientDashboard from "./pages/cliente/Dashboard";

// Página de 404
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Ruta raíz - redirige a login */}
            <Route path="/" element={<Navigate to="/login" />} />
            
            {/* Autenticación */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas de administrador */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/entrenadores" element={<TrainersPage />} />
            
            {/* Rutas de entrenador */}
            <Route path="/entrenador/dashboard" element={<TrainerDashboard />} />
            
            {/* Rutas de cliente */}
            <Route path="/cliente/dashboard" element={<ClientDashboard />} />
            
            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
