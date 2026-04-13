from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.task import Task, TaskStatusEnum
from app.models.employee import Employee
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskStats

router = APIRouter()


@router.get("/employee/{employee_id}", response_model=list[TaskOut])
async def get_employee_tasks(
    employee_id: int,
    status: TaskStatusEnum | None = None,
    root_only: bool = Query(False, description="Faqat yuqori darajali vazifalar"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(Task).where(Task.employee_id == employee_id)
    if status:
        query = query.where(Task.status == status)
    if root_only:
        query = query.where(Task.parent_id == None)  # noqa: E711

    result = await db.execute(query.order_by(Task.created_at))
    tasks = result.scalars().all()

    # Build tree for root tasks
    def build_tree(task: Task) -> TaskOut:
        out = TaskOut.model_validate(task)
        out.children = [build_tree(child) for child in task.children]
        return out

    if root_only:
        return [build_tree(t) for t in tasks]
    return [TaskOut.model_validate(t) for t in tasks]


@router.get("/employee/{employee_id}/stats", response_model=TaskStats)
async def get_task_stats(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    total_r = await db.execute(
        select(func.count()).where(Task.employee_id == employee_id)
    )
    done_r = await db.execute(
        select(func.count()).where(Task.employee_id == employee_id, Task.is_done == True)  # noqa
    )
    pending_r = await db.execute(
        select(func.count()).where(Task.employee_id == employee_id, Task.status == TaskStatusEnum.pending)
    )
    in_progress_r = await db.execute(
        select(func.count()).where(Task.employee_id == employee_id, Task.status == TaskStatusEnum.in_progress)
    )

    total = total_r.scalar_one()
    done = done_r.scalar_one()
    pending = pending_r.scalar_one()
    in_progress = in_progress_r.scalar_one()

    return TaskStats(
        employee_id=employee_id,
        total=total,
        done=done,
        pending=pending,
        in_progress=in_progress,
        completion_rate=round((done / total * 100) if total else 0, 1),
    )


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(
    body: TaskCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    emp_r = await db.execute(select(Employee).where(Employee.id == body.employee_id))
    if not emp_r.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Xodim topilmadi")

    task = Task(**body.model_dump())
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return TaskOut.model_validate(task)


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Vazifa topilmadi")
    return TaskOut.model_validate(task)


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: int,
    body: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Vazifa topilmadi")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    if body.is_done is True:
        task.status = TaskStatusEnum.done
    elif body.is_done is False and task.status == TaskStatusEnum.done:
        task.status = TaskStatusEnum.in_progress

    await db.flush()
    await db.refresh(task)
    return TaskOut.model_validate(task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Vazifa topilmadi")
    await db.delete(task)
