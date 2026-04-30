"""
data.json faylidan xodimlar, KPI va baholash ma'lumotlarini bazaga import qiladi.
Ishga tushirish: python import_data.py
"""

import asyncio
import json
from pathlib import Path
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app.models.employee import Employee, DepartmentEnum, StatusEnum, ClusterEnum
from app.models.kpi import KpiRecord
from app.models.evaluation import Evaluation, EvalTypeEnum, SentimentEnum

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

DEPT_MAP = {
    "IT": DepartmentEnum.it,
    "HR": DepartmentEnum.hr,
    "Sotuv": DepartmentEnum.sotuv,
    "Marketing": DepartmentEnum.marketing,
    "Moliya": DepartmentEnum.moliya,
    "Boshqaruv": DepartmentEnum.boshqaruv,
}
STATUS_MAP = {
    "yuqori":      StatusEnum.yuqori,
    "orta":        StatusEnum.orta,
    "rivojlanish": StatusEnum.rivojlanish,
}
CLUSTER_MAP = {
    "yulduz":      ClusterEnum.yulduz,
    "barqaror":    ClusterEnum.barqaror,
    "rivojlanish": ClusterEnum.rivojlanish,
}
EVAL_MAP = {
    "rahbar":   EvalTypeEnum.rahbar,
    "peer_360": EvalTypeEnum.peer_360,
    "mijoz":    EvalTypeEnum.mijoz,
}
SENTIMENT_MAP = {
    "ijobiy":  SentimentEnum.ijobiy,
    "neytral": SentimentEnum.neytral,
    "salbiy":  SentimentEnum.salbiy,
}


async def import_data():
    data_path = Path(__file__).parent / "data.json"
    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)

    async with SessionLocal() as db:
        emp_objects: list[Employee] = []

        # 1. Xodimlarni qo'shish
        print("→ Xodimlar qo'shilmoqda...")
        for raw in data["employees"]:
            hired = None
            if raw.get("hired_date"):
                y, m, d = raw["hired_date"].split("-")
                hired = date(int(y), int(m), int(d))

            emp = Employee(
                first_name=raw["first_name"],
                last_name=raw["last_name"],
                position=raw["position"],
                department=DEPT_MAP[raw["department"]],
                status=STATUS_MAP[raw["status"]],
                usi_score=raw["usi_score"],
                experience_years=raw["experience_years"],
                email=raw.get("email"),
                phone=raw.get("phone"),
                hired_date=hired,
                cluster=CLUSTER_MAP.get(raw.get("cluster", "")),
                bio=raw.get("bio"),
                avatar_initials=(raw["first_name"][0] + raw["last_name"][0]).upper(),
            )
            db.add(emp)
            emp_objects.append(emp)

        await db.flush()
        print(f"   {len(emp_objects)} ta xodim qo'shildi")

        # 2. KPI recordlarni qo'shish
        print("→ KPI yozuvlar qo'shilmoqda...")
        kpi_count = 0
        for raw in data["kpi_records"]:
            if raw.get("_note"):
                continue
            idx = raw["employee_index"]
            if idx >= len(emp_objects):
                continue
            kpi = KpiRecord(
                employee_id=emp_objects[idx].id,
                month=raw["month"],
                year=raw["year"],
                code_quality=raw["code_quality"],
                deadline_adherence=raw["deadline_adherence"],
                bug_fix_speed=raw["bug_fix_speed"],
                documentation=raw["documentation"],
                team_participation=raw["team_participation"],
                new_technologies=raw["new_technologies"],
                kpi_avg=raw["kpi_avg"],
            )
            db.add(kpi)
            kpi_count += 1

        print(f"   {kpi_count} ta KPI yozuv qo'shildi")

        # 3. Baholashlarni qo'shish
        print("→ Baholashlar qo'shilmoqda...")
        eval_count = 0
        for raw in data["evaluations"]:
            if raw.get("_note"):
                continue
            idx = raw["employee_index"]
            if idx >= len(emp_objects):
                continue
            ev = Evaluation(
                employee_id=emp_objects[idx].id,
                eval_type=EVAL_MAP[raw["eval_type"]],
                work_quality=raw.get("work_quality"),
                punctuality=raw.get("punctuality"),
                communication=raw.get("communication"),
                initiative=raw.get("initiative"),
                teamwork=raw.get("teamwork"),
                overall_score=raw["overall_score"],
                comment=raw.get("comment"),
                sentiment=SENTIMENT_MAP.get(raw.get("sentiment", ""), None),
                is_anonymous=raw.get("is_anonymous", False),
            )
            db.add(ev)
            eval_count += 1

        print(f"   {eval_count} ta baholash qo'shildi")

        await db.commit()
        print("\n✓ Import muvaffaqiyatli yakunlandi!")
        print("\nXodimlar klasterlari:")
        for emp in emp_objects:
            print(f"  [{emp.cluster.value if emp.cluster else '—':12}] "
                  f"{emp.first_name} {emp.last_name} — USI: {emp.usi_score}")

        print("\nEndi K-Means ishga tushirish uchun:")
        print("  POST /ai/clusters/update   (HR panelidan yoki API orqali)")


if __name__ == "__main__":
    asyncio.run(import_data())
