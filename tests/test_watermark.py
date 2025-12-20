import pytest
from pathlib import Path
from PIL import Image, ImageDraw
import shutil
from src.core.image_processing import process_images
from src.core.models import QualitySettings

@pytest.fixture
def test_dirs():
    base = Path("tests/temp_watermark_test")
    input_dir = base / "input"
    output_dir = base / "output"
    
    # Cleanup
    if base.exists():
        shutil.rmtree(base)
    
    input_dir.mkdir(parents=True)
    output_dir.mkdir(parents=True)
    
    yield input_dir, output_dir
    
    # Teardown
    if base.exists():
        shutil.rmtree(base)

def create_red_image(path):
    img = Image.new('RGB', (1000, 1000), color=(255, 0, 0))
    img.save(path)
    return img

def create_watermark(path):
    # Solid White Square, 50% opacity in image data
    wm = Image.new('RGBA', (200, 200), (0,0,0,0))
    d = ImageDraw.Draw(wm)
    # Draw solid white rectangle in center
    d.rectangle([50,50,150,150], fill=(255, 255, 255, 255))
    wm.save(path)
    return wm

def test_watermark_center_opaque(test_dirs):
    input_dir, output_dir = test_dirs
    
    # Setup
    create_red_image(input_dir / "test.jpg")
    wm_path = input_dir / "wm.png"
    create_watermark(wm_path)
    
    settings = [
        QualitySettings(directory_name="out", file_format="jpg", quality_level=90)
    ]
    
    # Execute with Opacity 1.0
    process_images(
        source_path=input_dir,
        output_path=output_dir,
        quality_settings=settings,
        exif_option="keep",
        include_raw_files=False,
        rename_files=False,
        base_name="img",
        watermark_enabled=True,
        watermark_path=str(wm_path),
        watermark_position="center",
        watermark_opacity=1.0
    )
    
    # Verify
    result_file = output_dir / "out" / "test.jpg"
    assert result_file.exists()
    
    img = Image.open(result_file)
    center_pixel = img.getpixel((img.width // 2, img.height // 2))
    
    # Core should be White (255, 255, 255) because WM is solid white and opacity is 1.0
    # Allow for some JPEG compression artifacts
    assert center_pixel[0] > 240
    assert center_pixel[1] > 240
    assert center_pixel[2] > 240

def test_watermark_opacity_blending(test_dirs):
    input_dir, output_dir = test_dirs
    
    # Setup
    create_red_image(input_dir / "test.jpg")
    wm_path = input_dir / "wm.png"
    create_watermark(wm_path) # Solid white
    
    settings = [
        QualitySettings(directory_name="out", file_format="png", quality_level=90)
    ]
    
    # Execute with Opacity 0.5
    process_images(
        source_path=input_dir,
        output_path=output_dir,
        quality_settings=settings,
        exif_option="keep",
        include_raw_files=False,
        rename_files=False,
        base_name="img",
        watermark_enabled=True,
        watermark_path=str(wm_path),
        watermark_position="center",
        watermark_opacity=0.5
    )
    
    img = Image.open(output_dir / "out" / "test.png")
    center = img.getpixel((img.width // 2, img.height // 2))
    
    # Red (255, 0, 0) mixed with White (255, 255, 255) at 0.5
    # R: 255
    # G: ~127
    # B: ~127
    # Red might fluctuate due to blending/resampling, but should stay high
    # Green/Blue should rise significantly from 0 (proving white mix)
    assert center[0] > 200 
    assert center[1] > 100
    assert center[2] > 100

def test_watermark_missing_file_safe(test_dirs):
    """Ensure it doesn't crash if WM file is missing."""
    input_dir, output_dir = test_dirs
    create_red_image(input_dir / "test.jpg")
    
    process_images(
        source_path=input_dir,
        output_path=output_dir,
        quality_settings=[QualitySettings(directory_name="out", file_format="jpg", quality_level=90)],
        exif_option="keep",
        include_raw_files=False,
        rename_files=False,
        base_name="img",
        watermark_enabled=True,
        watermark_path=str(input_dir / "non_existent.png"),
        watermark_position="center",
        watermark_opacity=0.5
    )
    
    assert (output_dir / "out" / "test.jpg").exists()
