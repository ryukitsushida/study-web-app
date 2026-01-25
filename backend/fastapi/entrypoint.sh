#!/bin/sh
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
# 開発環境ではENABLE_RELOAD=trueを設定することでホットリロードを有効化
if [ "$ENABLE_RELOAD" = "true" ]; then
    echo "Hot reload enabled"
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir /app/app
else
    echo "Production mode"
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000
fi
