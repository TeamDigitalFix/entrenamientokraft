
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DietDayContent from "./DietDayContent";
import { ClientMeal } from "@/hooks/cliente/useClientDiet";

interface DietTabsProps {
  activeDay: string;
  setActiveDay: (day: string) => void;
  availableDays: string[];
  mealsByDay: Record<string, ClientMeal[]>;
  isToggling: boolean;
  clientId: string; // Add clientId prop
}

const DietTabs: React.FC<DietTabsProps> = ({ 
  activeDay, 
  setActiveDay, 
  availableDays, 
  mealsByDay,
  isToggling,
  clientId
}) => {
  return (
    <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
      <TabsList className="w-full grid grid-cols-7 mb-4">
        {availableDays.map(day => (
          <TabsTrigger 
            key={day} 
            value={day}
            className="text-xs sm:text-sm"
          >
            {day}
            {mealsByDay[day]?.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 min-w-5 h-5 text-xs hidden sm:flex items-center justify-center">
                {mealsByDay[day].length}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {availableDays.map(day => (
        <TabsContent key={day} value={day} className="space-y-6">
          <DietDayContent 
            meals={mealsByDay[day] || []} 
            isToggling={isToggling} 
            clientId={clientId} // Pass the clientId
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default DietTabs;
