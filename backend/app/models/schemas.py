from typing import Optional, Literal, Dict
from pydantic import BaseModel, Field, model_validator

Resolution = Literal[
    "480x480",
    "480x854",
    "854x480",
    "720x720",
    "720x1280",
    "1280x720",
    "1080x1080",
    "1080x1920",
    "1920x1080",
]

MAX_DURATION_BY_RESOLUTION: Dict[str, int] = {
    "1920x1080": 10,
}

class VideoRequest(BaseModel):
    prompt: str = Field(min_length=1)
    resolution: Resolution
    duration_seconds: int = Field(ge=1, le=20)
    seed: Optional[int] = None

    @model_validator(mode="after")
    def check_resolution_duration(self):
        cap = MAX_DURATION_BY_RESOLUTION.get(self.resolution)
        if cap is not None and self.duration_seconds > cap:
            raise ValueError(f"Max duration for {self.resolution} is {cap} seconds")
        return self

class JobStatus(BaseModel):
    job_id: str
    status: Literal["queued", "running", "succeeded", "failed", "canceled", "cancelled", "preprocessing", "processing"]
    message: Optional[str] = None
    eta_seconds: Optional[int] = None

class JobResult(BaseModel):
    job_id: str
    file_url: str
    size_bytes: Optional[int] = None

class CostEstimate(BaseModel):
    resolution: Resolution
    duration_seconds: int
    cost_usd: float
    min_cost_usd: Optional[float] = None
    max_cost_usd: Optional[float] = None
    breakdown: str
    warning: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
