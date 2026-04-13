import enum
from datetime import datetime, date

from sqlalchemy import String, Float, Integer, Date, DateTime, Enum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class StatusEnum(str, enum.Enum):
    yuqori = "yuqori"          # Yuqori (yashil)
    orta = "orta"              # O'rta (sariq)
    rivojlanish = "rivojlanish"  # Rivojlanish kerak (qizil)


class DepartmentEnum(str, enum.Enum):
    it = "IT"
    hr = "HR"
    sotuv = "Sotuv"
    marketing = "Marketing"
    moliya = "Moliya"
    boshqaruv = "Boshqaruv"


class ClusterEnum(str, enum.Enum):
    yulduz = "yulduz"        # Yulduzlar (yuqori samarali)
    barqaror = "barqaror"    # Barqaror (o'rta)
    rivojlanish = "rivojlanish"  # Rivojlanishga muhtoj


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    position: Mapped[str] = mapped_column(String(150), nullable=False)
    department: Mapped[DepartmentEnum] = mapped_column(Enum(DepartmentEnum), nullable=False)
    status: Mapped[StatusEnum] = mapped_column(Enum(StatusEnum), default=StatusEnum.orta)
    usi_score: Mapped[float] = mapped_column(Float, default=0.0)
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hired_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    avatar_initials: Mapped[str] = mapped_column(String(3), nullable=False, default="?")
    cluster: Mapped[ClusterEnum | None] = mapped_column(Enum(ClusterEnum), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User", back_populates="employee", foreign_keys="User.employee_id", uselist=False
    )
    kpi_records: Mapped[list["KpiRecord"]] = relationship("KpiRecord", back_populates="employee", cascade="all, delete-orphan")
    evaluations: Mapped[list["Evaluation"]] = relationship("Evaluation", back_populates="employee", cascade="all, delete-orphan")
    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="employee", cascade="all, delete-orphan")
    ai_predictions: Mapped[list["AiPrediction"]] = relationship("AiPrediction", back_populates="employee", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
