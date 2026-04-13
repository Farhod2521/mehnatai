from datetime import datetime
from pydantic import BaseModel
from app.models.evaluation import EvalTypeEnum, SentimentEnum


class EvaluationBase(BaseModel):
    employee_id: int
    eval_type: EvalTypeEnum
    work_quality: float | None = None
    punctuality: float | None = None
    communication: float | None = None
    initiative: float | None = None
    teamwork: float | None = None
    overall_score: float
    comment: str | None = None
    is_anonymous: bool = False


class EvaluationCreate(EvaluationBase):
    pass


class EvaluationOut(EvaluationBase):
    id: int
    evaluator_id: int | None = None
    sentiment: SentimentEnum | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EvaluationSummary(BaseModel):
    employee_id: int
    rahbar_avg: float | None
    peer_360_avg: float | None
    mijoz_avg: float | None
    total_count: int
