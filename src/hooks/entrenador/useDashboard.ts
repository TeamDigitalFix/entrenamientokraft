
import { useState, useEffect } from "react";
import { useDashboardStats, DashboardStats } from "./useDashboardStats";
import { useDashboardAppointments } from "./useDashboardAppointments";
import { useDashboardMessages } from "./useDashboardMessages";

// Re-export the types from each hook
export type { DashboardStats } from "./useDashboardStats";
export type { DashboardAppointment } from "./useDashboardAppointments";
export type { DashboardMessage } from "./useDashboardMessages";

export const useDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const { stats: dashboardStats, isLoading: isLoadingStats } = useDashboardStats();
  const { todayAppointments, isLoading: isLoadingAppointments } = useDashboardAppointments();
  const { recentMessages, isLoading: isLoadingMessages } = useDashboardMessages();

  // Efecto para combinar los estados de carga
  useEffect(() => {
    setIsLoading(isLoadingStats || isLoadingAppointments || isLoadingMessages);
  }, [isLoadingStats, isLoadingAppointments, isLoadingMessages]);

  return {
    dashboardStats,
    todayAppointments,
    recentMessages,
    isLoading
  };
};
