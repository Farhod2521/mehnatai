"""
Run once to create admin users:
  docker exec -it mehnatai_backend python create_users.py
"""
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app.core.security import hash_password
from app.models.user import User, RoleEnum

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

USERS_TO_CREATE = [
    {
        "username": "+998994252521",
        "email": "rahbar@testyarat.uz",
        "password": "12345678",
        "role": RoleEnum.rahbar,
    },
    {
        "username": "+998994252525",
        "email": "hr@testyarat.uz",
        "password": "12345678",
        "role": RoleEnum.hr,
    },
]


async def main() -> None:
    async with SessionLocal() as db:
        for data in USERS_TO_CREATE:
            existing = await db.scalar(select(User).where(User.username == data["username"]))
            if existing:
                print(f"  SKIP  {data['username']} — allaqachon mavjud")
                continue

            user = User(
                username=data["username"],
                email=data["email"],
                hashed_password=hash_password(data["password"]),
                role=data["role"],
                is_active=True,
            )
            db.add(user)
            print(f"  OK    {data['username']} ({data['role'].value}) yaratildi")

        await db.commit()
    print("\nTayyor!")


if __name__ == "__main__":
    asyncio.run(main())
