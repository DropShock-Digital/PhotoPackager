import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from main import app
import uuid
import json

client = TestClient(app)

def test_create_job_valid():
    settings = {
        "output_format": "JPEG",
        "output_quality": 85,
        "resize_enabled": False,
        "max_width": 1920,
        "max_height": 1080,
        "strip_exif": True,
        "watermark_enabled": False,
        "watermark_text": "",
        "skip_export": False
    }
    
    files = [
        ("files", ("test1.jpg", b"fake image bytes", "image/jpeg"))
    ]
    
    response = client.post(
        "/api/jobs",
        data={"settings": json.dumps(settings)},
        files=files
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "queued"

def test_create_job_invalid_settings():
    files = [
        ("files", ("test1.jpg", b"fake image bytes", "image/jpeg"))
    ]
    
    response = client.post(
        "/api/jobs",
        data={"settings": "invalid json"},
        files=files
    )
    
    assert response.status_code == 400

def test_get_job_status():
    job_id = str(uuid.uuid4())
    response = client.get(f"/api/jobs/{job_id}/status")
    assert response.status_code == 200
    data = response.json()
    assert data["job_id"] == job_id
    assert "status" in data

def test_download_zip_invalid_uuid():
    response = client.get("/api/jobs/not-a-uuid/download/test.zip")
    assert response.status_code == 400
    assert "Invalid job identifier" in response.json()["detail"]

def test_download_zip_invalid_filename():
    job_id = str(uuid.uuid4())
    response = client.get(f"/api/jobs/{job_id}/download/not_a_zip.txt")
    assert response.status_code == 400
    assert "Invalid filename format" in response.json()["detail"]

def test_download_zip_not_found():
    job_id = str(uuid.uuid4())
    response = client.get(f"/api/jobs/{job_id}/download/test.zip")
    assert response.status_code == 404
