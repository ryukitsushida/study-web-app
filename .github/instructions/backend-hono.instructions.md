---
applyTo: "backend/hono/**"
---

# Backend (Hono) 指示

## ① 技術スタック

| カテゴリ       | 技術                          | バージョン |
| -------------- | ----------------------------- | ---------- |
| フレームワーク | Hono                          | 4.x        |
| ランタイム     | Node.js + tsx                 | 20.x       |
| 言語           | TypeScript                    | 5.x        |
| ORM            | Prisma 7 + @prisma/adapter-pg | 7.x        |
| バリデーション | Zod + @hono/zod-validator     | 3.x        |
| テスト         | Vitest + Testcontainers       | -          |

## ② ディレクトリ構成

```
backend/hono/
├── src/
│   ├── app.ts                # Hono app ファクトリ（CORS、ルート登録、エラーハンドラ）
│   ├── index.ts              # サーバー起動（@hono/node-server）
│   ├── db.ts                 # PrismaClient + adapter-pg
│   ├── env.ts                # 環境変数ヘルパー
│   ├── errors.ts             # カスタムエラークラス
│   ├── routes/
│   │   └── todos.ts          # TODO ルート定義 + ハンドラ
│   ├── middleware/
│   │   └── error-handler.ts  # グローバルエラーハンドラ
│   ├── schemas/
│   │   └── todo.ts           # Zod スキーマ
│   └── generated/prisma/     # Prisma Client 生成先（.gitignore）
├── tests/
│   ├── setup.ts              # Testcontainers + テーブル作成
│   └── routes/
│       └── todos.test.ts     # 統合テスト（createApp + 実 DB）
├── prisma/
│   └── schema.prisma
├── prisma.config.ts           # Prisma v7 設定
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

## ③ アーキテクチャ・設計指針

### Hono らしい設計

- **`createApp()` ファクトリパターン**: app 作成とサーバー起動を分離。テスト時にモック PrismaClient を注入可能
- **ミドルウェアで DI**: PrismaClient を `c.set("db", db)` で Context に注入し、ルートハンドラが `c.get("db")` で取得
- **ルートハンドラが直接 DB 操作**: FastAPI のような Repository/Service 層は設けず、ルートハンドラ内で Prisma を直接呼び出す（Hono のシンプルさを活かす）
- **型安全な Context**: `Hono<{ Variables: { db: PrismaClient } }>` で型を定義

### DB マイグレーション

- **Alembic（FastAPI 側）がスキーマ管理の単一ソース**
- Prisma は `prisma generate`（Client 生成）のみ使用し、`prisma migrate` は使わない
- テーブル追加時のフロー: Alembic でマイグレーション → `prisma db pull` → `prisma generate`

### バリデーション

- リクエストバリデーションは **Zod + @hono/zod-validator** ミドルウェアで行う
- Zod スキーマは `schemas/` に集約する
- title: 1〜255 文字、description: 最大 1024 文字（FastAPI 側と同一制約）

### エラーハンドリング

- `AppError` 基底クラス + `NotFoundError` 派生クラスを定義
- `app.onError` でキャッチし `{ detail: string }` 形式の JSON を返す
- エラーハンドラは `middleware/error-handler.ts` に分離

### レスポンス形式

- FastAPI と同一の JSON フィールド名・型を使用する（フロントエンド互換性のため）
- DateTime は ISO 8601（`toISOString()`）で返す

## ④ コーディング規約

- **async/await** で統一する（Prisma Client は非同期）
- 変数名・関数名: **camelCase**
- ファイル名: **kebab-case** または **camelCase**（`todo.ts`、`error-handler.ts`）
- 環境変数は `env.ts` で一元管理し、直接 `process.env` を参照しない（ただし `app.ts` 内の CORS 設定は例外）
- Prisma Client のインポートは `./generated/prisma/client.js` から行う（v7 の仕様）

## ⑤ テスト方針

- **テストフレームワーク**: Vitest + Testcontainers PostgreSQL
- **統合テスト中心**: `createApp(testPrisma)` で実 DB と接続した Hono app を生成し、`app.request()` でエンドポイントをテスト
- テスト内で直接 Prisma を操作してデータのセットアップ・検証を行う
- テストファイルは `tests/routes/` に配置
