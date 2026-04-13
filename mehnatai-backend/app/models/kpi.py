from datetime import datetime

from sqlalchemy import Integer, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class KpiRecord(Base):
    """Monthly KPI record for an employee."""
    __tablename__ = "kpi_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True
    )
    month: Mapped[int] = mapped_column(Integer, nullable=False)   # 1-12
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    # KPI indicators (0–100 scale)
    code_quality: Mapped[float] = mapped_column(Float, default=0.0)          # Kod sifati
    deadline_adherence: Mapped[float] = mapped_column(Float, default=0.0)    # Muddatga rioya
    bug_fix_speed: Mapped[float] = mapped_column(Float, default=0.0)         # Bug-fix tezligi
    documentation: Mapped[float] = mapped_column(Float, default=0.0)         # Hujjatlashtirish
    team_participation: Mapped[float] = mapped_column(Float, default=0.0)    # Jamoaviy ishtirok
    new_technologies: Mapped[float] = mapped_column(Float, default=0.0)      # Yangi texnologiyalar

    # Computed KPI average (auto-calculated)
    kpi_avg: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("month BETWEEN 1 AND 12", name="ck_kpi_month"),
        CheckConstraint("year >= 2020", name="ck_kpi_year"),
    )

    employee: Mapped["Employee"] = relationship("Employee", back_populates="kpi_records")

    def compute_avg(self) -> float:
        values = [
            self.code_quality,
            self.deadline_adherence,
            self.bug_fix_speed,
            self.documentation,
            self.team_participation,
            self.new_technologies,
        ]
        return round(sum(values) / len(values), 2)
