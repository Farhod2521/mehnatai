import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.database import get_db
from app.models.employee import Employee, StatusEnum, DepartmentEnum
from app.models.user import User
from app.core.deps import get_current_user, require_hr, require_rahbar
from app.schemas.employee import (
    EmployeeCreate, EmployeeUpdate, EmployeeOut,
    EmployeeListItem, PaginatedEmployees
)

router = APIRouter()


def _compute_initials(first: str, last: str) -> str:
    return (first[:1] + last[:1]).upper()


def _compute_status(usi: float) -> StatusEnum:
    if usi >= 80:
        return StatusEnum.yuqori
    elif usi >= 60:
        return StatusEnum.orta
    return StatusEnum.rivojlanish


@router.get("", response_model=PaginatedEmployees)
async def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query("", description="Ism yoki lavozim bo'yicha qidiruv"),
    department: DepartmentEnum | None = None,
    status: StatusEnum | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(Employee)

    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(
                Employee.first_name.ilike(pattern),
                Employee.last_name.ilike(pattern),
                Employee.position.ilike(pattern),
            )
        )
    if department:
        query = query.where(Employee.department == department)
    if status:
        query = query.where(Employee.status == status)

    # Total count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()

    # Paginated
    offset = (page - 1) * page_size
    result = await db.execute(query.offset(offset).limit(page_size).order_by(Employee.first_name))
    items = result.scalars().all()

    return PaginatedEmployees(
        items=[EmployeeListItem.model_validate(e) for e in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.post("", response_model=EmployeeOut, status_code=201)
async def create_employee(
    body: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    emp = Employee(
        **body.model_dump(),
        avatar_initials=_compute_initials(body.first_name, body.last_name),
    )
    db.add(emp)
    await db.flush()
    await db.refresh(emp)
    return emp


@router.get("/{employee_id}", response_model=EmployeeOut)
async def get_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")
    return emp


@router.patch("/{employee_id}", response_model=EmployeeOut)
async def update_employee(
    employee_id: int,
    body: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_hr),
):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(emp, field, value)

    if body.first_name or body.last_name:
        emp.avatar_initials = _compute_initials(
            body.first_name or emp.first_name,
            body.last_name or emp.last_name,
        )

    await db.flush()
    await db.refresh(emp)
    return emp


@router.delete("/{employee_id}", status_code=204)
async def delete_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_rahbar),
):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")
    await db.delete(emp)
