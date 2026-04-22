import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

let container: StartedPostgreSqlContainer;
let testPrisma: PrismaClient;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const databaseUrl = container.getConnectionUri();

  // Alembic がマイグレーションの管理主体。テスト用に SQL で直接テーブルを作成
  const setupAdapter = new PrismaPg({ connectionString: databaseUrl });
  const setupPrisma = new PrismaClient({ adapter: setupAdapter });

  await setupPrisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP(6) NOT NULL DEFAULT now(),
      updated_at TIMESTAMP(6) NOT NULL DEFAULT now()
    )
  `;
  await setupPrisma.$executeRaw`CREATE INDEX IF NOT EXISTS ix_todos_id ON todos (id)`;
  await setupPrisma.$disconnect();

  // テスト用 PrismaClient をグローバルに保持
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  testPrisma = new PrismaClient({ adapter });
});

afterAll(async () => {
  await testPrisma?.$disconnect();
  await container?.stop();
});

export function getTestPrisma(): PrismaClient {
  return testPrisma;
}
