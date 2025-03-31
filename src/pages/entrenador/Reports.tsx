
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Utensils, TrendingUp, Info, PlusCircle, Percent, Scale } from "lucide-react";
import { UserRole } from "@/types/index";
import { useReportes } from "@/hooks/entrenador/useReportes";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgress } from "@/hooks/cliente/useProgress";
import { useClientRoutine } from "@/hooks/cliente/useClientRoutine";
import { useClientDiet } from "@/hooks/cliente/useClientDiet";
import MeasurementCard from "@/components/cliente/progress/MeasurementCard";
import ProgressChart from "@/components/cliente/progress/ProgressChart";
import MeasurementTable from "@/components/cliente/progress/MeasurementTable";
import MeasurementForm from "@/components/cliente/progress/MeasurementForm";
import DietCard from "@/components/cliente/diet/DietCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { NewMeasurement } from "@/types/progress";

// Define colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
