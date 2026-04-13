from datetime import date, datetime
from pydantic import BaseModel, EmailStr
from app.models.employee import StatusEnum, DepartmentEnum, ClusterEnum


class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    position: str
    department: DepartmentEnum
    experience_years: int = 0
    phone: str | None = None
    email: str | None = None
    hired_date: date | None = None
    bio: str | None = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    position: str | None = None
    department: DepartmentEnum | None = None
    status: StatusEnum | None = None
    experience_years: int | None = None
    phone: str | None = None
    email: str | None = None
    hired_date: date | None = None
    bio: str | None = None
    cluster: ClusterEnum | None = None


class EmployeeOut(EmployeeBase):
    id: int
    avatar_initials: str
    status: StatusEnum
    usi_score: float
    cluster: ClusterEnum | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class EmployeeListItem(BaseModel):
    id: int
    first_name: str
    last_name: str
    position: str
    department: DepartmentEnum
    status: StatusEnum
    usi_score: float
    avatar_initials: str
    experience_years: int

    model_config = {"from_attributes": True}


class PaginatedEmployees(BaseModel):
    items: list[EmployeeListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
