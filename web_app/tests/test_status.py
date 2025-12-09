import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
import sys
from pathlib import Path

# Ensure repo root on path for package imports
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from web_app.main import app

@pytest.mark.asyncio
@patch('web_app.main.celery_app.AsyncResult')
async def test_job_status_success(mock_async_result):
    job_id = 'dummy-job-id'
    # Setup mock
    mock_result = mock_async_result.return_value
    mock_result.status = 'SUCCESS'
    mock_result.info = {'output_files': ['output.zip']}; mock_result.result = {}
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get(f"/api/jobs/{job_id}/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data['status'] == 'success'
    assert 'result' in data or 'message' in data

@pytest.mark.asyncio
@patch('web_app.main.celery_app.AsyncResult')
async def test_job_status_pending(mock_async_result):
    job_id = 'dummy-job-id'
    mock_result = mock_async_result.return_value
    mock_result.status = 'PENDING'
    mock_result.info = None; mock_result.result = {}
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get(f"/api/jobs/{job_id}/status")
    assert resp.status_code == 200
    assert resp.json()['status'] == 'pending'
