from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import todos

app = FastAPI(
    title="TODO API",
    description="シンプルなTODO管理API",
    version="1.0.0",
)

# CORS設定（環境変数 ALLOWED_ORIGINS で制御）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(todos.router, prefix="/api")


@app.get("/health")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "healthy"}
