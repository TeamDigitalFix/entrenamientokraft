
export enum UserRole {
  ADMIN = "admin",
  TRAINER = "entrenador",
  CLIENT = "cliente"
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
  trainerId?: string; // Para clientes, ID del entrenador asignado
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  createdBy: string; // ID del entrenador
  createdAt: Date;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  createdBy: string; // ID del entrenador
  createdAt: Date;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  notes?: string;
  date: Date; // Changed from day (number) to date (Date)
}

export interface Routine {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  exercises: RoutineExercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DietMeal {
  id: string;
  foodId: string;
  quantity: number; // en gramos
  mealType: string; // desayuno, almuerzo, cena, etc.
  date: Date; // Changed from day (number) to date (Date)
}

export interface Diet {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  meals: DietMeal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Progress {
  id: string;
  clientId: string;
  date: Date;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  description?: string;
  date: Date;
  duration: number; // en minutos
  status: "pendiente" | "completada" | "cancelada";
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface CompletedExercise {
  id: string;
  clientId: string;
  routineExerciseId: string;
  completedDate: Date;
  actualSets: number;
  actualReps: number;
  actualWeight?: number;
  notes?: string;
}
