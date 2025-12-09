import pytest
from httpx import AsyncClient, ASGITransport
from pathlib import Path
import sys
from pathlib import Path as _P

# Ensure repo root on path
REPO_ROOT = _P(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from web_app.main import app
from web_app.photopackager_core.config import OUTPUTS_DIR


@pytest.mark.asyncio
async def test_download_file_success(tmp_path: Path):
    job_id = 'dummy-job-id'
    job_dir = OUTPUTS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    zip_path = job_dir / 'output.zip'
    zip_path.write_bytes(b'dummy')

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get(f"/api/jobs/{job_id}/download/{zip_path.name}")
    assert resp.status_code == 200
    assert resp.headers["content-disposition"].startswith("attachment;")


@pytest.mark.asyncio
async def test_download_file_not_found():
    job_id = 'dummy-job-id-2'
    filename = 'notfound.zip'
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get(f"/api/jobs/{job_id}/download/{filename}")
    assert resp.status_code == 404
