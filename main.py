import uuid
import shutil
from pathlib import Path
from typing import List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Import shared components
from worker import celery_app
from config import (
    MCP_ENABLED,
    MAX_UPLOAD_FILES,
    MAX_UPLOAD_FILE_BYTES,
    MAX_UPLOAD_TOTAL_BYTES,
    OUTPUTS_DIR,
    TEMP_UPLOADS_DIR,
    UPLOAD_CHUNK_BYTES,
)
from schemas import JobSettings, JobResponse

# Import MCP Server components
from fastmcp import FastMCP
from mcp_tools import get_tools

app = FastAPI()

STATIC_DIR = Path(__file__).parent / "frontend" / "dist"

mcp_server = FastMCP(tools=get_tools()) if MCP_ENABLED else None

# Ensure base directories exist
TEMP_UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

# --- Helper Functions ---

def _parse_job_settings(settings: str) -> JobSettings:
    """Parse job settings JSON across both Pydantic v1 and v2."""
    parser = getattr(JobSettings, "model_validate_json", None)
    if parser is not None:
        return parser(settings)
    return JobSettings.parse_raw(settings)


def _dump_job_settings(job_settings: JobSettings) -> dict:
    """Serialize settings for Celery across both Pydantic v1 and v2."""
    dumper = getattr(job_settings, "model_dump", None)
    if dumper is not None:
        return dumper()
    return job_settings.dict()


async def _save_uploads(files: List[UploadFile], job_dir: Path) -> None:
    """Write uploads with bounded file and aggregate sizes to protect disk and workers."""
    if len(files) > MAX_UPLOAD_FILES:
        raise HTTPException(status_code=413, detail=f"Too many files; maximum is {MAX_UPLOAD_FILES}.")

    total_bytes = 0
    for file in files:
        if not file.filename:
            await file.close()
            continue

        clean_filename = Path(file.filename).name
        if not clean_filename or clean_filename in {".", ".."}:
            await file.close()
            continue

        file_path = job_dir / clean_filename
        file_bytes = 0
        try:
            with open(file_path, "wb") as buffer:
                while chunk := await file.read(UPLOAD_CHUNK_BYTES):
                    file_bytes += len(chunk)
                    total_bytes += len(chunk)
                    if file_bytes > MAX_UPLOAD_FILE_BYTES:
                        raise HTTPException(status_code=413, detail="An uploaded file is too large.")
                    if total_bytes > MAX_UPLOAD_TOTAL_BYTES:
                        raise HTTPException(status_code=413, detail="The upload is too large.")
                    buffer.write(chunk)
        except Exception:
            file_path.unlink(missing_ok=True)
            raise
        finally:
            await file.close()

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

@app.post("/api/jobs", response_model=JobResponse)
async def create_packaging_job(
    files: List[UploadFile] = File(...),
    settings: str = Form(...),  # Settings will be a JSON string
):
    """Accepts photo uploads and job settings to start a packaging job."""
    try:
        job_settings = _parse_job_settings(settings)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid settings format: {e}")

    job_id = str(uuid.uuid4())
    job_dir = TEMP_UPLOADS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    try:
        await _save_uploads(files, job_dir)
    except Exception:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise

    # Launch background task with Celery
    celery_app.send_task(
        "worker.run_packaging_job",
        args=[job_id, str(job_dir), _dump_job_settings(job_settings)],
        task_id=job_id
    )

    return JobResponse(
        job_id=job_id,
        status="queued",
        message=f"Job '{job_id}' has been queued. {len(files)} files received."
    )


@app.get("/api/jobs/{job_id}/status")
async def get_job_status_api(job_id: str):
    """Endpoint to poll for the status of a job."""
    return JSONResponse(content=get_job_status(job_id))


@app.get("/api/jobs/{job_id}/download/{zip_filename}")
async def download_zip_package(job_id: str, zip_filename: str):
    """Allows downloading of a packaged ZIP file."""
    # Strict validation of job_id structure (UUID format)
    try:
        import uuid
        val = uuid.UUID(job_id, version=4)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job identifier formatting.")

    # Strict zip_filename sanitization
    clean_filename = Path(zip_filename).name
    if not clean_filename or not clean_filename.endswith('.zip') or clean_filename in ('.', '..'):
        raise HTTPException(status_code=400, detail="Invalid filename format or extension.")

    file_path = OUTPUTS_DIR / job_id / clean_filename

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found.")

    return FileResponse(file_path, media_type='application/zip', filename=zip_filename)


def _mount_runtime_apps() -> None:
    """Mount runtime sub-apps after API routes so they do not shadow /api."""
    if mcp_server is not None:
        app.mount("/mcp", mcp_server)
    if STATIC_DIR.is_dir():
        app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")


_mount_runtime_apps()
