---
applyTo: "frontend/**"
---

# Frontend 指示

## ① 技術スタック

| カテゴリ       | 技術                    | バージョン                    |
| -------------- | ----------------------- | ----------------------------- |
| フレームワーク | Next.js (App Router)    | 16.x                          |
| UI ライブラリ  | React                   | 19.x                          |
| 言語           | TypeScript              | 5.x (strict モード)           |
| CSS            | Tailwind CSS v4         | `@tailwindcss/postcss`        |
| Linter         | ESLint v9 (flat config) | `eslint-config-next`          |
| Formatter      | Prettier                | 3.x                           |
| 最適化         | React Compiler          | `babel-plugin-react-compiler` |

## ② ディレクトリ構成

```
frontend/src/
├── app/           # App Router ページ・レイアウト
├── components/    # UI コンポーネント (PascalCase)
├── lib/           # API クライアント等のユーティリティ
└── types/         # TypeScript 型定義
```

- パスエイリアス: `@/*` → `./src/*`
- コンポーネントファイル: PascalCase (`TodoForm.tsx`)
- ユーティリティ / 型定義ファイル: camelCase (`api.ts`, `todo.ts`)

## ③ アーキテクチャ・設計指針

- **Server Component をデフォルトとし**、状態管理やイベントハンドラが必要な場合のみ `"use client"` を付与する
- **状態管理は React hooks (`useState`, `useCallback`, `useEffect`) で完結させる**。外部状態管理ライブラリは使わない
- **API クライアントは `lib/api.ts` に集約する**。fetch ラッパー (`fetchApi<T>`) でジェネリクス型安全を確保し、各リソースごとにオブジェクト (`todoApi` 等) としてエクスポートする
- **型定義は `types/` に分離する**。API レスポンス型・リクエスト型を明示的にインターフェースで定義する
- **UI スタイルは Tailwind CSS ユーティリティクラスのみで構築する**。カスタム CSS は `globals.css` の最小限にとどめる
- **エラーハンドリング**: API 呼び出しは try-catch でラップし、エラー状態を UI に表示する
- **ロケール**: `lang="ja"` を基本とし、日付は `toLocaleDateString("ja-JP")` でフォーマットする

## ④ テスト方針

- **テストフレームワーク**: Jest + React Testing Library を使用する
- **単体テスト**: 各コンポーネントに対して props のバリエーションとユーザーインタラクションをテストする
- **結合テスト**: API クライアント (`lib/api.ts`) は MSW (Mock Service Worker) でモックし、コンポーネントの API 連携を検証する
- **テストファイル配置**: テスト対象と同階層に `__tests__/` ディレクトリを作成するか、`*.test.tsx` で配置する
- **カバレッジ目標**: ビジネスロジックを含むコンポーネント 80% 以上
