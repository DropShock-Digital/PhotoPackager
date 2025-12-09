#!/usr/bin/env python3
"""
Comprehensive API test script for PhotoPackager
Tests all endpoints: upload, status polling, download
"""

import requests
import json
import time
from pathlib import Path
from PIL import Image
import io

# Configuration
API_BASE = "http://localhost:8000/api"
TEST_DIR = Path(__file__).parent / "test_images"
TEST_DIR.mkdir(exist_ok=True)

def create_test_images():
    """Create test images for upload"""
    print("Creating test images...")
    test_images = []

    for i in range(3):
        # Create a simple test image
        img = Image.new('RGB', (800, 600), color=(255, 100 * i, 100 * (2 - i)))

        # Add some content to make it realistic
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        draw.rectangle([100, 100, 700, 500], outline=(255, 255, 255), width=5)
        draw.text((400, 300), f"Test Image {i+1}", fill=(255, 255, 255))

        # Save to test directory
        img_path = TEST_DIR / f"test_image_{i+1}.jpg"
        img.save(img_path, 'JPEG', quality=95)
        test_images.append(img_path)
        print(f"  Created: {img_path.name}")

    return test_images

def test_upload(test_images):
    """Test file upload and job creation"""
    print("\n=== Testing File Upload ===")

    # Prepare files
    files = []
    for img_path in test_images:
        files.append(('files', (img_path.name, open(img_path, 'rb'), 'image/jpeg')))

    # Prepare settings
    settings = {
        'shoot_name': 'API_Test_Job',
        'base_name': 'test_photo',
        'generate_optimized_jpg': True,
        'generate_optimized_webp': True,
        'generate_compressed_jpg': True,
        'generate_compressed_webp': True,
        'include_raw_files': False,
        'create_zip_packages': True,
        'exif_option': 'keep',
        'quality_optimized': 95,
        'quality_compressed': 80
    }

    # Send request
    print(f"Uploading {len(test_images)} files to {API_BASE}/jobs")
    data = {'settings': json.dumps(settings)}

    try:
        response = requests.post(f"{API_BASE}/jobs", files=files, data=data, timeout=120)

        # Close file handles
        for _, file_tuple in files:
            file_tuple[1].close()

        if response.status_code == 200:
            result = response.json()
            print(f"✓ Upload successful!")
            print(f"  Job ID: {result['job_id']}")
            print(f"  Status: {result['status']}")
            print(f"  Message: {result['message']}")
            return result['job_id']
        else:
            print(f"✗ Upload failed with status {response.status_code}")
            print(f"  Error: {response.text}")
            return None

    except Exception as e:
        print(f"✗ Upload error: {str(e)}")
        # Close file handles on error
        for _, file_tuple in files:
            try:
                file_tuple[1].close()
            except:
                pass
        return None

def test_status_polling(job_id, max_wait=60):
    """Test status endpoint with polling"""
    print("\n=== Testing Status Polling ===")

    if not job_id:
        print("✗ No job ID provided, skipping status test")
        return None

    print(f"Polling status for job: {job_id}")
    start_time = time.time()

    while time.time() - start_time < max_wait:
        try:
            response = requests.get(f"{API_BASE}/jobs/{job_id}/status")

            if response.status_code == 200:
                status_data = response.json()
                status = status_data.get('status')
                message = status_data.get('message', '')

                print(f"  Status: {status} - {message}")

                if status == 'success':
                    print(f"✓ Job completed successfully!")
                    result = status_data.get('result')
                    if result:
                        print(f"  Files processed: {result.get('total_files', 'N/A')}")
                        print(f"  Output formats: {len(result.get('quality_outputs', []))}")
                        print(f"  ZIP packages: {len(result.get('zip_packages', []))}")
                    return status_data

                elif status == 'failure':
                    print(f"✗ Job failed: {status_data.get('error', 'Unknown error')}")
                    return status_data

                # Still processing, wait and retry
                time.sleep(2)
            else:
                print(f"✗ Status request failed with status {response.status_code}")
                return None

        except Exception as e:
            print(f"✗ Status polling error: {str(e)}")
            return None

    print(f"✗ Timeout: Job did not complete within {max_wait} seconds")
    return None

def test_download(job_id, status_data):
    """Test ZIP download endpoint"""
    print("\n=== Testing File Download ===")

    if not job_id or not status_data:
        print("✗ No job data provided, skipping download test")
        return False

    result = status_data.get('result')
    if not result:
        print("✗ No result data available")
        return False

    zip_packages = result.get('zip_packages', [])
    if not zip_packages:
        print("✗ No ZIP packages available for download")
        return False

    print(f"Found {len(zip_packages)} ZIP packages")

    # Test downloading the first ZIP
    zip_filename = zip_packages[0]
    download_url = f"{API_BASE}/jobs/{job_id}/download/{zip_filename}"

    print(f"Testing download: {zip_filename}")
    print(f"  URL: {download_url}")

    try:
        response = requests.get(download_url, stream=True)

        if response.status_code == 200:
            # Get file size from headers
            content_length = response.headers.get('content-length')
            if content_length:
                size_mb = int(content_length) / (1024 * 1024)
                print(f"✓ Download successful! Size: {size_mb:.2f} MB")
            else:
                print(f"✓ Download successful!")

            # Optionally save to test directory
            output_path = TEST_DIR / zip_filename
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"  Saved to: {output_path}")

            return True
        else:
            print(f"✗ Download failed with status {response.status_code}")
            print(f"  Error: {response.text}")
            return False

    except Exception as e:
        print(f"✗ Download error: {str(e)}")
        return False

def test_invalid_job_id():
    """Test status endpoint with invalid job ID"""
    print("\n=== Testing Invalid Job ID ===")

    fake_job_id = "00000000-0000-0000-0000-000000000000"

    try:
        response = requests.get(f"{API_BASE}/jobs/{fake_job_id}/status")

        if response.status_code == 200:
            status_data = response.json()
            if status_data.get('status') == 'pending':
                print(f"✓ Correctly returns 'pending' for unknown job ID")
                return True

        print(f"✗ Unexpected response for invalid job ID")
        return False

    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("PhotoPackager API Test Suite")
    print("=" * 60)

    # Create test images
    test_images = create_test_images()

    # Test 1: Upload and create job
    job_id = test_upload(test_images)

    if job_id:
        # Test 2: Poll status until completion
        status_data = test_status_polling(job_id, max_wait=120)

        if status_data and status_data.get('status') == 'success':
            # Test 3: Download results
            test_download(job_id, status_data)

    # Test 4: Invalid job ID handling
    test_invalid_job_id()

    print("\n" + "=" * 60)
    print("Test Suite Complete")
    print("=" * 60)

if __name__ == "__main__":
    main()
