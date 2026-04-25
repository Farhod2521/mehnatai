"""
AI Prediction Service.

Production plan (from MehnatAI TZ):
  - LSTM model: 2 layers (64 + 32 units), dropout=0.2, Adam optimizer
  - Input: 7 features × 12 time steps
  - Output: predicted USI for next 3-6 months
  - K-Means (k=3): Yulduz / Barqaror / Rivojlanish clusters
  - Weekly retrain via Celery

This module provides a stub that uses rule-based logic until the
actual trained LSTM model is available.
"""

from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.ai_prediction import AiPrediction
from app.models.kpi import KpiRecord
from app.models.evaluation import Evaluation, EvalTypeEnum
from app.models.employee import ClusterEnum
from app.services.usi import calculate_usi
from app.services.kmeans import assign_cluster_by_usi


async def generate_prediction(employee_id: int, db: AsyncSession) -> AiPrediction:
    """
    Stub prediction: uses current USI + simple trend.
    Replace `_lstm_predict` with real model inference.
    """
    usi_result = await calculate_usi(employee_id, db)
    current_usi = usi_result.usi_score

    # Simple trend: look at last 3 KPI records
    kpi_r = await db.execute(
        select(KpiRecord)
        .where(KpiRecord.employee_id == employee_id)
        .order_by(desc(KpiRecord.year), desc(KpiRecord.month))
        .limit(3)
    )
    records = kpi_r.scalars().all()
    trend_delta = 0.0
    if len(records) >= 2:
        trend_delta = records[0].kpi_avg - records[-1].kpi_avg

    # Stub LSTM output: current + partial trend contribution
    predicted = min(100.0, max(0.0, round(current_usi + trend_delta * 0.3, 2)))

    # Confidence: higher when more data available
    confidence = min(0.92, 0.60 + len(records) * 0.05)

    # Cluster assignment (K-Means stub)
    cluster = _assign_cluster(current_usi)

    # AI recommendations based on cluster
    recommendations = _generate_recommendations(cluster, usi_result)

    return AiPrediction(
        employee_id=employee_id,
        predicted_usi=predicted,
        confidence=round(confidence, 2),
        prediction_date=date.today() + timedelta(days=90),
        model_version="v1.0-stub",
        cluster_label=cluster.value,
        sentiment_summary=_sentiment_summary(employee_id),
        positive_pct=65.0,
        neutral_pct=25.0,
        negative_pct=10.0,
        recommendations=recommendations,
    )


def _assign_cluster(usi: float) -> ClusterEnum:
    """Single-employee cluster assignment (batch K-Means via /ai/clusters/update)."""
    return assign_cluster_by_usi(usi)


def _generate_recommendations(cluster: ClusterEnum, usi_result) -> str:
    if cluster == ClusterEnum.yulduz:
        return (
            "Siz yuqori samarali xodimlar guruhidasiz. "
            "Tavsiya: mentorlik dasturida qatnashing, "
            "arxitektura qarorlarida faol ishtirok eting, "
            "texnik konferensiyalarda prezentatsiya qiling."
        )
    elif cluster == ClusterEnum.barqaror:
        weak = []
        if usi_result.kpi_avg < 75:
            weak.append("KPI ko'rsatkichlari (bug-fix tezligi yoki hujjatlashtirish)")
        if usi_result.peer_360_score < 70:
            weak.append("Jamoaviy muloqot ko'nikmalari")
        areas = ", ".join(weak) if weak else "texnik ko'nikmalar"
        return (
            f"Barqaror natijalar ko'rsatyapsiz. "
            f"Rivojlanish uchun e'tibor bering: {areas}. "
            "Onlayn kurslar va kod review jarayonida faolroq qatnashing."
        )
    return (
        "Rivojlanishga e'tibor kerak. Tavsiyalar: "
        "1) Haftalik 1:1 rahbar bilan uchrashuvlar. "
        "2) Junior vazifalardan boshlang va murakkabligini oshiring. "
        "3) Pair programming orqali tajriba o'rganing. "
        "4) Texnik yozuvlar va kod sifatiga e'tibor bering."
    )


def _sentiment_summary(employee_id: int) -> str:
    return "Oxirgi feedbacklar asosan ijobiy. Jamoaviy ishtirok yuqori baholangan."
