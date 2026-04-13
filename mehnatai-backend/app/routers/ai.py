from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.ai_prediction import AiPrediction
from app.models.employee import Employee
from app.models.user import User
from app.core.deps import get_current_user, require_hr
from app.schemas.ai_prediction import AiPredictionOut, UsiCalculationResult
from app.services.usi import calculate_usi
from app.services.ai import generate_prediction

router = APIRouter()


@router.get("/predictions/{employee_id}", response_model=list[AiPredictionOut])
async def get_predictions(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AiPrediction)
        .where(AiPrediction.employee_id == employee_id)
        .order_by(desc(AiPrediction.created_at))
        .limit(6)
    )
    return result.scalars().all()


@router.post("/predictions/{employee_id}", response_model=AiPredictionOut, status_code=201)
async def create_prediction(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    emp_r = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = emp_r.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")

    prediction = await generate_prediction(employee_id, db)
    db.add(prediction)
    await db.flush()
    await db.refresh(prediction)
    return prediction


@router.get("/usi/{employee_id}", response_model=UsiCalculationResult)
async def compute_usi(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    emp_r = await db.execute(select(Employee).where(Employee.id == employee_id))
    if not emp_r.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Xodim topilmadi")

    return await calculate_usi(employee_id, db)


@router.get("/clusters", response_model=list[dict])
async def get_clusters(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    """Return all employees grouped by their AI cluster."""
    result = await db.execute(select(Employee))
    employees = result.scalars().all()

    clusters: dict[str, list] = {}
    for emp in employees:
        label = emp.cluster.value if emp.cluster else "Aniqlanmagan"
        if label not in clusters:
            clusters[label] = []
        clusters[label].append({
            "id": emp.id,
            "full_name": emp.full_name,
            "usi_score": emp.usi_score,
            "department": emp.department.value,
        })

    return [{"cluster": k, "count": len(v), "members": v} for k, v in clusters.items()]
