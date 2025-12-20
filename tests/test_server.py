from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.server.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "PhotoPackager API"}

@patch("src.server.main.process_photos_task.apply_async")
@patch("pathlib.Path.exists")
@patch("pathlib.Path.is_dir")
@patch("pathlib.Path.mkdir")
def test_create_job_endpoint(mock_mkdir, mock_is_dir, mock_exists, mock_celery_task):
    # Setup mocks
    mock_exists.return_value = True
    mock_is_dir.return_value = True
    
    # Mock task return
    mock_task_result = MagicMock()
    mock_task_result.id = "mock-task-id"
    mock_celery_task.return_value = mock_task_result

    # Payload matching schemas.JobSettings
    payload = {
        "shoot_name": "Test Shoot",
        "base_name": "Photo",
        "input_path": "/tmp/test_in",
        "output_path": "/tmp/test_out",
        "quality_optimized": 95,
        "quality_compressed": 80,
        "generate_optimized_jpg": True,
        "generate_optimized_webp": True,
        "generate_compressed_jpg": True,
        "generate_compressed_webp": False,
        "watermark_enabled": True,
        "watermark_path": "/assets/logo.png",
        "watermark_position": "bottom_right",
        "watermark_opacity": 0.5,
        "exif_option": "keep",
        "include_raw_files": False,
        "rename_files": True,
        "create_zip_packages": True,
        "zip_compression_level": 6,
        "delivery_company_name": "",
        "delivery_website": "",
        "delivery_support_email": ""
    }

    response = client.post(
        "/api/jobs",
        json=payload
    )
    
    # Debug if failed
    if response.status_code != 200:
        print(response.json())

    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "queued"

    # Verify Celery was called
    mock_celery_task.assert_called_once()
    call_args = mock_celery_task.call_args
    # call_args is (args, kwargs)
    # properly access kwargs['args'] which contains the list of task arguments
    task_args = call_args.kwargs.get('args')
    if not task_args:
         # Fallback if called positionally (unlikely given main.py)
         task_args = call_args.args[0] if call_args.args else []

    assert len(task_args) >= 4
    # Check input path (3rd arg)
    assert task_args[2] == "\\tmp\\test_in" or task_args[2] == "/tmp/test_in"

def test_missing_input_path():
    payload = {
        "shoot_name": "Test",
        "base_name": "Photo",
        # missing input_path
        "output_path": "/tmp/out",
        "quality_optimized": 90,
        "quality_compressed": 80,
        "generate_optimized_jpg": True,
        "generate_optimized_webp": True,
        "generate_compressed_jpg": True,
        "generate_compressed_webp": True,
        "watermark_enabled": False,
        "watermark_path": "",
        "watermark_position": "center",
        "watermark_opacity": 0.5,
        "exif_option": "keep",
        "include_raw_files": False,
        "rename_files": True,
        "create_zip_packages": True,
        "zip_compression_level": 6,
        "delivery_company_name": "",
        "delivery_website": "",
        "delivery_support_email": ""
    }
    response = client.post("/api/jobs", json=payload)
    assert response.status_code == 422 # Pydantic validation error
