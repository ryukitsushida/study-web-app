from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class BaseTodoRequest(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=255)]
    description: Annotated[str | None, Field(max_length=1024)] = None


class BaseTodoResponse(BaseModel):
    id: Annotated[int, Field(gt=0)]
    title: Annotated[str, Field(min_length=1, max_length=255)]
    description: Annotated[str | None, Field(max_length=1024)] = None
    completed: Annotated[bool, Field(default=False)]
    created_at: Annotated[datetime, Field()]
    updated_at: Annotated[datetime, Field()]

    model_config = ConfigDict(from_attributes=True)
