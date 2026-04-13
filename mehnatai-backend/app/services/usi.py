"""
USI (Umumiy Samaradorlik Indeksi) calculation service.

Formula (from MehnatAI TZ):
  USI = (KPI_avto × 0.25) + (Rahbar_baho × 0.30) + (360_feedback × 0.25) + (Mijoz_feedback × 0.20)

Score labels:
  90-100 → A'lo
  75-89  → Yaxshi
  60-74  → Qoniqarli
  <60    → Rivojlanish kerak
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.models.kpi import KpiRecord
from app.models.evaluation import Evaluation, EvalTypeEnum
from app.models.employee import Employee, StatusEnum
from app.schemas.ai_prediction import UsiCalculationResult


def _usi_label(score: float) -> str:
    if score >= 90:
        return "A'lo"
    elif score >= 75:
        return "Yaxshi"
    elif score >= 60:
        return "Qoniqarli"
    return "Rivojlanish kerak"


def _status_from_usi(score: float) -> StatusEnum:
    if score >= 75:
        return StatusEnum.yuqori
    elif score >= 55:
        return StatusEnum.orta
    return StatusEnum.rivojlanish


async def calculate_usi(employee_id: int, db: AsyncSession) -> UsiCalculationResult:
    # 1. KPI average (last month, scaled 0-100)
    kpi_r = await db.execute(
        select(KpiRecord)
        .where(KpiRecord.employee_id == employee_id)
        .order_by(desc(KpiRecord.year), desc(KpiRecord.month))
        .limit(1)
    )
    kpi_record = kpi_r.scalar_one_or_none()
    kpi_avg = kpi_record.kpi_avg if kpi_record else 0.0

    # 2. Rahbar evaluation average (scale 1-10 → 0-100)
    rahbar_r = await db.execute(
        select(func.avg(Evaluation.overall_score))
        .where(Evaluation.employee_id == employee_id)
        .where(Evaluation.eval_type == EvalTypeEnum.rahbar)
    )
    rahbar_raw = rahbar_r.scalar_one_or_none() or 0.0
    rahbar_score = round(rahbar_raw * 10, 2)   # convert 1-10 → 0-100

    # 3. 360 peer feedback average
    peer_r = await db.execute(
        select(func.avg(Evaluation.overall_score))
        .where(Evaluation.employee_id == employee_id)
        .where(Evaluation.eval_type == EvalTypeEnum.peer_360)
    )
    peer_raw = peer_r.scalar_one_or_none() or 0.0
    peer_score = round(peer_raw * 10, 2)

    # 4. Client feedback average
    mijoz_r = await db.execute(
        select(func.avg(Evaluation.overall_score))
        .where(Evaluation.employee_id == employee_id)
        .where(Evaluation.eval_type == EvalTypeEnum.mijoz)
    )
    mijoz_raw = mijoz_r.scalar_one_or_none() or 0.0
    mijoz_score = round(mijoz_raw * 10, 2)

    # USI Formula
    usi = (
        kpi_avg      * 0.25 +
        rahbar_score * 0.30 +
        peer_score   * 0.25 +
        mijoz_score  * 0.20
    )
    usi = round(usi, 2)

    # Update employee record
    emp_r = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = emp_r.scalar_one_or_none()
    if emp:
        emp.usi_score = usi
        emp.status = _status_from_usi(usi)

    return UsiCalculationResult(
        employee_id=employee_id,
        kpi_avg=kpi_avg,
        rahbar_score=rahbar_score,
        peer_360_score=peer_score,
        mijoz_score=mijoz_score,
        usi_score=usi,
        label=_usi_label(usi),
    )
