import os
from pathlib import Path

# --- Core Application Paths ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUTS_DIR = PROJECT_ROOT / "outputs"
TEMP_UPLOADS_DIR = PROJECT_ROOT / "temp_uploads"

# --- Redis / Celery Config ---
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

# --- Image Processing Defaults ---
# Default JPEG quality for the 'Optimized' variant (1-100)
OPTIMIZED_QUALITY = int(os.getenv("OPTIMIZED_QUALITY", "95"))

# Default JPEG quality for the 'Compressed' variant (1-100)
COMPRESSED_QUALITY = int(os.getenv("COMPRESSED_QUALITY", "80"))

# --- Processing Limits ---
MAX_IMAGE_PIXELS = None  # None = DecompressionBombWarning disabled (handled in image_processing.py)
