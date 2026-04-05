import { describe, it, expect, beforeEach } from "vitest";
import { createApp } from "../../src/app.js";
import { getTestPrisma } from "../setup.js";

function app() {
  return createApp(getTestPrisma());
}

describe("GET /health", () => {
  it("200: ヘルスチェックが正常に応答すること", async () => {
    const res = await app().request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});

describe("POST /api/todos", () => {
  beforeEach(async () => {
    await getTestPrisma().todo.deleteMany();
  });

  it("201: TODOを作成できること", async () => {
    const res = await app().request("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test Todo" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeGreaterThan(0);
    expect(body.title).toBe("Test Todo");
    expect(body.description).toBeNull();
    expect(body.completed).toBe(false);
    expect(body.created_at).toBeDefined();
    expect(body.updated_at).toBeDefined();
  });

  it("201: description 付きで作成できること", async () => {
    const res = await app().request("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", description: "Hello" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.description).toBe("Hello");
  });

  it("400: title が空の場合", async () => {
    const res = await app().request("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    expect(res.status).toBe(400);
  });

  it("400: title が 255 文字超の場合", async () => {
    const res = await app().request("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "a".repeat(256) }),
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/todos", () => {
  beforeEach(async () => {
    await getTestPrisma().todo.deleteMany();
  });

  it("200: 空リストを返すこと", async () => {
    const res = await app().request("/api/todos");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("200: created_at 降順で返すこと", async () => {
    const db = getTestPrisma();
    await db.todo.create({ data: { title: "First" } });
    await db.todo.create({ data: { title: "Second" } });
    await db.todo.create({ data: { title: "Third" } });

    const res = await app().request("/api/todos");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(3);
    expect(body[0].title).toBe("Third");
    expect(body[2].title).toBe("First");
  });
});

describe("GET /api/todos/:id", () => {
  beforeEach(async () => {
    await getTestPrisma().todo.deleteMany();
  });

  it("200: 指定 ID の TODO を取得できること", async () => {
    const db = getTestPrisma();
    const created = await db.todo.create({ data: { title: "Test" } });

    const res = await app().request(`/api/todos/${created.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(created.id);
    expect(body.title).toBe("Test");
  });

  it("404: 存在しない ID の場合", async () => {
    const res = await app().request("/api/todos/99999");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ detail: "TODO not found" });
  });
});

describe("PATCH /api/todos/:id", () => {
  beforeEach(async () => {
    await getTestPrisma().todo.deleteMany();
  });

  it("200: title を更新できること", async () => {
    const db = getTestPrisma();
    const created = await db.todo.create({ data: { title: "Original" } });

    const res = await app().request(`/api/todos/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Updated");
  });

  it("200: completed を更新できること", async () => {
    const db = getTestPrisma();
    const created = await db.todo.create({ data: { title: "Test" } });

    const res = await app().request(`/api/todos/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });

    expect(res.status).toBe(200);
    expect((await res.json()).completed).toBe(true);
  });

  it("404: 存在しない ID の場合", async () => {
    const res = await app().request("/api/todos/99999", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/todos/:id", () => {
  beforeEach(async () => {
    await getTestPrisma().todo.deleteMany();
  });

  it("204: TODO を削除できること", async () => {
    const db = getTestPrisma();
    const created = await db.todo.create({ data: { title: "Test" } });

    const res = await app().request(`/api/todos/${created.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(204);

    // 削除後に取得すると 404
    const getRes = await app().request(`/api/todos/${created.id}`);
    expect(getRes.status).toBe(404);
  });

  it("404: 存在しない ID の場合", async () => {
    const res = await app().request("/api/todos/99999", {
      method: "DELETE",
    });
    expect(res.status).toBe(404);
  });
});
