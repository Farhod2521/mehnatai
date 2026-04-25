import enum
from datetime import datetime, date

from sqlalchemy import Integer, String, Text, DateTime, Date, ForeignKey, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class PriorityEnum(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"


class TaskStatusEnum(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    hr_check = "hr_check"   # employee marked done, waiting for HR approval
    done = "done"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True
    )
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[PriorityEnum] = mapped_column(Enum(PriorityEnum), default=PriorityEnum.medium)
    status: Mapped[TaskStatusEnum] = mapped_column(Enum(TaskStatusEnum), default=TaskStatusEnum.pending)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_done: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    employee: Mapped["Employee"] = relationship("Employee", back_populates="tasks")
    parent: Mapped["Task | None"] = relationship("Task", remote_side=[id], back_populates="children")
    children: Mapped[list["Task"]] = relationship("Task", back_populates="parent", cascade="all, delete-orphan")
    reports: Mapped[list["TaskReport"]] = relationship("TaskReport", back_populates="task", cascade="all, delete-orphan")  # type: ignore[name-defined]
