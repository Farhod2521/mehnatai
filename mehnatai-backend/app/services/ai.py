"""
AI Prediction Service.

Production plan (from MehnatAI TZ):
  - LSTM model: 2 layers (64 + 32 units), dropout=0.2, Adam optimizer
  - Input: 7 features × 12 time steps
  - Output: predicted USI for next 3-6 months
  - K-Means (k=3): Yulduz / Barqaror / Rivojlanish clusters

Hozirgi holat:
  - USI + KPI trend asosida stub bashorat
  - GPT-4o-mini orqali shaxsiylashtirilgan AI tavsiyalar (real)
"""

from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.ai_prediction import AiPrediction
from app.models.employee import Employee, ClusterEnum
from app.models.kpi import KpiRecord
from app.services.usi import calculate_usi
from app.services.kmeans import assign_cluster_by_usi
from app.services.gpt import generate_gpt_recommendations


async def generate_prediction(employee_id: int, db: AsyncSession) -> AiPrediction:
    # 1. Xodim ma'lumotlarini olib
    emp_r = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = emp_r.scalar_one_or_none()

    # 2. USI hisoblash
    usi_result = await calculate_usi(employee_id, db)
    current_usi = usi_result.usi_score

    # 3. KPI trend (so'nggi 3 ta yozuv)
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

    # 4. Stub LSTM bashorat: USI + trend hissasi
    predicted = min(100.0, max(0.0, round(current_usi + trend_delta * 0.3, 2)))

    # 5. Ishonchlilik: qancha ko'p ma'lumot — shuncha yuqori
    confidence = min(0.92, 0.60 + len(records) * 0.05)

    # 6. K-Means klasteri
    cluster = assign_cluster_by_usi(current_usi)

    # 7. GPT-4o-mini tavsiyalar
    recommendations = await generate_gpt_recommendations(
        name=emp.full_name if emp else "Xodim",
        position=emp.position if emp else "",
        department=emp.department.value if emp else "",
        cluster=cluster.value,
        usi_score=current_usi,
        usi_label=usi_result.label,
        kpi_avg=usi_result.kpi_avg,
        rahbar_score=usi_result.rahbar_score,
        peer_360_score=usi_result.peer_360_score,
        predicted_usi=predicted,
        experience_years=emp.experience_years if emp else 0,
    )

    return AiPrediction(
        employee_id=employee_id,
        predicted_usi=predicted,
        confidence=round(confidence, 2),
        prediction_date=date.today() + timedelta(days=90),
        model_version="v1.0-gpt4o",
        cluster_label=cluster.value,
        sentiment_summary=_sentiment_summary(),
        positive_pct=65.0,
        neutral_pct=25.0,
        negative_pct=10.0,
        recommendations=recommendations,
    )


def _sentiment_summary() -> str:
    return "Oxirgi feedbacklar asosan ijobiy. Jamoaviy ishtirok yuqori baholangan."
