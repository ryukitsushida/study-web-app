from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import todos

app = FastAPI(
    title="TODO API",
    description="シンプルなTODO管理API",
    version="1.0.0",
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(todos.router, prefix="/api")


@app.get("/health")
def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "healthy"}
