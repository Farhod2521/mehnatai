import enum
from datetime import datetime

from sqlalchemy import Integer, Float, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class EvalTypeEnum(str, enum.Enum):
    rahbar = "rahbar"       # Manager evaluation
    peer_360 = "peer_360"   # 360-degree peer review
    mijoz = "mijoz"         # Client feedback


class SentimentEnum(str, enum.Enum):
    ijobiy = "ijobiy"       # Positive
    neytral = "neytral"     # Neutral
    salbiy = "salbiy"       # Negative


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True
    )
    evaluator_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    eval_type: Mapped[EvalTypeEnum] = mapped_column(Enum(EvalTypeEnum), nullable=False)

    # Scores (1–10)
    work_quality: Mapped[float | None] = mapped_column(Float, nullable=True)       # Ish sifati
    punctuality: Mapped[float | None] = mapped_column(Float, nullable=True)        # Vaqtida bajarish
    communication: Mapped[float | None] = mapped_column(Float, nullable=True)      # Muloqot
    initiative: Mapped[float | None] = mapped_column(Float, nullable=True)         # Tashabbuskorlik
    teamwork: Mapped[float | None] = mapped_column(Float, nullable=True)           # Jamoaviy ish

    # Overall score (1–10)
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)

    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    sentiment: Mapped[SentimentEnum | None] = mapped_column(Enum(SentimentEnum), nullable=True)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    employee: Mapped["Employee"] = relationship("Employee", back_populates="evaluations")
    evaluator: Mapped["User"] = relationship("User", foreign_keys=[evaluator_id])
