from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
import logging
import time

app = FastAPI(title="Sora Video Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("sora")
logging.basicConfig(level=logging.INFO)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
        duration = (time.time() - start) * 1000
        logger.info(f"{request.method} {request.url.path} -> {response.status_code} in {duration:.1f}ms")
        return response
    except Exception as e:
        duration = (time.time() - start) * 1000
        logger.exception(f"Error handling {request.method} {request.url.path} after {duration:.1f}ms: {e}")
        raise

@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(api_router, prefix="/api")
