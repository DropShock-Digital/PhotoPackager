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


def _apply_watermark(base_img: Image.Image, watermark_path: str, position: str, opacity: float) -> Image.Image:
    """Applies a watermark to the base image."""
    if not watermark_path or not Path(watermark_path).exists():
        logger.warning(f"Watermark file not found: {watermark_path}")
        return base_img

    try:
        wm = Image.open(watermark_path).convert("RGBA")
        
        # Calculate Watermark Scale (e.g., 20% of base image distinct dimension)
        # For 'tile', we don't scale relative to whole, but maybe a fixed size? 
        # Let's stick to standard behavior: 
        # 1. Resize watermark to be reasonable (e.g. 15% of shortest edge of base)
        target_wm_size = int(min(base_img.size) * 0.20)
        wm_ratio = wm.width / wm.height if wm.height else 1
        new_wm_h = target_wm_size
        new_wm_w = int(target_wm_size * wm_ratio)
        wm = wm.resize((new_wm_w, new_wm_h), Image.LANCZOS)

        # Apply Opacity
        # Create a new alpha channel with opacity applied
        alpha = wm.split()[3]
        alpha = alpha.point(lambda p: p * opacity)
        wm.putalpha(alpha)

        # Create transparent canvas size of base image
        canvas = Image.new('RGBA', base_img.size, (0,0,0,0))
        
        if position == 'tile':
            # Tile across the image
            spacing_x = int(wm.width * 1.5)
            spacing_y = int(wm.height * 1.5)
            for y in range(0, base_img.height, spacing_y):
                for x in range(0, base_img.width, spacing_x):
                    # Offset every other row
                    x_pos = x + (int(wm.width/2) if (y // spacing_y) % 2 == 1 else 0)
                canvas.paste(wm, (x_pos, y))
        else:
            # Single placement
            margin = int(min(base_img.size) * 0.05)
            x, y = 0, 0
            if 'bottom' in position:
                y = base_img.height - wm.height - margin
            elif 'top' in position:
                y = margin
            else: # center y
                y = (base_img.height - wm.height) // 2

            if 'right' in position:
                x = base_img.width - wm.width - margin
            elif 'left' in position:
                x = margin
            else: # center x
                x = (base_img.width - wm.width) // 2
            
            # Corrections for center-center
            if position == 'center':
                x = (base_img.width - wm.width) // 2
                y = (base_img.height - wm.height) // 2
                
            canvas.paste(wm, (x, y))

        return Image.alpha_composite(base_img.convert("RGBA"), canvas).convert("RGB")
        
    except Exception as e:
        logger.error(f"Failed to apply watermark: {e}")
        return base_img



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
    # Watermark Args
    watermark_enabled: bool = False,
    watermark_path: str = "",
    watermark_position: str = "bottom_right",
    watermark_opacity: float = 0.5,
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
                    fmt = qs.file_format.lower()
                    if fmt in ["jpg", "jpeg"]:
                        target_ext = ".jpg"
                    elif fmt == "png":
                        target_ext = ".png"
                    else:
                        target_ext = ".webp"
                        
                    fname = f"{base_name}_{rename_index:04d}{target_ext}" if rename_files else src.stem + target_ext
                    out_path = dest_dir / fname

                    try:
                        # resize per variant
                        target_size = _derive_target_size(qs.directory_name)
                        img_resized = _resize_long_edge(im, target_size)

                        # Apply Watermark if enabled (and not original raw logic which handled above)
                        # Note: We apply watermark AFTER resize so it looks crisp on appropriate scale
                        if watermark_enabled:
                            img_resized = _apply_watermark(
                                img_resized, 
                                watermark_path, 
                                watermark_position, 
                                watermark_opacity
                            )

                        if target_ext == ".jpg":
                            params = {
                                "format": "JPEG",
                                "quality": int(qs.quality_level),
                                "optimize": True,
                                "progressive": True,
                            }
                        elif target_ext == ".png":
                             params = {
                                "format": "PNG",
                                "optimize": True,
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
