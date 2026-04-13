from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import auth, employees, kpi, evaluations, tasks, ai, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="MehnatAI — Sun'iy intellekt yordamida xodimlarni baholash tizimi",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router,        prefix=f"{API_PREFIX}/auth",       tags=["Auth"])
app.include_router(employees.router,   prefix=f"{API_PREFIX}/employees",   tags=["Employees"])
app.include_router(kpi.router,         prefix=f"{API_PREFIX}/kpi",         tags=["KPI"])
app.include_router(evaluations.router, prefix=f"{API_PREFIX}/evaluations", tags=["Evaluations"])
app.include_router(tasks.router,       prefix=f"{API_PREFIX}/tasks",       tags=["Tasks"])
app.include_router(ai.router,          prefix=f"{API_PREFIX}/ai",          tags=["AI"])
app.include_router(dashboard.router,   prefix=f"{API_PREFIX}/dashboard",   tags=["Dashboard"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
