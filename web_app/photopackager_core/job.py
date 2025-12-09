from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import List, Optional
import json
import zipfile

from .models import PhotoPackagerSettings, QualitySettings
from .image_processing import process_images

@dataclass
class JobSummary:
    """A summary of the completed job."""

    start_time: datetime
    end_time: Optional[datetime] = None
    total_files_scanned: int = 0
    total_files_processed: int = 0
    total_files_failed: int = 0
    total_output_files: int = 0
    errors: List[str] = field(default_factory=list)
    output_location: Optional[str] = None
    zip_packages: List[str] = field(default_factory=list)

    def to_dict(self):
        """Convert the summary to a dictionary for serialization."""
        return {
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "total_files_scanned": self.total_files_scanned,
            "total_files_processed": self.total_files_processed,
            "total_files_failed": self.total_files_failed,
            "total_output_files": self.total_output_files,
            "errors": self.errors,
            "output_location": str(self.output_location) if self.output_location else None,
            "zip_packages": self.zip_packages,
        }

class PhotoPackagerJob:
    """Manages the entire photo packaging process for a given job."""

    def __init__(self, job_id: str, settings: PhotoPackagerSettings, source_path: Path, output_path: Path):
        self.job_id = job_id
        self.settings = settings
        self.source_path = source_path
        self.output_path = output_path
        self.summary = JobSummary(start_time=datetime.now(), output_location=str(output_path))

    def run(self) -> JobSummary:
        scanned, processed, failed = process_images(
            source_path=self.source_path,
            output_path=self.output_path,
            quality_settings=self.settings.quality_settings,
            exif_option=self.settings.exif_option,
            include_raw_files=self.settings.include_raw_files,
            rename_files=self.settings.rename_files,
            base_name=self.settings.base_name,
            progress_cb=getattr(self, "progress_cb", None),
        )

        self.summary.total_files_scanned = scanned
        self.summary.total_files_processed = processed
        self.summary.total_files_failed = failed

        # Count total output files (excluding zip)
        self.summary.total_output_files = sum(1 for p in self.output_path.rglob('*') if p.is_file() and p.suffix != '.zip')

        if self.settings.create_zip:
            zip_path = self.output_path / f"{self.job_id}.zip"
            with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=self.settings.zip_compression_level) as zipf:
                for file_path in self.output_path.rglob('*'):
                    if file_path.is_file() and file_path.suffix != '.zip':
                        zipf.write(file_path, file_path.relative_to(self.output_path))
            self.summary.zip_packages.append(zip_path.name)

        # Persist a JSON summary for debugging/recordkeeping
        try:
            (self.output_path / 'job_summary.json').write_text(json.dumps(self.summary.to_dict(), indent=2))
        except Exception:
            pass

        self.summary.end_time = datetime.now()
        return self.summary
