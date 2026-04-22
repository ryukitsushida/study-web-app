import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { PrismaClient } from "../generated/prisma/client.js";
import { NotFoundError } from "../errors.js";
import {
  createTodoSchema,
  updateTodoSchema,
  todoIdParam,
} from "../schemas/todo.js";

type Env = { Variables: { db: PrismaClient } };

const todos = new Hono<Env>();

// レスポンス変換（Prisma の Date → ISO 文字列）
function formatTodo(todo: {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    created_at: todo.created_at.toISOString(),
    updated_at: todo.updated_at.toISOString(),
  };
}

// GET /api/todos
todos.get("/", async (c) => {
  const db = c.get("db");
  const list = await db.todo.findMany({
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
  });
  return c.json(list.map(formatTodo));
});

// GET /api/todos/:id
todos.get("/:id", zValidator("param", todoIdParam), async (c) => {
  const { id } = c.req.valid("param");
  const db = c.get("db");
  const todo = await db.todo.findUnique({ where: { id } });
  if (!todo) throw new NotFoundError("TODO");
  return c.json(formatTodo(todo));
});

// POST /api/todos
todos.post("/", zValidator("json", createTodoSchema), async (c) => {
  const data = c.req.valid("json");
  const db = c.get("db");
  const todo = await db.todo.create({
    data: {
      title: data.title,
      description: data.description ?? null,
    },
  });
  return c.json(formatTodo(todo), 201);
});

// PATCH /api/todos/:id
todos.patch(
  "/:id",
  zValidator("param", todoIdParam),
  zValidator("json", updateTodoSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const db = c.get("db");

    const existing = await db.todo.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("TODO");

    const todo = await db.todo.update({
      where: { id },
      data: { ...data, updated_at: new Date() },
    });
    return c.json(formatTodo(todo));
  },
);

// DELETE /api/todos/:id
todos.delete("/:id", zValidator("param", todoIdParam), async (c) => {
  const { id } = c.req.valid("param");
  const db = c.get("db");

  const existing = await db.todo.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("TODO");

  await db.todo.delete({ where: { id } });
  return c.body(null, 204);
});

export { todos };
