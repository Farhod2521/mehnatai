"""
Run once to add hr_check value to task status enum:
  docker exec -it mehnatai_backend python add_hrcheck_migration.py
"""
import asyncio
from sqlalchemy import text
from app.database import engine


async def main() -> None:
    async with engine.begin() as conn:
        try:
            await conn.execute(
                text("ALTER TYPE taskstatusenum ADD VALUE IF NOT EXISTS 'hr_check' AFTER 'in_progress'")
            )
            print("  OK    hr_check qiymati qo'shildi!")
        except Exception as e:
            print(f"  WARN  {e}")
    print("\nTayyor!")


if __name__ == "__main__":
    asyncio.run(main())
