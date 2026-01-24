# ECSデプロイ用 Dockerfile
FROM python:3.12-slim

# 環境変数設定
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# システム依存パッケージのインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 依存パッケージのインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードのコピー
COPY . .

# 起動スクリプトに実行権限を付与
RUN chmod +x entrypoint.sh

# 非rootユーザーの作成と切り替え
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

# ヘルスチェック（マイグレーション完了後にアプリが起動するため start-period を長めに）
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# ポート公開
EXPOSE 8000

# マイグレーション実行後にアプリケーション起動
CMD ["./entrypoint.sh"]
