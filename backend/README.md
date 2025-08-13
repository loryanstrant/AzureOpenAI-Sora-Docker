Sora Backend (FastAPI)

Setup
1) Install Poetry then run:
   poetry install

2) Create .env in backend/ with:
   AZURE_OPENAI_ENDPOINT=
   AZURE_OPENAI_API_KEY=
   AZURE_OPENAI_API_VERSION=preview
   AZURE_OPENAI_DEPLOYMENT=sora
   AZURE_OPENAI_MODEL=sora
   STORAGE_DIR=./storage
   BASE_URL=http://localhost:8090
   AZURE_USE_MANAGED_IDENTITY=false

3) Run dev server (port 8090):
   poetry run uvicorn app.main:app --host 127.0.0.1 --port 8090

Auth modes
- API key: set AZURE_OPENAI_API_KEY
- Managed Identity: set AZURE_USE_MANAGED_IDENTITY=true (requires Azure environment). When enabled, the backend obtains a token via DefaultAzureCredential and sends Authorization: Bearer.

Validation
- 9 supported resolutions
- Global duration: 1–20 seconds
- Resolution-specific caps enforced:
  - 1920x1080: max 10 seconds

Large downloads
- /api/videos/{job_id}/download streams content with chunked proxying to avoid buffering entire files in memory.

API
- POST /api/videos
- GET /api/videos/{job_id}/status
- GET /api/videos/{job_id}/result
- GET /api/videos/{job_id}/download
- GET /api/cost?resolution=&duration_seconds=
- GET /health
