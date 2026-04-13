from datetime import datetime, date

from sqlalchemy import Integer, Float, String, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class AiPrediction(Base):
    __tablename__ = "ai_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # LSTM prediction
    predicted_usi: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)       # 0-1
    prediction_date: Mapped[date] = mapped_column(Date, nullable=False)  # target date
    model_version: Mapped[str] = mapped_column(String(20), default="v1.0")

    # K-Means cluster result
    cluster_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # NLP sentiment summary
    sentiment_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    positive_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    neutral_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    negative_pct: Mapped[float | None] = mapped_column(Float, nullable=True)

    # AI recommendations
    recommendations: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    employee: Mapped["Employee"] = relationship("Employee", back_populates="ai_predictions")
