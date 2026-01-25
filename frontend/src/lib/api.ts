import { Todo, TodoCreate, TodoUpdate } from "@/types/todo";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const todoApi = {
  getAll: () => fetchApi<Todo[]>("/todos"),

  getById: (id: number) => fetchApi<Todo>(`/todos/${id}`),

  create: (data: TodoCreate) =>
    fetchApi<Todo>("/todos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: TodoUpdate) =>
    fetchApi<Todo>(`/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<void>(`/todos/${id}`, {
      method: "DELETE",
    }),
};
