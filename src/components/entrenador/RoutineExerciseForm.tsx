
import React from "react";
import RutinaEjercicioForm from "./RutinaEjercicioForm";

// This is a wrapper component to maintain compatibility with imports while using our Spanish-named component
const RoutineExerciseForm = (props) => {
  return <RutinaEjercicioForm {...props} />;
};

export default RoutineExerciseForm;
