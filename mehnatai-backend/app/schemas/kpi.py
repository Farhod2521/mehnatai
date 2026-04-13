from datetime import datetime
from pydantic import BaseModel, model_validator


class KpiRecordBase(BaseModel):
    month: int
    year: int
    code_quality: float = 0.0
    deadline_adherence: float = 0.0
    bug_fix_speed: float = 0.0
    documentation: float = 0.0
    team_participation: float = 0.0
    new_technologies: float = 0.0


class KpiRecordCreate(KpiRecordBase):
    employee_id: int

    @model_validator(mode="after")
    def validate_scores(self):
        fields = [
            self.code_quality, self.deadline_adherence,
            self.bug_fix_speed, self.documentation,
            self.team_participation, self.new_technologies,
        ]
        for v in fields:
            if not (0 <= v <= 100):
                raise ValueError("KPI qiymatlari 0-100 oralig'ida bo'lishi kerak")
        return self


class KpiRecordUpdate(BaseModel):
    code_quality: float | None = None
    deadline_adherence: float | None = None
    bug_fix_speed: float | None = None
    documentation: float | None = None
    team_participation: float | None = None
    new_technologies: float | None = None


class KpiRecordOut(KpiRecordBase):
    id: int
    employee_id: int
    kpi_avg: float
    created_at: datetime

    model_config = {"from_attributes": True}


class KpiSummary(BaseModel):
    employee_id: int
    latest_month: int
    latest_year: int
    kpi_avg: float
    trend: list[dict]   # [{month, year, kpi_avg}, ...]
