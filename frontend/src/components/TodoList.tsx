"use client";

import { todoApi } from "@/lib/api";
import { Todo } from "@/types/todo";
import { useCallback, useEffect, useState } from "react";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const fetchTodos = useCallback(async () => {
    try {
      setError(null);
      const data = await todoApi.getAll();
      setTodos(data);
    } catch {
      setError("TODOの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (title: string, description: string) => {
    try {
      const newTodo = await todoApi.create({
        title,
        description: description || undefined,
      });
      setTodos((prev) => [newTodo, ...prev]);
    } catch {
      setError("TODOの作成に失敗しました");
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      const updated = await todoApi.update(id, { completed });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError("TODOの更新に失敗しました");
    }
  };

  const handleUpdate = async (id: number, title: string, description: string) => {
    try {
      const updated = await todoApi.update(id, {
        title,
        description: description || undefined,
      });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError("TODOの更新に失敗しました");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await todoApi.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("TODOの削除に失敗しました");
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">
            ×
          </button>
        </div>
      )}

      <TodoForm onSubmit={handleCreate} />

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                filter === f
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {activeCount} 件の未完了 / {completedCount} 件の完了
        </div>
      </div>

      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {filter === "all"
              ? "タスクがありません。新しいタスクを追加してください。"
              : filter === "active"
                ? "未完了のタスクはありません。"
                : "完了済みのタスクはありません。"}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
