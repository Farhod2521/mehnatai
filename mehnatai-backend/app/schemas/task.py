from datetime import datetime, date
from pydantic import BaseModel
from app.models.task import PriorityEnum, TaskStatusEnum


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    priority: PriorityEnum = PriorityEnum.medium
    status: TaskStatusEnum = TaskStatusEnum.pending
    due_date: date | None = None
    parent_id: int | None = None


class TaskCreate(TaskBase):
    employee_id: int


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: PriorityEnum | None = None
    status: TaskStatusEnum | None = None
    due_date: date | None = None
    is_done: bool | None = None


class TaskOut(TaskBase):
    id: int
    employee_id: int
    is_done: bool
    created_at: datetime
    updated_at: datetime
    children: list["TaskOut"] = []

    model_config = {"from_attributes": True}


TaskOut.model_rebuild()


class TaskStats(BaseModel):
    employee_id: int
    total: int
    done: int
    pending: int
    in_progress: int
    completion_rate: float
