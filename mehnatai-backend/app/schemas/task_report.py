from datetime import datetime
from pydantic import BaseModel, field_validator
import os


class TaskReportOut(BaseModel):
    id: int
    task_id: int
    uploaded_by_id: int | None
    original_name: str
    file_path: str
    mime_type: str | None
    file_size: int | None
    comment: str | None
    uploaded_at: datetime

    model_config = {"from_attributes": True}
