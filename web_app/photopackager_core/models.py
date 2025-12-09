from pydantic import BaseModel, Field
from typing import List

class QualitySettings(BaseModel):
    """Settings for a specific output quality."""
    directory_name: str
    file_format: str
    quality_level: int

class PhotoPackagerSettings(BaseModel):
    """Internal settings model for a packaging job."""
    quality_settings: List[QualitySettings]
    create_zip: bool = True
    exif_option: str = "keep"  # 'keep' or 'strip_all' (partial options fallback to strip)
    include_raw_files: bool = False
    rename_files: bool = True
    base_name: str = "photo"
    zip_compression_level: int = Field(6, ge=0, le=9)
