"use client";

import { useState } from "react";

interface TodoFormProps {
  onSubmit: (title: string, description: string) => void;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), description.trim());
      setTitle("");
      setDescription("");
      setIsExpanded(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
    >
      <div className="flex gap-3">
        <div className="w-5 h-5 mt-2 rounded-full border-2 border-dashed border-gray-300 flex-shrink-0" />
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="新しいタスクを追加..."
            className="w-full px-0 py-1 text-gray-800 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
          />
          {isExpanded && (
            <>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="説明を追加（任意）"
                className="w-full px-0 py-1 text-sm text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0 resize-none mt-1"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setTitle("");
                    setDescription("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  追加
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
