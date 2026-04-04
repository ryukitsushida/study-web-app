"""カスタム例外。AppException を親に、ステータスコード別の例外を定義する。"""


class AppException(Exception):
    """アプリケーション共通の基底例外。status_code と detail を持つ。"""

    def __init__(self, detail: str = "", status_code: int = 500) -> None:
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


# --- 4xx ---


class TodoNotFound(AppException):
    """TODO が存在しない（404）"""

    def __init__(self, detail: str = "TODO not found") -> None:
        super().__init__(detail=detail, status_code=404)


# --- 5xx ---


class InternalServerError(AppException):
    """サーバー内部エラー（500）"""

    def __init__(self, detail: str = "Internal server error") -> None:
        super().__init__(detail=detail, status_code=500)
