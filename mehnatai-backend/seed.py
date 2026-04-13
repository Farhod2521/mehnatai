"""
Seed script: creates initial users and sample employees.
Run: python seed.py
"""

import asyncio
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app.database import Base
from app.models.user import User, RoleEnum
from app.models.employee import Employee, DepartmentEnum, StatusEnum, ClusterEnum
from app.models.kpi import KpiRecord
from app.core.security import hash_password

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


EMPLOYEES = [
    {"first_name": "Azizbek", "last_name": "Fayzullayev", "position": "Senior Developer",
     "department": DepartmentEnum.it, "experience_years": 5, "usi_score": 92.0,
     "status": StatusEnum.yuqori, "cluster": ClusterEnum.yulduz,
     "email": "azizbek@mehnatai.uz", "hired_date": date(2020, 3, 15)},
    {"first_name": "Sardor", "last_name": "Yusupov", "position": "Backend Developer",
     "department": DepartmentEnum.it, "experience_years": 3, "usi_score": 78.0,
     "status": StatusEnum.yuqori, "cluster": ClusterEnum.barqaror,
     "email": "sardor@mehnatai.uz", "hired_date": date(2021, 6, 1)},
    {"first_name": "Nilufar", "last_name": "Rahimova", "position": "HR Manager",
     "department": DepartmentEnum.hr, "experience_years": 4, "usi_score": 85.0,
     "status": StatusEnum.yuqori, "cluster": ClusterEnum.yulduz,
     "email": "nilufar@mehnatai.uz", "hired_date": date(2020, 9, 10)},
    {"first_name": "Bobur", "last_name": "Toshmatov", "position": "Frontend Developer",
     "department": DepartmentEnum.it, "experience_years": 2, "usi_score": 62.0,
     "status": StatusEnum.orta, "cluster": ClusterEnum.barqaror,
     "email": "bobur@mehnatai.uz", "hired_date": date(2022, 1, 20)},
    {"first_name": "Zulfiya", "last_name": "Karimova", "position": "Marketing Specialist",
     "department": DepartmentEnum.marketing, "experience_years": 3, "usi_score": 55.0,
     "status": StatusEnum.orta, "cluster": ClusterEnum.rivojlanish,
     "email": "zulfiya@mehnatai.uz", "hired_date": date(2021, 11, 5)},
]

KPI_DATA = [
    # Azizbek (emp 1) — last 6 months
    {"month": 11, "year": 2025, "code_quality": 90, "deadline_adherence": 88, "bug_fix_speed": 82, "documentation": 78, "team_participation": 91, "new_technologies": 85},
    {"month": 12, "year": 2025, "code_quality": 91, "deadline_adherence": 89, "bug_fix_speed": 84, "documentation": 80, "team_participation": 92, "new_technologies": 86},
    {"month": 1,  "year": 2026, "code_quality": 92, "deadline_adherence": 90, "bug_fix_speed": 85, "documentation": 81, "team_participation": 93, "new_technologies": 87},
    {"month": 2,  "year": 2026, "code_quality": 93, "deadline_adherence": 88, "bug_fix_speed": 86, "documentation": 82, "team_participation": 91, "new_technologies": 88},
    {"month": 3,  "year": 2026, "code_quality": 94, "deadline_adherence": 90, "bug_fix_speed": 87, "documentation": 83, "team_participation": 92, "new_technologies": 90},
    {"month": 4,  "year": 2026, "code_quality": 94, "deadline_adherence": 88, "bug_fix_speed": 76, "documentation": 80, "team_participation": 91, "new_technologies": 82},
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # Create employees
        employee_objects = []
        for data in EMPLOYEES:
            emp = Employee(
                **data,
                avatar_initials=(data["first_name"][0] + data["last_name"][0]).upper(),
            )
            db.add(emp)
            employee_objects.append(emp)

        await db.flush()

        # KPI records for first employee
        for kpi in KPI_DATA:
            record = KpiRecord(employee_id=employee_objects[0].id, **kpi)
            record.kpi_avg = record.compute_avg()
            db.add(record)

        # Create users
        users = [
            User(username="rahbar", email="rahbar@mehnatai.uz",
                 hashed_password=hash_password("123"),
                 role=RoleEnum.rahbar, is_active=True),
            User(username="xodim", email="xodim@mehnatai.uz",
                 hashed_password=hash_password("123"),
                 role=RoleEnum.xodim, is_active=True,
                 employee_id=employee_objects[0].id),
            User(username="hr", email="hr@mehnatai.uz",
                 hashed_password=hash_password("hr123"),
                 role=RoleEnum.hr, is_active=True,
                 employee_id=employee_objects[2].id),
        ]
        for u in users:
            db.add(u)

        await db.commit()
        print("✓ Seed completed!")
        print("  Users created:")
        print("    rahbar / 123  → rahbar dashboard")
        print("    xodim  / 123  → xodim panel")
        print("    hr     / hr123 → HR panel")
        print(f"  Employees: {len(EMPLOYEES)}")
        print(f"  KPI records: {len(KPI_DATA)}")


if __name__ == "__main__":
    asyncio.run(seed())
