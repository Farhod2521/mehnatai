from datetime import datetime, date
from pydantic import BaseModel


class AiPredictionOut(BaseModel):
    id: int
    employee_id: int
    predicted_usi: float
    confidence: float
    prediction_date: date
    model_version: str
    cluster_label: str | None = None
    sentiment_summary: str | None = None
    positive_pct: float | None = None
    neutral_pct: float | None = None
    negative_pct: float | None = None
    recommendations: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UsiCalculationResult(BaseModel):
    employee_id: int
    kpi_avg: float
    rahbar_score: float
    peer_360_score: float
    mijoz_score: float
    usi_score: float
    label: str    # "A'lo", "Yaxshi", "Qoniqarli", "Rivojlanish kerak"
