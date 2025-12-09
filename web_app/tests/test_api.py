import pytest
from httpx import AsyncClient, ASGITransport
import os
import json
from unittest.mock import patch
import sys
from pathlib import Path

# Ensure repo root on path for package imports
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

# Testing environment flag
os.environ['TESTING'] = 'True'

from web_app.main import app

@pytest.mark.asyncio
async def test_read_root():
    """Test that the root endpoint successfully returns the static index.html file."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers['content-type']
    assert "PhotoPackager" in response.text

@pytest.mark.asyncio
@patch('web_app.main.celery_app.send_task')
async def test_submit_job_success(mock_send_task):
    """Test successful job submission via the /api/jobs endpoint, mocking the Celery call."""
    # 1. Define test data
    dummy_file_content = b"this is a test image"
    dummy_file_name = "test_image.jpg"
    settings_data = {
        "shoot_name": "Test Shoot",
        "base_name": "test_job",
        "generate_optimized_jpg": True
    }
    settings_json = json.dumps(settings_data)

    # 2. Make the API request
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        files = {'files': (dummy_file_name, dummy_file_content, 'image/jpeg')}
        data = {'settings': settings_json}
        response = await ac.post("/api/jobs", files=files, data=data)

    # 3. Assert the HTTP response is correct
    assert response.status_code == 200
    response_json = response.json()
    assert "job_id" in response_json
    assert "queued" in response_json["message"].lower()

    # 4. Assert that the Celery task was called correctly
    mock_send_task.assert_called_once()
    call_args, call_kwargs = mock_send_task.call_args
    
    # Check the task name that was called
    assert call_args[0] == "photopackager.web_app.worker.run_packaging_job"
    
    # Check kwargs passed to the task
    assert 'args' in call_kwargs
    args_list = call_kwargs['args']
    assert args_list[0] == response_json["job_id"]  # job_id
    assert isinstance(args_list[1], str)            # job_dir path
    assert args_list[2]['shoot_name'] == settings_data['shoot_name']
    assert args_list[2]['base_name'] == settings_data['base_name']
    assert args_list[2]['generate_optimized_jpg'] is True

    # Check the task_id keyword argument
    assert call_kwargs['task_id'] == response_json["job_id"]

@pytest.mark.asyncio
async def test_submit_job_no_files():
    """Submitting without files should yield 422 validation error."""
    settings_json = json.dumps({"shoot_name": "Test Shoot", "base_name": "test_job"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        data = {'settings': settings_json}
        response = await ac.post("/api/jobs", data=data)

    assert response.status_code == 422
