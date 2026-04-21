from __future__ import annotations

import uuid
from pathlib import Path

import pytest


PROJECT_ROOT = Path(__file__).resolve().parent


class _TempPathFactory:
    """Simple temp-path factory that avoids the Windows temp ACL issue here."""

    def __init__(self, base: Path):
        self._base = base

    def mktemp(self, name: str, numbered: bool = True) -> Path:
        suffix = f"-{uuid.uuid4().hex[:8]}" if numbered else ""
        path = self._base / f"{name}{suffix}"
        path.mkdir(parents=True, exist_ok=True)
        return path

    def getbasetemp(self) -> Path:
        return self._base


@pytest.fixture
def tmp_path_factory() -> _TempPathFactory:
    base = PROJECT_ROOT / ".codex-test-tmp"
    base.mkdir(parents=True, exist_ok=True)
    return _TempPathFactory(base)


@pytest.fixture
def tmp_path(tmp_path_factory: _TempPathFactory) -> Path:
    return tmp_path_factory.mktemp("tmp")
