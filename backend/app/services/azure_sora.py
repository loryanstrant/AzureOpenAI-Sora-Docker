from typing import Any, Dict, AsyncGenerator, Tuple
import httpx
from app.models.schemas import VideoRequest, JobStatus, JobResult
from app.config import get_settings
settings = get_settings()

def _validate():
    if not settings.azure_openai_endpoint:
        raise ValueError("Azure OpenAI configuration missing. Set AZURE_OPENAI_ENDPOINT in backend/.env")
    if not settings.azure_openai_api_key and not getattr(settings, "use_managed_identity", False):
        raise ValueError("Set AZURE_OPENAI_API_KEY or enable AZURE_USE_MANAGED_IDENTITY")

def _auth_headers() -> Dict[str, str]:
    if getattr(settings, "use_managed_identity", False):
        try:
            from azure.identity import DefaultAzureCredential
            credential = DefaultAzureCredential()
            token = credential.get_token("https://cognitiveservices.azure.com/.default")
            return {"Authorization": f"Bearer {token.token}"}
        except Exception as e:
            raise ValueError(f"Managed Identity auth failed: {e}")
    return {"api-key": settings.azure_openai_api_key or ""}

def _headers() -> Dict[str, str]:
    base = {
        "Content-Type": "application/json",
    }
    base.update(_auth_headers())
    return base

def _stream_headers() -> Dict[str, str]:
    return _auth_headers()

def _base_jobs() -> str:
    # Per quickstart: {endpoint}/openai/v1/video/generations/jobs
    return f"{settings.azure_openai_endpoint.rstrip('/')}/openai/v1/video/generations"

def _generation_content_url(generation_id: str) -> str:
    # Per quickstart: {endpoint}/openai/v1/video/generations/{generation_id}/content/video
    return f"{settings.azure_openai_endpoint.rstrip('/')}/openai/v1/video/generations/{generation_id}/content/video"

def _resolution_to_wh(resolution: str) -> Tuple[int, int]:
    # resolution formatted as "WIDTHxHEIGHT"
    try:
        w_str, h_str = resolution.lower().split("x", 1)
        return int(w_str), int(h_str)
    except Exception:
        raise ValueError(f"Invalid resolution format: {resolution}")

async def create_job(req: VideoRequest) -> JobStatus:
    _validate()
    width, height = _resolution_to_wh(req.resolution)
    payload: Dict[str, Any] = {
        "prompt": req.prompt,
        "width": width,
        "height": height,
        "n_seconds": req.duration_seconds,
        "model": settings.azure_openai_model,
    }
    if req.seed is not None:
        payload["seed"] = req.seed
    url = f"{_base_jobs()}/jobs"
    params = {"api-version": settings.azure_openai_api_version}
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=_headers(), params=params, json=payload)
        r.raise_for_status()
        data = r.json()
    return JobStatus(
        job_id=data.get("id") or data.get("job_id") or "",
        status=data.get("status", "queued"),
        message=data.get("message"),
        eta_seconds=data.get("eta_seconds"),
    )

async def get_status(job_id: str) -> JobStatus:
    _validate()
    url = f"{_base_jobs()}/jobs/{job_id}"
    params = {"api-version": settings.azure_openai_api_version}
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url, headers=_headers(), params=params)
        r.raise_for_status()
        data = r.json()
    return JobStatus(
        job_id=data.get("id") or job_id,
        status=data.get("status", "running"),
        message=data.get("message"),
        eta_seconds=data.get("eta_seconds"),
    )

async def get_result(job_id: str) -> JobResult:
    _validate()
    # First get job status to obtain generation id(s)
    status_url = f"{_base_jobs()}/jobs/{job_id}"
    params = {"api-version": settings.azure_openai_api_version}
    async with httpx.AsyncClient(timeout=60) as client:
        sr = await client.get(status_url, headers=_headers(), params=params)
        sr.raise_for_status()
        sdata = sr.json()
        generations = sdata.get("generations") or []
        if not generations:
            raise ValueError("No generations found for this job yet")
        generation_id = generations[0].get("id")
        if not generation_id:
            raise ValueError("Generation id not found in job response")
        # Prefer returning a backend proxy URL so clients don't need Azure auth headers
        proxy_url = f"{settings.base_url.rstrip('/')}/api/videos/{job_id}/download"
    return JobResult(job_id=job_id, file_url=proxy_url, size_bytes=None)

async def stream_content(job_id: str) -> AsyncGenerator[bytes, None]:
    _validate()
    # Resolve to generation content stream
    status_url = f"{_base_jobs()}/jobs/{job_id}"
    params = {"api-version": settings.azure_openai_api_version}
    async with httpx.AsyncClient(timeout=httpx.Timeout(600.0, read=600.0)) as client:
        sr = await client.get(status_url, headers=_headers(), params=params)
        sr.raise_for_status()
        sdata = sr.json()
        generations = sdata.get("generations") or []
        if not generations:
            raise ValueError("No generations available to download yet")
        generation_id = generations[0].get("id")
        if not generation_id:
            raise ValueError("Generation id missing")
        url = _generation_content_url(generation_id)
        async with client.stream("GET", url, headers=_stream_headers(), params=params) as response:
            response.raise_for_status()
            async for chunk in response.aiter_bytes(chunk_size=1024 * 1024):
                if chunk:
                    yield chunk
