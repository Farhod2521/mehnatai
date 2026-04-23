from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.task import Task, TaskStatusEnum
from app.models.employee import Employee
from app.models.user import User, RoleEnum
from app.core.deps import get_current_user
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskStats

router = APIRouter()


@router.get("/hr-pending", response_model=list[TaskOut])
async def get_hr_pending_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tasks waiting for HR approval — only hr and rahbar can see."""
    if current_user.role not in [RoleEnum.hr, RoleEnum.rahbar]:
        raise HTTPException(status_code=403, detail="Faqat HR va Rahbar ko'ra oladi")
    result = await db.execute(
        select(Task).where(Task.status == TaskStatusEnum.hr_check).order_by(Task.updated_at.desc())
    )
    tasks = result.scalars().all()
    return [TaskOut.model_validate(t) for t in tasks]


@router.get("/employee/{employee_id}", response_model=list[TaskOut])
async def get_employee_tasks(
    employee_id: int,
    status: TaskStatusEnum | None = None,
    root_only: bool = Query(False),
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
    total_r = await db.execute(select(func.count()).where(Task.employee_id == employee_id))
    done_r = await db.execute(select(func.count()).where(Task.employee_id == employee_id, Task.is_done == True))  # noqa
    pending_r = await db.execute(select(func.count()).where(Task.employee_id == employee_id, Task.status == TaskStatusEnum.pending))
    in_progress_r = await db.execute(select(func.count()).where(Task.employee_id == employee_id, Task.status == TaskStatusEnum.in_progress))
    hr_check_r = await db.execute(select(func.count()).where(Task.employee_id == employee_id, Task.status == TaskStatusEnum.hr_check))

    total = total_r.scalar_one()
    done = done_r.scalar_one()
    pending = pending_r.scalar_one()
    in_progress = in_progress_r.scalar_one()
    hr_check = hr_check_r.scalar_one()

    return TaskStats(
        employee_id=employee_id,
        total=total,
        done=done,
        pending=pending,
        in_progress=in_progress,
        hr_check=hr_check,
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


@router.patch("/{task_id}/approve", response_model=TaskOut)
async def approve_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """HR or rahbar approves a task (hr_check → done)."""
    if current_user.role not in [RoleEnum.hr, RoleEnum.rahbar]:
        raise HTTPException(status_code=403, detail="Faqat HR va Rahbar tasdiqlashi mumkin")

    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Vazifa topilmadi")
    if task.status != TaskStatusEnum.hr_check:
        raise HTTPException(status_code=400, detail="Faqat HR tekshiruvdagi vazifalarni tasdiqlash mumkin")

    task.is_done = True
    task.status = TaskStatusEnum.done
    await db.flush()
    await db.refresh(task)
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

    # Employee marks done → goes to hr_check (HR must approve before "done")
    if body.is_done is True and task.status != TaskStatusEnum.done:
        task.is_done = False          # not fully done until HR approves
        task.status = TaskStatusEnum.hr_check
    elif body.is_done is False and task.status in [TaskStatusEnum.hr_check, TaskStatusEnum.done]:
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
