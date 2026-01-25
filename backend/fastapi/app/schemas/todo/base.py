from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class BaseTodoRequest(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=255)]
    description: Annotated[str | None, Field(max_length=1024)] = None


class BaseTodoResponse(BaseModel):
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
