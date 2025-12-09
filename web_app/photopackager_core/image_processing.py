import logging
from typing import Callable, List, Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

try:
    from PIL import Image, UnidentifiedImageError
    Image.MAX_IMAGE_PIXELS = None
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

try:
    import piexif  # optional
    PIEXIF_AVAILABLE = True
except ImportError:
    PIEXIF_AVAILABLE = False

from .filesystem import IMAGE_EXTS, RAW_EXTS, scan_directory
from .models import QualitySettings


def _resize_long_edge(img: Image.Image, target: int) -> Image.Image:
    w, h = img.size
    if max(w, h) <= target:
        return img
    if w >= h:
        new_w = target
        new_h = int(h * target / w)
    else:
        new_h = target
        new_w = int(w * target / h)
    return img.resize((new_w, new_h), Image.LANCZOS)


def _derive_target_size(dir_name: str) -> int:
    name = dir_name.lower()
    if "optimized" in name:
        return 4096
    if "compressed" in name:
        return 2048
    return 4096


def _should_strip_exif(exif_option: str) -> bool:
    if exif_option == "keep":
        return False
    # any other option, strip all (partial not implemented)
    return True


def process_images(
    source_path: Path,
    output_path: Path,
    quality_settings: List[QualitySettings],
    exif_option: str,
    include_raw_files: bool,
    rename_files: bool,
    base_name: str,
    progress_cb: Optional[Callable[[int, int], None]] = None,
) -> Tuple[int, int, int]:
    """Process images from source_path into output_path according to quality_settings.

    Returns (total_scanned, total_processed, total_failed)
    """
    if not PILLOW_AVAILABLE:
        raise RuntimeError("Pillow not installed")

    output_path.mkdir(parents=True, exist_ok=True)
    # prepare variant dirs
    for qs in quality_settings:
        (output_path / qs.directory_name).mkdir(parents=True, exist_ok=True)
    if include_raw_files:
        (output_path / "originals").mkdir(parents=True, exist_ok=True)

    # determine file list to process
    file_list = [p for p in scan_directory(source_path, include_raw=include_raw_files)]

    # build rename map
    rename_index = 1
    total_scanned = len(file_list)
    total_processed = 0
    total_failed = 0

    for idx, src in enumerate(file_list, start=1):
        ext = src.suffix.lower()

        # Raw handling: copy only if requested
        if ext in RAW_EXTS:
            if include_raw_files:
                try:
                    target_name = f"{base_name}_{rename_index:04d}{ext}" if rename_files else src.name
                    (output_path / "originals" / target_name).write_bytes(src.read_bytes())
                    total_processed += 1
                    rename_index += 1
                except Exception:
                    total_failed += 1
            continue

        # Open image
        try:
            with Image.open(src) as im:
                im.load()
                icc = im.info.get("icc_profile")
                exif_bytes = im.info.get("exif")
                strip = _should_strip_exif(exif_option)

                for qs in quality_settings:
                    dest_dir = output_path / qs.directory_name
                    target_ext = ".jpg" if qs.file_format.lower() == "jpg" else ".webp"
                    fname = f"{base_name}_{rename_index:04d}{target_ext}" if rename_files else src.stem + target_ext
                    out_path = dest_dir / fname

                    try:
                        # resize per variant
                        target_size = _derive_target_size(qs.directory_name)
                        img_resized = _resize_long_edge(im, target_size)

                        if target_ext == ".jpg":
                            params = {
                                "format": "JPEG",
                                "quality": int(qs.quality_level),
                                "optimize": True,
                                "progressive": True,
                            }
                        else:
                            params = {
                                "format": "WEBP",
                                "quality": int(qs.quality_level),
                                "method": 6,
                            }

                        if not strip and exif_bytes:
                            params["exif"] = exif_bytes
                        if icc:
                            params["icc_profile"] = icc

                        img_resized.save(out_path, **params)
                        total_processed += 1
                    except Exception:
                        total_failed += 1

                rename_index += 1
        except (UnidentifiedImageError, OSError):
            total_failed += 1
        finally:
            if progress_cb:
                try:
                    progress_cb(idx, total_scanned)
                except Exception:
                    pass

    return total_scanned, total_processed, total_failed
