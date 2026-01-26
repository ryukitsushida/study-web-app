from typing import Annotated

from pydantic import Field

from .base import BaseTodoRequest


class CreateTodoRequest(BaseTodoRequest):
    pass


class UpdateTodoRequest(BaseTodoRequest):
    title: Annotated[str | None, Field(min_length=1, max_length=255)] = None
    completed: Annotated[bool | None, Field(default=None)] = None
