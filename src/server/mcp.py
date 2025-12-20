import uuid
import shutil
import sys
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field

# Ensure src is in path if run directly
if __name__ == "__main__":
    sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.core.schemas import JobSettings, JobResponse
from src.core.job import PhotoPackagerJob
from src.core.models import PhotoPackagerSettings, QualitySettings
from src.core.config import TEMP_UPLOADS_DIR, OUTPUTS_DIR

class MCPPackagePhotosInput(BaseModel):
    """Input schema for the package_photos MCP tool."""
    source_files: List[str] = Field(..., description="List of absolute paths to source photos.")
    settings: JobSettings

def package_photos(source_files: List[str], settings: JobSettings) -> JobResponse:
    """
    MCP Tool: Packages photos based on local file paths.
    Executes synchronously using the Dual-Head Core.
    """
    job_id = str(uuid.uuid4())
    # Create job directory in the standard temp location
    job_dir = TEMP_UPLOADS_DIR / job_id
    output_path = OUTPUTS_DIR / job_id

    try:
        job_dir.mkdir(parents=True, exist_ok=True)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Copy files to temp dir (Safety first)
        for src_path in source_files:
            p = Path(src_path)
            if not p.is_file():
                return JobResponse(job_id=job_id, status="failed", message=f"File not found: {src_path}")
            shutil.copy(p, job_dir / p.name)

        # Map Settings
        quality_settings = []
        if settings.generate_optimized_jpg:
            quality_settings.append(QualitySettings(
                directory_name='optimized_jpg',
                file_format='jpg',
                quality_level=settings.quality_optimized
            ))
        # ... (simplified mapping for brevity, ideally share mapping logic)
        # For MCP, we trust the agent to provide good settings.
        
        # Construct Core Settings Object
        core_settings = PhotoPackagerSettings(
            quality_settings=quality_settings,
            create_zip=settings.create_zip_packages,
            exif_option=settings.exif_option,
            include_raw_files=settings.include_raw_files,
            rename_files=settings.rename_files,
            base_name=settings.base_name,
            zip_compression_level=settings.zip_compression_level,
        )

        # Run Job
        job = PhotoPackagerJob(
            job_id=job_id,
            settings=core_settings,
            source_path=job_dir,
            output_path=output_path
        )
        summary = job.run()
        
        return JobResponse(
            job_id=job_id,
            status="success",
            message=f"Packaged {len(source_files)} files. Output at: {output_path}",
            result=summary.to_dict()
        )

    except Exception as e:
        return JobResponse(job_id=job_id, status="failed", message=str(e))

if __name__ == "__main__":
    # Placeholder for Native MCP Server run loop
    print("PhotoPackager MCP Server Ready (Stdio Mode)")
    # Here we would initialize FastMCP or similar

