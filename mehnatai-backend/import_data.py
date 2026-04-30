"""
Tizimni tozalab, data.json dan yangi ma'lumotlar yozadi.
Ishga tushirish: python import_data.py
"""

import asyncio
import json
from datetime import date
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app.core.security import hash_password
from app.models.employee import Employee, DepartmentEnum, StatusEnum, ClusterEnum
from app.models.evaluation import Evaluation, EvalTypeEnum, SentimentEnum
from app.models.kpi import KpiRecord
from app.models.task import Task, PriorityEnum, TaskStatusEnum
from app.models.user import User, RoleEnum

engine = create_async_engine(settings.DATABASE_URL, echo=False)
Session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

DEPT   = {"IT": DepartmentEnum.it, "HR": DepartmentEnum.hr, "Sotuv": DepartmentEnum.sotuv,
           "Marketing": DepartmentEnum.marketing, "Moliya": DepartmentEnum.moliya,
           "Boshqaruv": DepartmentEnum.boshqaruv}
STATUS = {"yuqori": StatusEnum.yuqori, "orta": StatusEnum.orta, "rivojlanish": StatusEnum.rivojlanish}
CLUST  = {"yulduz": ClusterEnum.yulduz, "barqaror": ClusterEnum.barqaror, "rivojlanish": ClusterEnum.rivojlanish}
ETYPE  = {"rahbar": EvalTypeEnum.rahbar, "peer_360": EvalTypeEnum.peer_360, "mijoz": EvalTypeEnum.mijoz}
SENT   = {"ijobiy": SentimentEnum.ijobiy, "neytral": SentimentEnum.neytral, "salbiy": SentimentEnum.salbiy}
PRIOR  = {"high": PriorityEnum.high, "medium": PriorityEnum.medium, "low": PriorityEnum.low}
TSTAT  = {"done": TaskStatusEnum.done, "hr_check": TaskStatusEnum.hr_check,
           "in_progress": TaskStatusEnum.in_progress, "pending": TaskStatusEnum.pending}
ROLE   = {"rahbar": RoleEnum.rahbar, "hr": RoleEnum.hr, "xodim": RoleEnum.xodim}


def parse_date(s: str | None) -> date | None:
    if not s:
        return None
    y, m, d = s.split("-")
    return date(int(y), int(m), int(d))


async def ensure_db_enums(db: AsyncSession) -> None:
    """Ma'lumot importi uchun DB enum qiymatlari model bilan mosligini tekshiradi."""
    print("-> Enum qiymatlari tekshirilmoqda...")
    await db.execute(text("ALTER TYPE taskstatusenum ADD VALUE IF NOT EXISTS 'hr_check'"))
    await db.commit()
    print("  OK taskstatusenum tayyor")


async def wipe_all(db: AsyncSession) -> None:
    """Barcha jadvallarni tozalaydi va ID larni qaytadan 1 dan boshlaydi."""
    print("→ Eski ma'lumotlar o'chirilmoqda...")
    await db.execute(text(
        "TRUNCATE TABLE task_reports, tasks, ai_predictions, "
        "evaluations, kpi_records, users, employees "
        "RESTART IDENTITY CASCADE"
    ))
    await db.commit()
    print("  ✓ Barcha jadvallar tozalandi")


async def main() -> None:
    data_path = Path(__file__).parent / "data.json"
    if not data_path.exists():
        data_path = Path(__file__).parent.parent / "data.json"
    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)

    async with Session() as db:
        await ensure_db_enums(db)
        await wipe_all(db)

        # ── 1. XODIMLAR ────────────────────────────────────────────────
        print("→ Xodimlar yozilmoqda...")
        emps: list[Employee] = []
        for r in data["employees"]:
            emp = Employee(
                first_name=r["first_name"],
                last_name=r["last_name"],
                position=r["position"],
                department=DEPT[r["department"]],
                status=STATUS[r["status"]],
                usi_score=r["usi_score"],
                experience_years=r["experience_years"],
                email=r.get("email"),
                phone=r.get("phone"),
                hired_date=parse_date(r.get("hired_date")),
                cluster=CLUST.get(r.get("cluster", ""), None),
                bio=r.get("bio"),
                avatar_initials=(r["first_name"][0] + r["last_name"][0]).upper(),
            )
            db.add(emp)
            emps.append(emp)
        await db.flush()
        print(f"  ✓ {len(emps)} ta xodim")

        # ── 2. KPI YOZUVLAR ─────────────────────────────────────────────
        print("→ KPI yozuvlar yozilmoqda...")
        kpi_count = 0
        for r in data["kpi_records"]:
            ei = r["ei"]
            db.add(KpiRecord(
                employee_id=emps[ei].id,
                month=r["month"], year=r["year"],
                code_quality=r["code_quality"],
                deadline_adherence=r["deadline_adherence"],
                bug_fix_speed=r["bug_fix_speed"],
                documentation=r["documentation"],
                team_participation=r["team_participation"],
                new_technologies=r["new_technologies"],
                kpi_avg=r["kpi_avg"],
            ))
            kpi_count += 1
        await db.flush()
        print(f"  ✓ {kpi_count} ta KPI yozuv")

        # ── 3. BAHOLASHLAR ───────────────────────────────────────────────
        print("→ Baholashlar yozilmoqda...")
        eval_count = 0
        for r in data["evaluations"]:
            ei = r["ei"]
            db.add(Evaluation(
                employee_id=emps[ei].id,
                eval_type=ETYPE[r["eval_type"]],
                work_quality=r.get("work_quality"),
                punctuality=r.get("punctuality"),
                communication=r.get("communication"),
                initiative=r.get("initiative"),
                teamwork=r.get("teamwork"),
                overall_score=r["overall_score"],
                comment=r.get("comment"),
                sentiment=SENT.get(r.get("sentiment", ""), None),
                is_anonymous=r.get("is_anonymous", False),
            ))
            eval_count += 1
        await db.flush()
        print(f"  ✓ {eval_count} ta baholash")

        # ── 4. FOYDALANUVCHILAR ──────────────────────────────────────────
        print("→ Foydalanuvchilar yozilmoqda...")
        user_count = 0
        for r in data["users"]:
            ei = r.get("employee_index")
            db.add(User(
                username=r["username"],
                email=r["email"],
                hashed_password=hash_password(r["password"]),
                role=ROLE[r["role"]],
                is_active=True,
                employee_id=emps[ei].id if ei is not None else None,
            ))
            user_count += 1
        await db.flush()
        print(f"  ✓ {user_count} ta foydalanuvchi")

        # ── 5. VAZIFALAR ─────────────────────────────────────────────────
        print("→ Vazifalar yozilmoqda...")
        task_count = 0
        for r in data["tasks"]:
            ei = r["ei"]
            db.add(Task(
                employee_id=emps[ei].id,
                title=r["title"],
                description=r.get("description"),
                priority=PRIOR[r["priority"]],
                status=TSTAT[r["status"]],
                due_date=parse_date(r.get("due_date")),
                is_done=r.get("is_done", False),
            ))
            task_count += 1
        await db.flush()
        print(f"  ✓ {task_count} ta vazifa")

        await db.commit()

        # ── NATIJA ───────────────────────────────────────────────────────
        print("\n" + "="*55)
        print("✓  IMPORT MUVAFFAQIYATLI YAKUNLANDI")
        print("="*55)
        print(f"\n  Xodimlar  : {len(emps)}")
        print(f"  KPI       : {kpi_count}")
        print(f"  Baholash  : {eval_count}")
        print(f"  Userlar   : {user_count}")
        print(f"  Vazifalar : {task_count}")

        print("\n  Loginlar (username = telefon raqam):")
        print("  ─────────────────────────────────────────────────────")
        print("  +998900000001  / rahbar123   → Rahbar paneli")
        print("  +998901110005  / hr123       → HR paneli (Feruza)")
        print("  ─────────────────────────────────────────────────────")
        for r in data["users"]:
            if r["role"] == "xodim":
                ei = r["employee_index"]
                name = f"{data['employees'][ei]['first_name']} {data['employees'][ei]['last_name']}"
                print(f"  {r['username']:<16} / {r['password']:<10} → {name}")

        print("\n  Klasterlar:")
        yulduz = [e for e in data["employees"] if e["_c"] == "yulduz"]
        barqaror = [e for e in data["employees"] if e["_c"] == "barqaror"]
        rivojlanish = [e for e in data["employees"] if e["_c"] == "rivojlanish"]
        print(f"  Yulduz ({len(yulduz)}):      {', '.join(e['first_name'] for e in yulduz)}")
        print(f"  Barqaror ({len(barqaror)}):   {', '.join(e['first_name'] for e in barqaror)}")
        print(f"  Rivojlanish ({len(rivojlanish)}): {', '.join(e['first_name'] for e in rivojlanish)}")

        print("\n  K-Means ishga tushirish:")
        print("  POST /ai/clusters/update  (HR panelidan)")


if __name__ == "__main__":
    asyncio.run(main())
