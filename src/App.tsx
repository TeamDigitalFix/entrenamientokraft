
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";

// Páginas de autenticación
import Login from "./pages/Login";

// Páginas de administrador
import AdminDashboard from "./pages/admin/Dashboard";
import TrainersPage from "./pages/admin/Trainers";

// Páginas de entrenador
import TrainerDashboard from "./pages/entrenador/Dashboard";
import TrainerClients from "./pages/entrenador/Clients";
import TrainerExercises from "./pages/entrenador/Exercises";
import TrainerFoods from "./pages/entrenador/Foods";
import TrainerAppointments from "./pages/entrenador/Appointments";
import TrainerMessages from "./pages/entrenador/Messages";
import TrainerReports from "./pages/entrenador/Reports";
import TrainerPayments from "./pages/entrenador/Pagos";

// Páginas de cliente
import ClientDashboard from "./pages/cliente/Dashboard";
import ClientRoutine from "./pages/cliente/Routine";
import ClientDiet from "./pages/cliente/Diet";
import ClientAppointments from "./pages/cliente/Appointments";
import ClientMessages from "./pages/cliente/Messages";
import ClientProgress from "./pages/cliente/Progress";

// Páginas de gestión de clientes
import TrainerClientRoutine from "./pages/entrenador/ClientRoutine";
import TrainerClientDiet from "./pages/entrenador/ClientDiet";

// Página de 404
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
              <Route path="/entrenador/clientes" element={<TrainerClients />} />
              <Route path="/entrenador/ejercicios" element={<TrainerExercises />} />
              <Route path="/entrenador/alimentos" element={<TrainerFoods />} />
              <Route path="/entrenador/citas" element={<TrainerAppointments />} />
              <Route path="/entrenador/mensajes" element={<TrainerMessages />} />
              <Route path="/entrenador/informes" element={<TrainerReports />} />
              <Route path="/entrenador/pagos" element={<TrainerPayments />} />
              
              {/* Rutas de gestión de clientes específicos */}
              <Route path="/entrenador/cliente/:clientId/rutina" element={<TrainerClientRoutine />} />
              <Route path="/entrenador/cliente/:clientId/dieta" element={<TrainerClientDiet />} />
              
              {/* Rutas de cliente */}
              <Route path="/cliente/dashboard" element={<ClientDashboard />} />
              <Route path="/cliente/rutina" element={<ClientRoutine />} />
              <Route path="/cliente/dieta" element={<ClientDiet />} />
              <Route path="/cliente/citas" element={<ClientAppointments />} />
              <Route path="/cliente/mensajes" element={<ClientMessages />} />
              <Route path="/cliente/progreso" element={<ClientProgress />} />
              
              {/* Ruta 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
