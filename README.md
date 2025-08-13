Sora Migration Monorepo
Features
- Video Generation: Create videos via Azure OpenAI Sora deployment (env-configured)
- Configurable Specs: 9 supported resolutions and duration 1–20 seconds
- Smart Validation: Resolution-specific caps (e.g. 1920x1080 max 10s) enforced server and client side
- Web Interface: Modern SPA replacing Thymeleaf (Home, Status, Result) with real-time cost preview
- Performance: Async non-blocking I/O with streaming download endpoint for large files
- Security: Azure Managed Identity support for production, API key for local/dev
- Monitoring: /health endpoint and request/error logging
- Container Ready: Dockerfiles for backend and frontend; docker-compose for local run
- Cost Estimation: Real-time cost preview with breakdown and warnings



Structure
- backend: FastAPI app
- frontend: React app

Backend setup
- cd backend
- poetry install
- create .env with Azure OpenAI settings (see backend/README.md)
- run (port 8090): poetry run uvicorn app.main:app --host 127.0.0.1 --port 8090

Frontend setup
- cd frontend
  npm install
  npm run dev

Environment
- Azure OpenAI variables mapped to Python settings:
  AZURE_OPENAI_ENDPOINT
  AZURE_OPENAI_API_KEY
  AZURE_OPENAI_API_VERSION
  AZURE_OPENAI_DEPLOYMENT
  AZURE_USE_MANAGED_IDENTITY (optional)

Endpoints
- POST /api/videos
- GET /api/videos/{job_id}/status
- GET /api/videos/{job_id}/result
- GET /api/videos/{job_id}/download
- GET /api/cost
- GET /health

Containers
- Backend and frontend each have a Dockerfile.
- To run locally with Docker (backend on 8090):
  docker compose up --build
