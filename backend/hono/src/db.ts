import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

export function createPrismaClient(url?: string): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: url ?? env.databaseUrl,
  });
  return new PrismaClient({ adapter });
}

export const prisma = createPrismaClient();
