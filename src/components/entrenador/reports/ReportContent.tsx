
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, TrendingUp, Utensils, Dumbbell } from "lucide-react";

import OverviewTab from "./tabs/OverviewTab";
import ProgressTab from "./tabs/ProgressTab";
import DietTab from "./tabs/DietTab";
import RoutineTab from "./tabs/RoutineTab";

interface ReportContentProps {
  clientId: string;
}

const ReportContent: React.FC<ReportContentProps> = ({ clientId }) => {
  return (
    <Tabs defaultValue="overview" className="w-full mt-4">
      <TabsList>
        <TabsTrigger value="overview">
          <Info className="mr-2 h-4 w-4" />
          Vista General
        </TabsTrigger>
        <TabsTrigger value="progress">
          <TrendingUp className="mr-2 h-4 w-4" />
          Progreso
        </TabsTrigger>
        <TabsTrigger value="diet">
          <Utensils className="mr-2 h-4 w-4" />
          Dieta
        </TabsTrigger>
        <TabsTrigger value="routine">
          <Dumbbell className="mr-2 h-4 w-4" />
          Rutina
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <OverviewTab clientId={clientId} />
      </TabsContent>
      <TabsContent value="progress" className="space-y-4">
        <ProgressTab clientId={clientId} />
      </TabsContent>
      <TabsContent value="diet" className="space-y-4">
        <DietTab clientId={clientId} />
      </TabsContent>
      <TabsContent value="routine" className="space-y-4">
        <RoutineTab clientId={clientId} />
      </TabsContent>
    </Tabs>
  );
};

export default ReportContent;
