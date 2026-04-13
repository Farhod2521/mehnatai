from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database import get_db
from app.models.evaluation import Evaluation, EvalTypeEnum
from app.models.employee import Employee
from app.models.user import User
from app.core.deps import get_current_user, require_hr
from app.schemas.evaluation import EvaluationCreate, EvaluationOut, EvaluationSummary
from app.services.nlp import analyze_sentiment

router = APIRouter()


@router.get("/employee/{employee_id}", response_model=list[EvaluationOut])
async def get_employee_evaluations(
    employee_id: int,
    eval_type: EvalTypeEnum | None = None,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(Evaluation).where(Evaluation.employee_id == employee_id)
    if eval_type:
        query = query.where(Evaluation.eval_type == eval_type)
    result = await db.execute(query.order_by(desc(Evaluation.created_at)).limit(limit))
    return result.scalars().all()


@router.get("/employee/{employee_id}/summary", response_model=EvaluationSummary)
async def get_evaluation_summary(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    async def avg_for_type(etype: EvalTypeEnum) -> float | None:
        result = await db.execute(
            select(func.avg(Evaluation.overall_score))
            .where(Evaluation.employee_id == employee_id)
            .where(Evaluation.eval_type == etype)
        )
        return result.scalar_one_or_none()

    count_result = await db.execute(
        select(func.count()).where(Evaluation.employee_id == employee_id)
    )

    return EvaluationSummary(
        employee_id=employee_id,
        rahbar_avg=await avg_for_type(EvalTypeEnum.rahbar),
        peer_360_avg=await avg_for_type(EvalTypeEnum.peer_360),
        mijoz_avg=await avg_for_type(EvalTypeEnum.mijoz),
        total_count=count_result.scalar_one(),
    )


@router.post("", response_model=EvaluationOut, status_code=201)
async def create_evaluation(
    body: EvaluationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emp_result = await db.execute(select(Employee).where(Employee.id == body.employee_id))
    if not emp_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Xodim topilmadi")

    evaluation = Evaluation(
        **body.model_dump(),
        evaluator_id=current_user.id if not body.is_anonymous else None,
    )

    # Auto NLP sentiment analysis
    if body.comment:
        evaluation.sentiment = analyze_sentiment(body.comment)

    db.add(evaluation)
    await db.flush()
    await db.refresh(evaluation)
    return evaluation


@router.delete("/{eval_id}", status_code=204)
async def delete_evaluation(
    eval_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    result = await db.execute(select(Evaluation).where(Evaluation.id == eval_id))
    ev = result.scalar_one_or_none()
    if not ev:
        raise HTTPException(status_code=404, detail="Baholash topilmadi")
    await db.delete(ev)
