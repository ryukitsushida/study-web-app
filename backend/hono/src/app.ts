import { Hono } from "hono";
import { cors } from "hono/cors";
import type { PrismaClient } from "./generated/prisma/client.js";
import { env } from "./env.js";
import { todos } from "./routes/todos.js";
import { errorHandler } from "./middleware/error-handler.js";

type Env = { Variables: { db: PrismaClient } };

/**
 * Hono app ファクトリ
 * - テスト時にモック PrismaClient を注入可能
 * - サーバー起動と分離（index.ts が起動を担当）
 */
export function createApp(db: PrismaClient) {
  const app = new Hono<Env>();

  // Middleware: Prisma Client を Context に注入
  app.use("*", async (c, next) => {
    c.set("db", db);
    await next();
  });

  // Middleware: CORS
  app.use(
    "*",
    cors({
      origin: env.allowedOrigins,
    }),
  );

  // Health check
  app.get("/health", (c) => c.json({ status: "ok" }));

  // Routes
  app.route("/api/todos", todos);

  // Error handler
  app.onError(errorHandler);

  return app;
}
