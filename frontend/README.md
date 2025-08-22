Sora Frontend (React + Vite + TS)

For Docker users: This frontend is available as a pre-built image at `ghcr.io/loryanstrant/azureopenai-sora-docker-frontend:latest`. See the main README for Docker setup instructions.

Local Development

Pages
- Home: form to create a video job and preview cost (with per-resolution duration validation)
- Status: polling job status
- Result: play and download video (direct link or proxied streaming)
- Error: fallback

Setup
- npm install
- cp .env.example .env
- Set VITE_API_BASE_URL to your backend (default http://localhost:8000)
- npm run dev
- npm run build
