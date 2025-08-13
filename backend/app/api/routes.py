from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import VideoRequest, JobStatus, JobResult, CostEstimate
from app.services import azure_sora
from app.services.cost import estimate

router = APIRouter()

@router.post("/videos", response_model=JobStatus)
async def create_video(req: VideoRequest):
    try:
        return await azure_sora.create_job(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/videos/{job_id}/status", response_model=JobStatus)
async def video_status(job_id: str):
    try:
        return await azure_sora.get_status(job_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/videos/{job_id}/result", response_model=JobResult)
async def video_result(job_id: str):
    try:
        return await azure_sora.get_result(job_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/videos/{job_id}/download")
async def video_download(job_id: str):
    try:
        gen = azure_sora.stream_content(job_id)
        return StreamingResponse(gen, media_type="application/octet-stream", headers={"Content-Disposition": f"attachment; filename={job_id}.mp4"})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/cost", response_model=CostEstimate)
async def cost(resolution: str, duration_seconds: int):
    return estimate(resolution, duration_seconds)
