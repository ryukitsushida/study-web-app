import TodoList from "@/components/TodoList";
import { todoApi } from "@/lib/api";
import { Todo } from "@/types/todo";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/api");

const mockTodoApi = todoApi as jest.Mocked<typeof todoApi>;

const mockTodos: Todo[] = [
  {
    id: 1,
    title: "タスク1",
    description: "説明1",
    completed: false,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "タスク2",
    description: null,
    completed: true,
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  },
];

describe("TodoList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ローディング状態が表示される", () => {
    mockTodoApi.getAll.mockReturnValue(new Promise(() => {}));
    render(<TodoList />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("TODO一覧が表示される", async () => {
    mockTodoApi.getAll.mockResolvedValue(mockTodos);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("タスク1")).toBeInTheDocument();
    });
    expect(screen.getByText("タスク2")).toBeInTheDocument();
  });

  it("API取得エラー時にエラーメッセージが表示される", async () => {
    mockTodoApi.getAll.mockRejectedValue(new Error("Network error"));
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("TODOの取得に失敗しました")).toBeInTheDocument();
    });
  });

  it("TODOが空の場合、空状態メッセージが表示される", async () => {
    mockTodoApi.getAll.mockResolvedValue([]);
    render(<TodoList />);

    await waitFor(() => {
      expect(
        screen.getByText("タスクがありません。新しいタスクを追加してください。"),
      ).toBeInTheDocument();
    });
  });

  it("未完了・完了のカウントが表示される", async () => {
    mockTodoApi.getAll.mockResolvedValue(mockTodos);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText(/1 件の未完了/)).toBeInTheDocument();
      expect(screen.getByText(/1 件の完了/)).toBeInTheDocument();
    });
  });

  it("フィルターで未完了のみ表示できる", async () => {
    const user = userEvent.setup();
    mockTodoApi.getAll.mockResolvedValue(mockTodos);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("タスク1")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "未完了" }));

    expect(screen.getByText("タスク1")).toBeInTheDocument();
    expect(screen.queryByText("タスク2")).not.toBeInTheDocument();
  });

  it("フィルターで完了済みのみ表示できる", async () => {
    const user = userEvent.setup();
    mockTodoApi.getAll.mockResolvedValue(mockTodos);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("タスク1")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "完了済み" }));

    expect(screen.queryByText("タスク1")).not.toBeInTheDocument();
    expect(screen.getByText("タスク2")).toBeInTheDocument();
  });

  it("新しいTODOを作成できる", async () => {
    const user = userEvent.setup();
    const newTodo: Todo = {
      id: 3,
      title: "新しいタスク",
      description: "",
      completed: false,
      created_at: "2025-01-03T00:00:00Z",
      updated_at: "2025-01-03T00:00:00Z",
    };
    mockTodoApi.getAll.mockResolvedValue(mockTodos);
    mockTodoApi.create.mockResolvedValue(newTodo);
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("タスク1")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("新しいタスクを追加...");
    await user.click(input);
    await user.type(input, "新しいタスク");
    await user.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => {
      expect(mockTodoApi.create).toHaveBeenCalledWith({
        title: "新しいタスク",
        description: undefined,
      });
    });
  });

  it("TODO作成エラー時にエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    mockTodoApi.getAll.mockResolvedValue(mockTodos);
    mockTodoApi.create.mockRejectedValue(new Error("Create error"));
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("タスク1")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("新しいタスクを追加...");
    await user.click(input);
    await user.type(input, "新しいタスク");
    await user.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => {
      expect(screen.getByText("TODOの作成に失敗しました")).toBeInTheDocument();
    });
  });

  it("エラーメッセージの×ボタンでエラーを閉じられる", async () => {
    const user = userEvent.setup();
    mockTodoApi.getAll.mockRejectedValue(new Error("Network error"));
    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("TODOの取得に失敗しました")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "×" }));

    expect(screen.queryByText("TODOの取得に失敗しました")).not.toBeInTheDocument();
  });
});
