#!/usr/bin/env python3
"""
Standalone PhotoPackager Web Server
Runs without Redis/Celery for quick deployment - processes jobs synchronously
"""

import uuid
import shutil
import json
from pathlib import Path
from typing import List
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Import core components
from web_app.schemas import JobSettings, JobResponse
from web_app.photopackager_core.job import PhotoPackagerJob
from web_app.photopackager_core.models import PhotoPackagerSettings, QualitySettings
from web_app.photopackager_core.config import OUTPUTS_DIR, TEMP_UPLOADS_DIR

app = FastAPI(title="PhotoPackager Standalone")

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

# Allowed types and limits (mirror main app)
ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tiff", ".tif",
    ".cr2", ".cr3", ".nef", ".arw", ".dng", ".raf", ".orf", ".rw2", ".pef", ".srw"
}
MAX_UPLOAD_SIZE = 500 * 1024 * 1024

# Store job statuses in memory (for this standalone version)
job_statuses = {}

# Define API routes FIRST (before static file mounting)
@app.post("/api/jobs", response_model=JobResponse)
async def create_packaging_job(
    files: List[UploadFile] = File(...),
    settings: str = Form(...),
):
    """Accepts photo uploads and job settings to start a packaging job."""
    try:
        job_settings = JobSettings.model_validate_json(settings)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid settings format: {e}")

    job_id = str(uuid.uuid4())
    job_dir = TEMP_UPLOADS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    # Update status to started
    job_statuses[job_id] = {
        "status": "started",
        "message": f"Processing {len(files)} files...",
        "result": None,
        "error": None
    }

    try:
        # Save uploaded files
        for file in files:
            filename = Path(file.filename).name
            if Path(filename).suffix.lower() not in ALLOWED_EXTENSIONS:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {filename}")
            file_path = job_dir / filename
            bytes_written = 0
            with open(file_path, "wb") as buffer:
                while True:
                    chunk = file.file.read(1024 * 1024)
                    if not chunk:
                        break
                    buffer.write(chunk)
                    bytes_written += len(chunk)
                    if bytes_written > MAX_UPLOAD_SIZE:
                        raise HTTPException(status_code=413, detail=f"File too large: {filename}")

        # Process synchronously (no Celery)
        output_path = OUTPUTS_DIR / job_id
        output_path.mkdir(parents=True, exist_ok=True)

        # Map API settings to core logic settings
        quality_settings = []
        if job_settings.generate_optimized_jpg:
            quality_settings.append(QualitySettings(
                directory_name='optimized_jpg',
                file_format='jpg',
                quality_level=job_settings.quality_optimized
            ))
        if job_settings.generate_optimized_webp:
            quality_settings.append(QualitySettings(
                directory_name='optimized_webp',
                file_format='webp',
                quality_level=job_settings.quality_optimized
            ))
        if job_settings.generate_compressed_jpg:
            quality_settings.append(QualitySettings(
                directory_name='compressed_jpg',
                file_format='jpg',
                quality_level=job_settings.quality_compressed
            ))
        if job_settings.generate_compressed_webp:
            quality_settings.append(QualitySettings(
                directory_name='compressed_webp',
                file_format='webp',
                quality_level=job_settings.quality_compressed
            ))

        settings_obj = PhotoPackagerSettings(
            quality_settings=quality_settings,
            create_zip=job_settings.create_zip_packages,
            exif_option=job_settings.exif_option,
            include_raw_files=job_settings.include_raw_files,
            rename_files=job_settings.rename_files,
            base_name=job_settings.base_name,
            zip_compression_level=job_settings.zip_compression_level,
        )

        # Run the packaging job
        job = PhotoPackagerJob(
            job_id=job_id,
            settings=settings_obj,
            source_path=job_dir,
            output_path=output_path
        )
        summary = job.run()

        # Update status to success
        job_statuses[job_id] = {
            "status": "success",
            "message": "Job completed successfully!",
            "result": summary.to_dict(),
            "error": None
        }

        return JobResponse(
            job_id=job_id,
            status="success",
            message=f"Job completed! Processed {len(files)} files."
        )

    except Exception as e:
        # Update status to failed
        job_statuses[job_id] = {
            "status": "failure",
            "message": "Job failed",
            "result": None,
            "error": str(e)
        }
        raise HTTPException(status_code=500, detail=f"Job failed: {str(e)}")


@app.get("/api/jobs/{job_id}/status")
async def get_job_status_api(job_id: str):
    """Endpoint to poll for the status of a job."""
    if job_id not in job_statuses:
        return JSONResponse(content={
            "job_id": job_id,
            "status": "pending",
            "message": "Job not found or pending",
            "result": None,
            "error": None
        })

    return JSONResponse(content={
        "job_id": job_id,
        **job_statuses[job_id]
    })


@app.get("/api/jobs/{job_id}/download/{zip_filename}")
async def download_zip_package(job_id: str, zip_filename: str):
    """Allows downloading of a packaged ZIP file."""
    # Basic security check
    if ".." in zip_filename or zip_filename.startswith("/"):
        raise HTTPException(status_code=400, detail="Invalid filename.")

    file_path = OUTPUTS_DIR / job_id / zip_filename

    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found.")

    return FileResponse(
        file_path,
        media_type='application/zip',
        filename=zip_filename
    )


# Mount static files LAST to serve frontend (catches all non-API routes)
STATIC_DIR = Path(__file__).parent / "static"
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("PhotoPackager Standalone Server")
    print("=" * 60)
    print("Starting server at: http://localhost:8000")
    print("Press CTRL+C to stop")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
