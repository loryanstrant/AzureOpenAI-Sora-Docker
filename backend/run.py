import sys
from pathlib import Path

# Ensure backend/app is on sys.path for imports when running directly
base = Path(__file__).parent
app_dir = base / "app"
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))

from app.main import app  # noqa: E402
