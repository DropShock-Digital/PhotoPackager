from pydantic import BaseModel, Field
from typing import Optional


class JobSettings(BaseModel):
    """Pydantic model for the settings of a packaging job."""
    process_original_files: bool = True
    process_raw_files: bool = False
    generate_optimized_jpg: bool = True
    generate_compressed_jpg: bool = True
    generate_optimized_webp: bool = False
    generate_compressed_webp: bool = False
    quality_presets: str = "high"
    exif_option: str = "keep"
    create_zip_archives: bool = True
    create_zip_packages: bool = True
    max_workers: int = 10
    company_name: str = ""
    website_url: str = ""
    support_email: str = ""
    shoot_base_name: Optional[str] = ""

    # Internal mappings
    quality_optimized: int = Field(95, ge=1, le=100)
    quality_compressed: int = Field(80, ge=1, le=100)


class JobResponse(BaseModel):
    """Response model after a job is submitted."""
    job_id: str
    status: str
    message: str
