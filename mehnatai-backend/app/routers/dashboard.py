from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.employee import Employee, StatusEnum
from app.models.kpi import KpiRecord
from app.models.evaluation import Evaluation
from app.models.task import Task, TaskStatusEnum
from app.models.user import User
from app.core.deps import require_hr, get_current_user

router = APIRouter()


@router.get("/stats")
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    """Main dashboard summary for rahbar panel."""
    total_emp = (await db.execute(select(func.count(Employee.id)))).scalar_one()
    yuqori = (await db.execute(
        select(func.count(Employee.id)).where(Employee.status == StatusEnum.yuqori)
    )).scalar_one()
    orta = (await db.execute(
        select(func.count(Employee.id)).where(Employee.status == StatusEnum.orta)
    )).scalar_one()
    rivojlanish = (await db.execute(
        select(func.count(Employee.id)).where(Employee.status == StatusEnum.rivojlanish)
    )).scalar_one()

    avg_usi = (await db.execute(select(func.avg(Employee.usi_score)))).scalar_one() or 0.0

    total_tasks = (await db.execute(select(func.count(Task.id)))).scalar_one()
    done_tasks = (await db.execute(
        select(func.count(Task.id)).where(Task.is_done == True)  # noqa
    )).scalar_one()

    total_evals = (await db.execute(select(func.count(Evaluation.id)))).scalar_one()

    return {
        "employees": {
            "total": total_emp,
            "yuqori": yuqori,
            "orta": orta,
            "rivojlanish": rivojlanish,
        },
        "avg_usi": round(avg_usi, 1),
        "tasks": {
            "total": total_tasks,
            "done": done_tasks,
            "completion_rate": round((done_tasks / total_tasks * 100) if total_tasks else 0, 1),
        },
        "evaluations_total": total_evals,
    }


@router.get("/top-performers")
async def top_performers(
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    result = await db.execute(
        select(Employee)
        .order_by(Employee.usi_score.desc())
        .limit(limit)
    )
    employees = result.scalars().all()
    return [
        {
            "id": e.id,
            "full_name": e.full_name,
            "position": e.position,
            "department": e.department.value,
            "usi_score": e.usi_score,
            "status": e.status.value,
            "avatar_initials": e.avatar_initials,
        }
        for e in employees
    ]


@router.get("/my-stats")
async def my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stats for xodim's own dashboard."""
    if not current_user.employee_id:
        return {"message": "Xodim profili biriktirilmagan"}

    emp_id = current_user.employee_id

    emp_r = await db.execute(select(Employee).where(Employee.id == emp_id))
    emp = emp_r.scalar_one_or_none()

    task_total = (await db.execute(
        select(func.count(Task.id)).where(Task.employee_id == emp_id)
    )).scalar_one()
    task_done = (await db.execute(
        select(func.count(Task.id)).where(Task.employee_id == emp_id, Task.is_done == True)  # noqa
    )).scalar_one()

    kpi_r = await db.execute(
        select(KpiRecord)
        .where(KpiRecord.employee_id == emp_id)
        .order_by(KpiRecord.year.desc(), KpiRecord.month.desc())
        .limit(1)
    )
    latest_kpi = kpi_r.scalar_one_or_none()

    return {
        "employee_id": emp_id,
        "full_name": emp.full_name if emp else None,
        "usi_score": emp.usi_score if emp else 0,
        "status": emp.status.value if emp else None,
        "tasks": {"total": task_total, "done": task_done},
        "latest_kpi_avg": latest_kpi.kpi_avg if latest_kpi else None,
    }
