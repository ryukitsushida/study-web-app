import { z } from "zod";

export const createTodoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1024).nullish(),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1024).nullish(),
  completed: z.boolean().optional(),
});

export const todoIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
