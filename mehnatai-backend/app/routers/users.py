from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User, RoleEnum
from app.models.employee import Employee
from app.core.deps import require_hr
from app.core.security import hash_password
from app.schemas.auth import UserOut, UserCreate

router = APIRouter()


@router.post("", response_model=UserOut, status_code=201)
async def create_user_account(
    body: UserCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_hr),
):
    result = await db.execute(select(User).where(User.username == body.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu username allaqachon band")

    email = body.email or f"{body.username.replace('+', '')}@mehnatai.uz"
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu telefon raqam allaqachon ro'yxatdan o'tgan")

    if body.employee_id:
        result = await db.execute(select(Employee).where(Employee.id == body.employee_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Xodim topilmadi")

        result = await db.execute(select(User).where(User.employee_id == body.employee_id))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Bu xodimga allaqachon akkaunt biriktirilgan")

    user = User(
        username=body.username,
        email=email,
        hashed_password=hash_password(body.password),
        role=body.role,
        employee_id=body.employee_id,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    await db.commit()
    return user


@router.get("/by-employee/{employee_id}", response_model=Optional[UserOut])
async def get_user_by_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_hr),
):
    result = await db.execute(select(User).where(User.employee_id == employee_id))
    return result.scalar_one_or_none()
