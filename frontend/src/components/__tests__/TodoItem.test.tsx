import TodoItem from "@/components/TodoItem";
import { Todo } from "@/types/todo";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const baseTodo: Todo = {
  id: 1,
  title: "テストタスク",
  description: "テストの説明",
  completed: false,
  created_at: "2025-01-15T10:30:00Z",
  updated_at: "2025-01-15T10:30:00Z",
};

describe("TodoItem", () => {
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTodoItem = (todo: Todo = baseTodo) =>
    render(
      <TodoItem
        todo={todo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

  it("タイトルと説明が表示される", () => {
    renderTodoItem();

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.getByText("テストの説明")).toBeInTheDocument();
  });

  it("作成日が日本語フォーマットで表示される", () => {
    renderTodoItem();

    expect(screen.getByText(/2025年/)).toBeInTheDocument();
  });

  it("説明がnullの場合、説明欄が表示されない", () => {
    renderTodoItem({ ...baseTodo, description: null });

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.queryByText("テストの説明")).not.toBeInTheDocument();
  });

  it("完了トグルボタンをクリックするとonToggleが呼ばれる", async () => {
    const user = userEvent.setup();
    renderTodoItem();

    const buttons = screen.getAllByRole("button");
    // 最初のボタンがトグルボタン
    await user.click(buttons[0]);

    expect(mockOnToggle).toHaveBeenCalledWith(1, true);
  });

  it("完了済みTODOのトグルでonToggle(id, false)が呼ばれる", async () => {
    const user = userEvent.setup();
    renderTodoItem({ ...baseTodo, completed: true });

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(mockOnToggle).toHaveBeenCalledWith(1, false);
  });

  it("削除ボタンをクリックするとonDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    renderTodoItem();

    await user.click(screen.getByTitle("削除"));

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it("編集ボタンをクリックすると編集モードに切り替わる", async () => {
    const user = userEvent.setup();
    renderTodoItem();

    await user.click(screen.getByTitle("編集"));

    expect(screen.getByDisplayValue("テストタスク")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストの説明")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("編集モードで保存するとonUpdateが呼ばれる", async () => {
    const user = userEvent.setup();
    renderTodoItem();

    await user.click(screen.getByTitle("編集"));

    const titleInput = screen.getByDisplayValue("テストタスク");
    await user.clear(titleInput);
    await user.type(titleInput, "更新タスク");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(mockOnUpdate).toHaveBeenCalledWith(1, "更新タスク", "テストの説明");
  });

  it("編集モードでキャンセルすると元の表示に戻る", async () => {
    const user = userEvent.setup();
    renderTodoItem();

    await user.click(screen.getByTitle("編集"));

    const titleInput = screen.getByDisplayValue("テストタスク");
    await user.clear(titleInput);
    await user.type(titleInput, "変更タスク");
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument();
  });

  it("編集モードでタイトルが空の場合、保存しても onUpdate が呼ばれない", async () => {
    const user = userEvent.setup();
    renderTodoItem();

    await user.click(screen.getByTitle("編集"));

    const titleInput = screen.getByDisplayValue("テストタスク");
    await user.clear(titleInput);
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });
});
