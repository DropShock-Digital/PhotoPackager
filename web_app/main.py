import uuid
import shutil
import json
import os
import threading
import time
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Import shared components
from .worker import celery_app
from .photopackager_core.config import OUTPUTS_DIR, TEMP_UPLOADS_DIR
from .photopackager_core.filesystem import cleanup_older_than
from .schemas import JobSettings, JobResponse

# Import MCP Server components
from fastmcp import FastMCP
from .mcp_tools import get_tools

app = FastAPI()

# Mount the MCP server as a sub-application
mcp_server = FastMCP(tools=get_tools())
app.mount("/mcp", mcp_server)

# Ensure base directories exist
TEMP_UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

# --- Security / Limits ---
ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tiff", ".tif",
    ".cr2", ".cr3", ".nef", ".arw", ".dng", ".raf", ".orf", ".rw2", ".pef", ".srw"
}
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(500 * 1024 * 1024)))


def verify_api_key(x_api_key: Optional[str] = Header(default=None)):
    token = os.getenv("API_TOKEN")
    if not token:
        return
    if x_api_key != token:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


@app.on_event("startup")
def _start_cleanup_thread():
    temp_ttl_hours = float(os.getenv("TEMP_TTL_HOURS", "24"))
    outputs_ttl_days = os.getenv("OUTPUT_TTL_DAYS")

    def _worker():
        while True:
            try:
                cleanup_older_than(TEMP_UPLOADS_DIR, int(temp_ttl_hours * 3600))
                if outputs_ttl_days:
                    cleanup_older_than(OUTPUTS_DIR, int(float(outputs_ttl_days) * 86400))
            except Exception:
                pass
            time.sleep(3600)

    t = threading.Thread(target=_worker, daemon=True)
    t.start()

# --- Helper Functions ---

def get_job_status(job_id: str):
    """Helper to get the status of a Celery task."""
    task_result = celery_app.AsyncResult(job_id)
    response = {
        "job_id": job_id,
        "status": task_result.status.lower(),
        "message": "",
        "result": None,
        "error": None
    }
    if task_result.successful():
        response["message"] = "Job completed successfully."
        response["result"] = task_result.result
    elif task_result.failed():
        response["message"] = "Job failed."
        response["error"] = str(task_result.info)
    elif task_result.status == 'PENDING':
        response["message"] = "Job is queued and waiting to be processed."
    elif task_result.status == 'STARTED':
        response["message"] = "Job is currently being processed."
    else:
        response["message"] = f"Job is in an unknown state: {task_result.status}"

    return response

# --- API Endpoints ---

@app.post("/api/jobs", response_model=JobResponse, dependencies=[Depends(verify_api_key)])
async def create_packaging_job(
    files: List[UploadFile] = File(...),
    settings: str = Form(...),  # Settings will be a JSON string
):
    """Accepts photo uploads and job settings to start a packaging job."""
    try:
        # Pydantic v2-compatible JSON parsing
        job_settings = JobSettings.model_validate_json(settings)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid settings format: {e}")

    job_id = str(uuid.uuid4())
    job_dir = TEMP_UPLOADS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    # Save uploaded files with validation and size limit
    for file in files:
        filename = Path(file.filename).name
        if Path(filename).suffix.lower() not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {filename}")
        file_path = job_dir / filename
        bytes_written = 0
        with open(file_path, "wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                buffer.write(chunk)
                bytes_written += len(chunk)
                if bytes_written > MAX_UPLOAD_SIZE:
                    try:
                        file_path.unlink(missing_ok=True)
                    except Exception:
                        pass
                    raise HTTPException(status_code=413, detail=f"File too large: {filename}")

    # Launch background task with Celery
    celery_app.send_task(
        "photopackager.web_app.worker.run_packaging_job",
        args=[job_id, str(job_dir), job_settings.model_dump()],
        task_id=job_id
    )

    return JobResponse(
        job_id=job_id,
        status="queued",
        message=f"Job '{job_id}' has been queued. {len(files)} files received."
    )


@app.get("/api/jobs/{job_id}/status", dependencies=[Depends(verify_api_key)])
async def get_job_status_api(job_id: str):
    """Endpoint to poll for the status of a job."""
    return JSONResponse(content=get_job_status(job_id))


@app.get("/api/jobs/{job_id}/download/{zip_filename}", dependencies=[Depends(verify_api_key)])
async def download_zip_package(job_id: str, zip_filename: str):
    """Allows downloading of a packaged ZIP file."""
    # Basic security check
    if not zip_filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Invalid filename.")

    file_path = (OUTPUTS_DIR / job_id / zip_filename).resolve()
    parent_expected = (OUTPUTS_DIR / job_id).resolve()

    if parent_expected not in file_path.parents or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found.")

    return FileResponse(file_path, media_type='application/zip', filename=zip_filename)

# --- Static Files ---
# Mount static files LAST to avoid overshadowing API and sub-app routes
STATIC_DIR = Path(__file__).parent / "static"
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")


@app.post("/api/jobs/{job_id}/cancel", dependencies=[Depends(verify_api_key)])
async def cancel_job(job_id: str):
    """Attempt to cancel a queued/started job."""
    try:
        celery_app.control.revoke(job_id, terminate=True)
        return JSONResponse(content={
            "job_id": job_id,
            "status": "cancellation_requested",
            "message": "Cancellation requested. If job already completed, this has no effect."
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel job: {e}")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/metrics")
async def metrics():
    total_jobs = 0
    total_files = 0
    if OUTPUTS_DIR.exists():
        for child in OUTPUTS_DIR.iterdir():
            if child.is_dir():
                total_jobs += 1
                total_files += sum(1 for p in child.rglob('*') if p.is_file())
    return {
        "outputs_dir": str(OUTPUTS_DIR),
        "total_jobs": total_jobs,
        "total_files": total_files,
    }
