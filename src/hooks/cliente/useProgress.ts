
import { useState } from "react";
import { useMeasurementQueries } from "./progress/useMeasurementQueries";
import { useMeasurementMutations } from "./progress/useMeasurementMutations";

export const useProgress = (clientId?: string) => {
  const {
    measurements,
    isLoadingMeasurements,
    latestMeasurement,
    changes,
    chartData,
    isDialogOpen,
    setIsDialogOpen
  } = useMeasurementQueries(clientId);

  const {
    addMeasurement,
    isAddingMeasurement,
    deleteMeasurement,
    isDeletingMeasurement
  } = useMeasurementMutations();

  return {
    measurements,
    isLoadingMeasurements,
    latestMeasurement,
    changes,
    addMeasurement,
    isAddingMeasurement,
    deleteMeasurement,
    isDeletingMeasurement,
    chartData,
    isDialogOpen,
    setIsDialogOpen
  };
};
