import os
from celery import Celery
from src.core.config import REDIS_URL
from src.core.job import PhotoPackagerJob
from src.core.models import PhotoPackagerSettings
from src.core.schemas import JobSettings
from pathlib import Path
import json

# Initialize Celery
celery = Celery(
    "photopackager_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery.task(bind=True)
def process_photos_task(self, job_id: str, job_settings_dict: dict, temp_dir_str: str, output_dir_str: str):
    """
    Celery task to run the PhotoPackagerJob in a background worker.
    """
    try:
        # Reconstruct objects from serialized dicts/strings
        settings_obj = PhotoPackagerSettings(**job_settings_dict)  # Assuming Pydantic model can init from dict (it can)
        source_path = Path(temp_dir_str)
        output_path = Path(output_dir_str)

        # Update state: Processing
        self.update_state(state='PROGRESS', meta={'message': 'Processing started...'})

        # Define a progress callback to update Celery state
        def progress_callback(current, total):
            if total > 0:
                percent = int((current / total) * 100)
                self.update_state(state='PROGRESS', meta={
                    'current': current,
                    'total': total,
                    'percent': percent,
                    'message': f"Processed {current}/{total} images"
                })

        # Run the Job
        job = PhotoPackagerJob(
            job_id=job_id,
            settings=settings_obj,
            source_path=source_path,
            output_path=output_path
        )
        # Inject callback purely for this run instance
        job.progress_cb = progress_callback
        
        summary = job.run()

        return {
            "status": "success",
            "message": "Job completed successfully!",
            "result": summary.to_dict()
        }

    except Exception as e:
        return {
            "status": "failure",
            "message": str(e),
            "error": str(e)
        }
