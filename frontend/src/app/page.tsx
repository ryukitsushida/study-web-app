import TodoList from "@/components/TodoList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            TODO App
          </h1>
          <p className="text-gray-500 mt-2">シンプルで使いやすいタスク管理</p>
        </header>
        <TodoList />
      </div>
    </main>
  );
}
