import { serve } from "@hono/node-server";
import { env } from "./env.js";
import { prisma } from "./db.js";
import { createApp } from "./app.js";

const app = createApp(prisma);

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`Hono server running on http://localhost:${info.port}`);
});
