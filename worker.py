import os
from pathlib import Path

from celery import Celery

# Local imports from the core logic (root level)
from config import OUTPUTS_DIR
from job import PhotoPackagerJob, PhotoPackagerSettings
from schemas import JobSettings


def _broker_url() -> str:
    return (
        os.getenv("CELERY_BROKER_URL")
        or os.getenv("REDIS_URL")
        or "memory://"
    )


def _result_backend_url() -> str:
    return (
        os.getenv("CELERY_RESULT_BACKEND")
        or os.getenv("REDIS_URL")
        or "cache+memory://"
    )


celery_app = Celery(
    "tasks",
    broker=_broker_url(),
    backend=_result_backend_url(),
)
celery_app.conf.task_track_started = True
celery_app.conf.broker_connection_retry_on_startup = True


@celery_app.task(name="worker.run_packaging_job")
def run_packaging_job(job_id: str, source_dir: str, settings_dict: dict):
    """
    Celery task to run a photo packaging job in the background.

    Args:
        job_id: The unique identifier for this job.
        source_dir: The directory containing the source images for this job.
        settings_dict: A dictionary containing the job settings.

    Returns:
        A dictionary summary of the completed job.
    """
    try:
        source_path = Path(source_dir).resolve()
        output_path = OUTPUTS_DIR / job_id
        output_path.mkdir(parents=True, exist_ok=True)

        api_settings = JobSettings(**settings_dict)
        job_settings = PhotoPackagerSettings(
            source_folder=str(source_path),
            output_folder=str(output_path),
            generate_jpg=True,
            generate_webp=True,
            generate_compressed_jpg=api_settings.generate_compressed_jpg,
            generate_compressed_webp=api_settings.generate_compressed_webp,
            create_zip=api_settings.create_zip_packages,
            exif_policy=api_settings.exif_option if hasattr(api_settings, "exif_option") else "keep",
            workers=api_settings.max_workers,
            include_raw=api_settings.process_raw_files,
            delivery_company_name=api_settings.company_name,
            delivery_website=api_settings.website_url,
            delivery_support_email=api_settings.support_email,
            shoot_name=getattr(api_settings, "shoot_base_name", None) or job_id,
        )

        job_instance = PhotoPackagerJob(settings=job_settings)
        summary = job_instance.run()

        return {
            "start_time": summary.start_time,
            "end_time": summary.end_time,
            "processed": summary.processed_files_count,
            "generated": summary.generated_files_count,
            "failed": summary.error_files_count,
            "errors": [err for _, err in summary.error_details],
        }
    except Exception as e:
        import traceback

        error_msg = f"Job {job_id} failed with error: {e}\\n{traceback.format_exc()}"
        print(error_msg)
        raise Exception(error_msg)
