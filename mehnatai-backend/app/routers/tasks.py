import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.task import Task, TaskStatusEnum
from app.models.task_report import TaskReport
from app.models.employee import Employee
from app.models.user import User, RoleEnum
from app.core.deps import get_current_user
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskStats
from app.schemas.task_report import TaskReportOut

router = APIRouter()

UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME_PREFIXES = ("image/", "application/pdf",
                         "application/msword",
                         "application/vnd.openxmlformats",
                         "application/vnd.ms-")
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


async def _get_task_with_children(task_id: int, db: AsyncSession) -> Task | None:
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.children).selectinload(Task.children).selectinload(Task.children),
            selectinload(Task.reports),
        )
        .where(Task.id == task_id)
    )
    return result.scalar_one_or_none()


# ─── HR Pending ────────────────────────────────────────────────────────────────

@router.get("/hr-pending", response_model=list[TaskOut])
async def get_hr_pending_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [RoleEnum.hr, RoleEnum.rahbar]:
        raise HTTPException(status_code=403, detail="Faqat HR va Rahbar ko'ra oladi")
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.children).selectinload(Task.children),
            selectinload(Task.reports),
        )
        .where(Task.status == TaskStatusEnum.hr_check)
        .order_by(Task.updated_at.desc())
    )
    tasks = result.scalars().all()
    return [TaskOut.model_validate(t) for t in tasks]


# ─── Employee tasks ────────────────────────────────────────────────────────────

@router.get("/employee/{employee_id}", response_model=list[TaskOut])
async def get_employee_tasks(
    employee_id: int,
    status: TaskStatusEnum | None = None,
    root_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = (
        select(Task)
        .options(
            selectinload(Task.children).selectinload(Task.children).selectinload(Task.children),
            selectinload(Task.reports),
        )
        .where(Task.employee_id == employee_id)
    )
    if status:
        query = query.where(Task.status == status)
    if root_only:
        query = query.where(Task.parent_id == None)  # noqa: E711

    result = await db.execute(query.order_by(Task.created_at))
    tasks = result.scalars().all()
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


# ─── Task CRUD ─────────────────────────────────────────────────────────────────

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
    task = await _get_task_with_children(task.id, db)
    return TaskOut.model_validate(task)


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    task = await _get_task_with_children(task_id, db)
    if not task:
        raise HTTPException(status_code=404, detail="Vazifa topilmadi")
    return TaskOut.model_validate(task)


@router.patch("/{task_id}/approve", response_model=TaskOut)
async def approve_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
    task = await _get_task_with_children(task_id, db)
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

    if body.is_done is True and task.status != TaskStatusEnum.done:
        task.is_done = False
        task.status = TaskStatusEnum.hr_check
    elif body.is_done is False and task.status in [TaskStatusEnum.hr_check, TaskStatusEnum.done]:
        task.status = TaskStatusEnum.in_progress

    await db.flush()
    task = await _get_task_with_children(task_id, db)
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


# ─── Task Reports (file upload) ────────────────────────────────────────────────

@router.get("/{task_id}/reports", response_model=list[TaskReportOut])
async def list_task_reports(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(TaskReport).where(TaskReport.task_id == task_id).order_by(TaskReport.uploaded_at)
    )
    return [TaskReportOut.model_validate(r) for r in result.scalars().all()]


@router.post("/{task_id}/reports", response_model=list[TaskReportOut], status_code=201)
async def upload_task_reports(
    task_id: int,
    files: list[UploadFile] = File(...),
    comment: str = Form(""),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_r = await db.execute(select(Task).where(Task.id == task_id))
    task = task_r.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Vazifa topilmadi")

    saved: list[TaskReport] = []
    for upload in files:
        content = await upload.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"{upload.filename}: fayl hajmi 20 MB dan oshmasligi kerak")

        ext = Path(upload.filename or "file").suffix
        unique_name = f"{uuid.uuid4().hex}{ext}"
        dest = UPLOAD_DIR / unique_name
        dest.write_bytes(content)

        report = TaskReport(
            task_id=task_id,
            uploaded_by_id=current_user.id,
            original_name=upload.filename or unique_name,
            file_path=unique_name,
            mime_type=upload.content_type,
            file_size=len(content),
            comment=comment.strip() or None,
        )
        db.add(report)
        saved.append(report)

    await db.flush()
    # refresh to get ids
    for r in saved:
        await db.refresh(r)

    return [TaskReportOut.model_validate(r) for r in saved]


@router.delete("/reports/{report_id}", status_code=204)
async def delete_task_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(TaskReport).where(TaskReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Hisobot topilmadi")
    if current_user.role not in [RoleEnum.hr, RoleEnum.rahbar] and report.uploaded_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")

    file_path = UPLOAD_DIR / report.file_path
    if file_path.exists():
        file_path.unlink()
    await db.delete(report)


@router.get("/reports/{report_id}/download")
async def download_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(TaskReport).where(TaskReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Hisobot topilmadi")

    file_path = UPLOAD_DIR / report.file_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Fayl topilmadi")

    return FileResponse(
        path=str(file_path),
        filename=report.original_name,
        media_type=report.mime_type or "application/octet-stream",
    )
