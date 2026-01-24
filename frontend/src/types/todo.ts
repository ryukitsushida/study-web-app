export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
  description?: string;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}
