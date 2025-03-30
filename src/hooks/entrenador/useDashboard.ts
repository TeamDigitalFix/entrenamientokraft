
import { useState, useEffect } from "react";
import { useDashboardStats } from "./useDashboardStats";
import { useDashboardAppointments } from "./useDashboardAppointments";
import { useDashboardMessages } from "./useDashboardMessages";
import { useDashboardActivity } from "./useDashboardActivity";

// Re-export the types from each hook
export type { DashboardStats } from "./useDashboardStats";
export type { DashboardAppointment } from "./useDashboardAppointments";
export type { DashboardMessage } from "./useDashboardMessages";
export type { WeeklyActivity } from "./useDashboardActivity";

export const useDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const { dashboardStats, isLoading: isLoadingStats } = useDashboardStats();
  const { todayAppointments, isLoading: isLoadingAppointments } = useDashboardAppointments();
  const { recentMessages, isLoading: isLoadingMessages } = useDashboardMessages();
  const { weeklyActivity, isLoading: isLoadingActivity } = useDashboardActivity();

  // Efecto para combinar los estados de carga
  useEffect(() => {
    setIsLoading(isLoadingStats || isLoadingAppointments || isLoadingMessages || isLoadingActivity);
  }, [isLoadingStats, isLoadingAppointments, isLoadingMessages, isLoadingActivity]);

  return {
    dashboardStats,
    todayAppointments,
    recentMessages,
    weeklyActivity,
    isLoading
  };
};
