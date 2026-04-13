from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.kpi import KpiRecord
from app.models.employee import Employee
from app.models.user import User
from app.core.deps import get_current_user, require_hr
from app.schemas.kpi import KpiRecordCreate, KpiRecordUpdate, KpiRecordOut, KpiSummary

router = APIRouter()


@router.get("/employee/{employee_id}", response_model=list[KpiRecordOut])
async def get_employee_kpi(
    employee_id: int,
    limit: int = Query(12, ge=1, le=36),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(KpiRecord)
        .where(KpiRecord.employee_id == employee_id)
        .order_by(desc(KpiRecord.year), desc(KpiRecord.month))
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/employee/{employee_id}/summary", response_model=KpiSummary)
async def get_kpi_summary(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(KpiRecord)
        .where(KpiRecord.employee_id == employee_id)
        .order_by(desc(KpiRecord.year), desc(KpiRecord.month))
        .limit(6)
    )
    records = result.scalars().all()
    if not records:
        raise HTTPException(status_code=404, detail="KPI ma'lumotlari topilmadi")

    latest = records[0]
    trend = [
        {"month": r.month, "year": r.year, "kpi_avg": r.kpi_avg}
        for r in reversed(records)
    ]
    return KpiSummary(
        employee_id=employee_id,
        latest_month=latest.month,
        latest_year=latest.year,
        kpi_avg=latest.kpi_avg,
        trend=trend,
    )


@router.post("", response_model=KpiRecordOut, status_code=201)
async def create_kpi(
    body: KpiRecordCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    # Check employee exists
    emp_result = await db.execute(select(Employee).where(Employee.id == body.employee_id))
    if not emp_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Xodim topilmadi")

    record = KpiRecord(**body.model_dump())
    record.kpi_avg = record.compute_avg()
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


@router.patch("/{kpi_id}", response_model=KpiRecordOut)
async def update_kpi(
    kpi_id: int,
    body: KpiRecordUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    result = await db.execute(select(KpiRecord).where(KpiRecord.id == kpi_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="KPI yozuvi topilmadi")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    record.kpi_avg = record.compute_avg()
    await db.flush()
    await db.refresh(record)
    return record


@router.delete("/{kpi_id}", status_code=204)
async def delete_kpi(
    kpi_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    result = await db.execute(select(KpiRecord).where(KpiRecord.id == kpi_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="KPI yozuvi topilmadi")
    await db.delete(record)
