
import React, { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReportes } from "@/hooks/entrenador/useReportes";
import ClientSelect from "@/components/entrenador/reports/ClientSelect";
import ReportContent from "@/components/entrenador/reports/ReportContent";

const Reports = () => {
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);
  const { clientsList, isLoading } = useReportes(selectedClient);

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
  };

  if (isLoading) {
    return <DashboardLayout><Skeleton className="w-[200px] h-[40px]" /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Informes</CardTitle>
          <CardDescription>Selecciona un cliente para ver sus informes.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientSelect onChange={handleClientChange} clientsList={clientsList} />
          {selectedClient ? (
            <ReportContent clientId={selectedClient} />
          ) : (
            <p className="mt-4 text-center text-muted-foreground">Selecciona un cliente para ver sus informes.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

// Export both as default and named export to ensure compatibility
export { Reports };
export default Reports;
