from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.exceptions import AppException, InternalServerError, TodoNotFound
from app.routers import todos

app = FastAPI(
    title="TODO API",
    description="シンプルなTODO管理API",
    version="1.0.0",
)


@app.exception_handler(Exception)
async def app_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Exception を拾い、isinstance で分岐して JSONResponse を返す。"""
    if isinstance(exc, TodoNotFound):
        return JSONResponse(status_code=404, content={"detail": exc.detail})
    if isinstance(exc, InternalServerError):
        return JSONResponse(status_code=500, content={"detail": exc.detail})
    if isinstance(exc, AppException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


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
