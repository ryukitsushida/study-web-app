import TodoForm from "@/components/TodoForm";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("TodoForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("入力フィールドが表示される", () => {
    render(<TodoForm onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText("新しいタスクを追加...")).toBeInTheDocument();
  });

  it("フォーカス時に説明欄とボタンが表示される", async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByPlaceholderText("新しいタスクを追加..."));

    expect(screen.getByPlaceholderText("説明を追加（任意）")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });

  it("タイトルが空の場合、追加ボタンが無効になる", async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByPlaceholderText("新しいタスクを追加..."));

    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("タイトル入力後に追加ボタンが有効になる", async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("新しいタスクを追加...");
    await user.click(input);
    await user.type(input, "新しいタスク");

    expect(screen.getByRole("button", { name: "追加" })).toBeEnabled();
  });

  it("フォーム送信時にonSubmitが呼ばれ、フォームがリセットされる", async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("新しいタスクを追加...");
    await user.click(input);
    await user.type(input, "新しいタスク");
    await user.type(screen.getByPlaceholderText("説明を追加（任意）"), "タスクの説明");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(mockOnSubmit).toHaveBeenCalledWith("新しいタスク", "タスクの説明");
    expect(input).toHaveValue("");
  });

  it("空白のみのタイトルでは送信されない", async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("新しいタスクを追加...");
    await user.click(input);
    await user.type(input, "   ");

    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("キャンセルボタンでフォームがリセットされる", async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText("新しいタスクを追加...");
    await user.click(input);
    await user.type(input, "新しいタスク");
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(input).toHaveValue("");
    expect(screen.queryByPlaceholderText("説明を追加（任意）")).not.toBeInTheDocument();
  });
});
