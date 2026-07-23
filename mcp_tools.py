import uuid
import shutil
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field

# Import shared components
from schemas import JobSettings, JobResponse
from worker import celery_app
from config import MCP_SOURCE_ROOTS, TEMP_UPLOADS_DIR


def _dump_job_settings(job_settings: JobSettings) -> dict:
    """Serialize settings for Celery across both Pydantic v1 and v2."""
    dumper = getattr(job_settings, "model_dump", None)
    if dumper is not None:
        return dumper()
    return job_settings.dict()


class MCPPackagePhotosInput(BaseModel):
    """Input schema for the package_photos MCP tool."""
    source_files: List[Path] = Field(..., description="A list of absolute paths to the source photos.")
    settings: JobSettings


async def package_photos(input: MCPPackagePhotosInput) -> JobResponse:
    """
    An MCP tool that packages photos based on a list of local file paths and settings.
    """
    job_id = str(uuid.uuid4())
    job_dir = TEMP_UPLOADS_DIR / job_id

    if not MCP_SOURCE_ROOTS:
        return JobResponse(
            job_id=job_id,
            status="failed",
            message="MCP source roots are not configured."
        )

    # 1. Create a unique directory for the job and copy files
    try:
        job_dir.mkdir(parents=True, exist_ok=True)
        for src_file in input.source_files:
            resolved_source = src_file.resolve()
            if not any(resolved_source.is_relative_to(root) for root in MCP_SOURCE_ROOTS):
                raise PermissionError(f"Source path is outside the configured MCP roots: {src_file}")
            if not resolved_source.is_file():
                raise FileNotFoundError(f"Source file not found: {src_file}")
            shutil.copy(resolved_source, job_dir / resolved_source.name)
    except Exception as e:
        # Cleanup if setup fails
        if job_dir.exists():
            shutil.rmtree(job_dir)
        return JobResponse(
            job_id=job_id,
            status="failed",
            message=f"Failed to prepare job environment: {e}"
        )

    # 2. Launch background task with Celery
    celery_app.send_task(
        "worker.run_packaging_job",
        args=[job_id, str(job_dir), _dump_job_settings(input.settings)],
        task_id=job_id
    )

    return JobResponse(
        job_id=job_id,
        status="queued",
        message=f"Job '{job_id}' has been queued. {len(input.source_files)} files received."
    )


def get_tools():
    """Returns a list of all MCP tools for the server to register."""
    # In the future, we could add more tools here.
    # The MCP server will automatically use the function name, docstring,
    # and type hints to generate the tool's definition.
    return [package_photos]
