---
applyTo: "backend/**"
---

# Backend 指示

## ① 技術スタック

| カテゴリ           | 技術                    | バージョン |
| ------------------ | ----------------------- | ---------- |
| 言語               | Python                  | ≥ 3.13     |
| フレームワーク     | FastAPI                 | 0.115.x    |
| ASGI サーバー      | Uvicorn                 | 0.30.x     |
| ORM                | SQLAlchemy (async)      | 2.0.x      |
| DB ドライバ        | asyncpg (PostgreSQL)    | 0.30.x     |
| マイグレーション   | Alembic                 | 1.13.x     |
| バリデーション     | Pydantic v2             | 2.9.x      |
| 設定管理           | pydantic-settings       | 2.5.x      |
| Linter / Formatter | Ruff                    | -          |
| テスト             | pytest + pytest-asyncio | -          |

## ② ディレクトリ構成

```
backend/fastapi/app/
├── main.py          # アプリ初期化、CORS、例外ハンドラ
├── database.py      # AsyncEngine / AsyncSession / Base
├── core/
│   └── config.py    # BaseSettings による環境変数管理
├── models/
│   └── models.py    # SQLAlchemy ORM モデル (Mapped 型)
├── schemas/
│   └── <resource>/
│       ├── base.py      # 共通スキーマ
│       ├── request.py   # リクエストスキーマ
│       └── response.py  # レスポンススキーマ
├── crud/
│   └── <resource>.py    # DB 操作 (CRUD クラス)
├── services/
│   └── <resource>.py    # ビジネスロジック (Service クラス)
├── routers/
│   └── <resource>.py    # APIRouter エンドポイント
└── exceptions/
    └── __init__.py      # カスタム例外
```

- ファイル名: snake_case
- クラス名: PascalCase (`TodoModel`, `TodoService`, `TodoCRUD`)
- Alembic マイグレーション: `alembic/versions/` に連番プレフィックス (`001_`, `002_`)

## ③ アーキテクチャ・設計指針

- **レイヤードアーキテクチャ**: Router → Service → CRUD の 3 層構造を遵守する
  - **Router 層**: リクエスト受付・レスポンス返却のみ。ビジネスロジックを書かない
  - **Service 層**: ビジネスロジックを集約。CRUD を呼び出し、スキーマ ↔ モデル変換を行う
  - **CRUD 層**: SQLAlchemy によるデータベース操作のみを担当する
- **依存性注入**: DB セッションは `Depends(get_db)` で注入する。Service / CRUD はコンストラクタで `AsyncSession` を受け取る
- **スキーマ設計**: base → request / response の継承構造。`from_attributes=True` で ORM モデルからの自動変換を有効にする
- **ORM モデル**: SQLAlchemy 2.0 の `Mapped` / `mapped_column` を使用する。`created_at` / `updated_at` は UTC naive datetime で管理する
- **非同期ファースト**: すべての DB 操作は async/await。`flush()` + `refresh()` パターンで作成・更新後の最新データを取得する
- **例外処理**: カスタム例外を定義し、`main.py` のグローバルハンドラで HTTP レスポンスに変換する
- **設定管理**: `pydantic-settings` の `BaseSettings` で環境変数を型付きで管理する。`.env` ファイルから読み込む

## ④ テスト方針

- **テストフレームワーク**: pytest + pytest-asyncio + httpx (`AsyncClient`)
- **単体テスト**: Service / CRUD 層のロジックを個別にテストする。DB はテスト用の PostgreSQL またはインメモリ SQLite を使用する
- **API テスト**: `httpx.AsyncClient` で FastAPI の TestClient 経由でエンドポイントを検証する
- **テストファイル配置**: `tests/` ディレクトリに `test_<module>.py` で配置する
- **フィクスチャ**: DB セッション・テストクライアントは `conftest.py` で共通定義する
- **カバレッジ目標**: Service 層 80% 以上、Router 層は主要パス (正常系 + 主要エラー系) をカバーする
