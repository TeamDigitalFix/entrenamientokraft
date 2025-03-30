
import React from "react";
import RutinaEjercicioForm from "./RutinaEjercicioForm";

// Este es un componente wrapper para mantener la compatibilidad con los imports mientras usamos nuestro componente con nombre en español
const RoutineExerciseForm = (props: any) => {
  return <RutinaEjercicioForm {...props} />;
};

export default RoutineExerciseForm;
