#!/usr/bin/env python3
"""
PhotoPackager API Server (FastAPI)
Delegates heavy processing to Celery workers.
"""

import uuid
import shutil
import json
from pathlib import Path
from typing import List
import sys

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from celery.result import AsyncResult

# Import core components
from src.core.schemas import JobSettings, JobResponse
from src.core.models import PhotoPackagerSettings, QualitySettings
from src.core.config import OUTPUTS_DIR, TEMP_UPLOADS_DIR
from src.server.worker import celery, process_photos_task

app = FastAPI(title="PhotoPackager API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure base directories exist
TEMP_UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

# Allowed types and limits
ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tiff", ".tif",
    ".cr2", ".cr3", ".nef", ".arw", ".dng", ".raf", ".orf", ".rw2", ".pef", ".srw"
}
MAX_UPLOAD_SIZE = 500 * 1024 * 1024

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "PhotoPackager API"}

@app.post("/api/jobs", response_model=JobResponse)
async def create_packaging_job(
    settings: JobSettings,
):
    """
    Accepts job settings pointing to local paths and spawns a Celery task.
    No file uploads required (Local-First).
    """
    job_id = str(uuid.uuid4())
    
    # Input Validation
    input_path = Path(settings.input_path)
    output_path_root = Path(settings.output_path)

    if not input_path.exists() or not input_path.is_dir():
         raise HTTPException(status_code=400, detail=f"Input directory does not exist: {settings.input_path}")
    
    if not output_path_root.exists():
        try:
            output_path_root.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cannot create output directory: {e}")

    # Create a specific job output folder
    job_output_path = output_path_root / f"{settings.shoot_name}_{job_id[:8]}"
    job_output_path.mkdir(exist_ok=True)

    try:
        # Map API JobSettings -> Core PhotoPackagerSettings
        quality_settings = []
        if settings.generate_optimized_jpg:
            quality_settings.append(QualitySettings(
                directory_name='optimized_jpg', file_format='jpg', quality_level=settings.quality_optimized
            ).model_dump())
        if settings.generate_optimized_webp:
             quality_settings.append(QualitySettings(
                directory_name='optimized_webp', file_format='webp', quality_level=settings.quality_optimized
            ).model_dump())
        if settings.generate_compressed_jpg:
             quality_settings.append(QualitySettings(
                directory_name='compressed_jpg', file_format='jpg', quality_level=settings.quality_compressed
            ).model_dump())
        if settings.generate_compressed_webp:
             quality_settings.append(QualitySettings(
                directory_name='compressed_webp', file_format='webp', quality_level=settings.quality_compressed
            ).model_dump())

        # Create dict for serialization to Celery
        core_settings_dict = {
            "quality_settings": quality_settings,
            "create_zip": settings.create_zip_packages,
            "exif_option": settings.exif_option,
            "include_raw_files": settings.include_raw_files,
            "rename_files": settings.rename_files,
            "base_name": settings.base_name,
            "zip_compression_level": settings.zip_compression_level,
            # Pass Watermark Config (Worker needs to handle this)
            "watermark_enabled": settings.watermark_enabled,
            "watermark_path": settings.watermark_path,
            "watermark_position": settings.watermark_position,
            "watermark_opacity": settings.watermark_opacity
        }

        # Spawn Celery Task
        # We pass input_path directly. The worker will scan it.
        # We pass job_output_path as the destination.
        task = process_photos_task.apply_async(
            args=[job_id, core_settings_dict, str(input_path), str(job_output_path)],
            task_id=job_id
        )

        return JobResponse(
            job_id=job_id,
            status="queued",
            message=f"Local Job queued! Scanning: {input_path}"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job submission failed: {str(e)}")


@app.get("/api/jobs/{job_id}/status")
async def get_job_status(job_id: str):
    task_result = AsyncResult(job_id, app=celery)
    
    response = {
        "job_id": job_id,
        "status": task_result.status.lower(), # PENDING, STARTED, RETRY, FAILURE, SUCCESS
        "result": None,
        "error": None
    }

    if task_result.state == 'PENDING':
        response["message"] = "Job is waiting in queue..."
    elif task_result.state == 'PROGRESS':
        response["status"] = "processing"
        response["message"] = task_result.info.get('message', 'Processing...')
        response["percent"] = task_result.info.get('percent', 0)
    elif task_result.state == 'SUCCESS':
        # The task return value is our result dict
        res = task_result.result
        response["status"] = res.get("status", "success")
        response["message"] = res.get("message", "Job completed.")
        response["result"] = res.get("result")
    elif task_result.state == 'FAILURE':
        response["status"] = "failure"
        response["error"] = str(task_result.result)

    return JSONResponse(content=response)


@app.get("/api/jobs/{job_id}/download/{zip_filename}")
async def download_zip(job_id: str, zip_filename: str):
    # Determine the real job ID if we stored it differently, but here we assume path matches
    # NOTE: In production, we might need to look up output_path from DB context if task ID != job ID
    # But for simplicity, we assume output_loc = OUTPUTS_DIR / job_id (where job_id passed to task was job_id)
    # Wait: create_packaging_job returned task.id. So checks need align. 
    # In create_packaging_job: job_id (uuid) != task.id. 
    # FIX: We should return the UUID job_id, or use UUID as task_id.
    # Updated CREATE to use task.id? No, let's fix the downloading logic to assume directory lookup or strict path.
    # Actually, simpler: Client knows the UUID generated in CREATE (wait, we returned task.id). 
    # Ideally, we pass task_id=job_id to apply_async.
    
    # Check if file exists in OUTPUTS_DIR (scanning subdirs or strict path)
    # We'll rely on the client passing the correct ID they got from /jobs response.
    
    # Security: strict filename check
    if ".." in zip_filename or "/" in zip_filename or "\\" in zip_filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    # In our worker, output_dir was set to OUTPUTS_DIR / job_id (UUID).
    # BUT we returned task.id to the client.
    # Without a DB, we can't map TaskID -> UUID easily unless we force them same.
    # Let's fix CREATE endpoint logic in next step or rely on client knowing.
    # For now, assume client requests /api/download/<UUID_FROM_RESULT>/filename.zip
    
    file_path = OUTPUTS_DIR / job_id / zip_filename
    if not file_path.is_file():
        # Fallback: maybe job_id provided is the Task ID, and we can't easily map it without Celery backend inspection?
        # Quick fix: In create_packaging_job, we should force task_id=job_id
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path, media_type='application/zip', filename=zip_filename)

# Mount static files (Frontend)
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
