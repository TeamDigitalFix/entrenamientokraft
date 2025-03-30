
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "@/types/admin";

interface RecentActivityProps {
  activity: Activity[] | undefined;
  isLoading: boolean;
}

export const RecentActivity = ({ activity, isLoading }: RecentActivityProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        ) : activity && activity.length > 0 ? (
          <div className="space-y-4">
            {activity.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">No hay actividad reciente</div>
        )}
      </CardContent>
    </Card>
  );
};
