from unittest.mock import MagicMock, patch, ANY
from PIL import Image
from src.core.image_processing import _resize_long_edge, _derive_target_size, _should_strip_exif

def test_derive_target_size():
    assert _derive_target_size("optimized_images") == 4096
    assert _derive_target_size("Optimized") == 4096
    assert _derive_target_size("compressed_images") == 2048
    assert _derive_target_size("Compressed") == 2048
    assert _derive_target_size("other") == 4096

def test_should_strip_exif():
    assert _should_strip_exif("keep") is False
    assert _should_strip_exif("strip") is True
    assert _should_strip_exif("anything_else") is True

@patch("src.core.image_processing.Image")
def test_resize_long_edge_no_op(mock_img_class):
    mock_img = MagicMock(spec=Image.Image)
    mock_img.size = (1000, 800)
    result = _resize_long_edge(mock_img, 4096)
    assert result == mock_img
    mock_img.resize.assert_not_called()

@patch("src.core.image_processing.Image")
def test_resize_long_edge_horizontal(mock_img_class):
    mock_img = MagicMock(spec=Image.Image)
    mock_img.size = (8000, 4000)
    expected_size = (4096, 2048)
    
    _resize_long_edge(mock_img, 4096)
    
    # Use ANY for the filter argument to avoid Mock identity issues
    mock_img.resize.assert_called_with(expected_size, ANY)

@patch("src.core.image_processing.Image")
def test_resize_long_edge_vertical(mock_img_class):
    mock_img = MagicMock(spec=Image.Image)
    mock_img.size = (4000, 8000)
    expected_size = (2048, 4096)
    
    _resize_long_edge(mock_img, 4096)
    
    mock_img.resize.assert_called_with(expected_size, ANY)
