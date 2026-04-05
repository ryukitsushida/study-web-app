import { todoApi } from "@/lib/api";

const API_BASE_URL = "http://localhost:8000/api";

const mockTodo = {
  id: 1,
  title: "テストタスク",
  description: "テストの説明",
  completed: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

function mockFetchResponse(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("fetchApi", () => {
  it("APIエラー時に例外をスローする", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(todoApi.getAll()).rejects.toThrow("API Error: 500");
  });

  it("Content-Type ヘッダーが設定される", async () => {
    mockFetchResponse([]);

    await todoApi.getAll();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });
});

describe("todoApi.getAll", () => {
  it("全TODOを取得する", async () => {
    mockFetchResponse([mockTodo]);

    const result = await todoApi.getAll();

    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/todos`, expect.any(Object));
    expect(result).toEqual([mockTodo]);
  });
});

describe("todoApi.getById", () => {
  it("IDを指定してTODOを取得する", async () => {
    mockFetchResponse(mockTodo);

    const result = await todoApi.getById(1);

    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/todos/1`, expect.any(Object));
    expect(result).toEqual(mockTodo);
  });
});

describe("todoApi.create", () => {
  it("新しいTODOを作成する", async () => {
    mockFetchResponse(mockTodo);

    const result = await todoApi.create({ title: "テストタスク", description: "テストの説明" });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/todos`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "テストタスク", description: "テストの説明" }),
      })
    );
    expect(result).toEqual(mockTodo);
  });
});

describe("todoApi.update", () => {
  it("TODOを更新する", async () => {
    const updatedTodo = { ...mockTodo, title: "更新タスク" };
    mockFetchResponse(updatedTodo);

    const result = await todoApi.update(1, { title: "更新タスク" });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/todos/1`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ title: "更新タスク" }),
      })
    );
    expect(result).toEqual(updatedTodo);
  });
});

describe("todoApi.delete", () => {
  it("TODOを削除する", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await todoApi.delete(1);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/todos/1`,
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });
});
