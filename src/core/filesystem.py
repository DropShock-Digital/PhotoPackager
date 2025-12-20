import logging
import os
import time
from pathlib import Path
from typing import Iterable, List

logger = logging.getLogger(__name__)


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tiff", ".tif"}
RAW_EXTS = {".cr2", ".cr3", ".nef", ".arw", ".dng", ".raf", ".orf", ".rw2", ".pef", ".srw"}


def iter_files(dir_path: Path) -> Iterable[Path]:
    for p in dir_path.rglob("*"):
        if p.is_file():
            yield p


def scan_directory(source_dir: Path, include_raw: bool = True) -> List[Path]:
    """Return list of processable image files in source_dir.

    If include_raw is False, RAW files are ignored.
    """
    files: List[Path] = []
    for f in iter_files(source_dir):
        ext = f.suffix.lower()
        if ext in IMAGE_EXTS:
            files.append(f)
        elif include_raw and ext in RAW_EXTS:
            files.append(f)
    logger.debug("Scanned %d files in %s", len(files), source_dir)
    return files


def cleanup_older_than(dir_path: Path, older_than_seconds: int) -> int:
    """Delete child dirs/files older than the given age. Returns deleted count."""
    now = time.time()
    deleted = 0
    if not dir_path.exists():
        return 0
    for p in dir_path.iterdir():
        try:
            mtime = p.stat().st_mtime
        except OSError:
            continue
        if now - mtime > older_than_seconds:
            try:
                if p.is_dir():
                    for sub in p.rglob("*"):
                        try:
                            sub.unlink() if sub.is_file() else None
                        except Exception:
                            pass
                    p.rmdir()
                else:
                    p.unlink()
                deleted += 1
            except Exception as e:
                logger.warning("Failed to delete %s: %s", p, e)
    return deleted
