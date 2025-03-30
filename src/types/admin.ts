
export interface Trainer {
  id: string;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  clientCount: number;
  createdAt: Date;
}

export interface Stats {
  totalTrainers: number;
  activeTrainers: number;
  totalClients: number;
  clientsWithDiets: number;
  clientsWithRoutines: number;
  totalExercises: number;
  totalFoods: number;
}

export interface Activity {
  type: string;
  title: string;
  description: string;
  date: Date;
}
