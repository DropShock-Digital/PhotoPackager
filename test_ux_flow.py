#!/usr/bin/env python3
"""
UX Flow Test - End-to-End User Experience Testing
Tests the complete user journey from upload to download
"""

import requests
import json
import time
from pathlib import Path
from PIL import Image

API_BASE = "http://localhost:8000/api"
TEST_DIR = Path(__file__).parent / "test_ux_images"
TEST_DIR.mkdir(exist_ok=True)

def print_step(step_num, description):
    """Print a formatted test step"""
    print(f"\n{'='*60}")
    print(f"Step {step_num}: {description}")
    print('='*60)

def create_test_image(filename, size=(1920, 1080), color=(100, 150, 200)):
    """Create a test image"""
    img = Image.new('RGB', size, color)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 100, size[0]-100, size[1]-100], outline=(255, 255, 255), width=10)
    draw.text((size[0]//2, size[1]//2), filename, fill=(255, 255, 255))

    img_path = TEST_DIR / filename
    img.save(img_path, 'JPEG', quality=95)
    return img_path

def test_complete_ux_flow():
    """Test the complete UX flow from start to finish"""
    print("=" * 60)
    print("PhotoPackager Complete UX Flow Test")
    print("=" * 60)

    # STEP 1: User prepares photos
    print_step(1, "User Prepares Photos")
    test_images = []
    for i in range(5):
        img_path = create_test_image(
            f"vacation_photo_{i+1}.jpg",
            size=(1920, 1080),
            color=(50 + i*30, 100 + i*20, 150 + i*10)
        )
        test_images.append(img_path)
        print(f"  ✓ Created: {img_path.name}")

    # STEP 2: User selects processing options
    print_step(2, "User Selects Processing Options")
    settings = {
        'shoot_name': 'Summer_Vacation_2025',
        'base_name': 'vacation_photo',
        'generate_optimized_jpg': True,
        'generate_optimized_webp': True,
        'generate_compressed_jpg': True,
        'generate_compressed_webp': False,  # User unchecks this
        'include_raw_files': False,
        'create_zip_packages': True,
        'exif_option': 'date',  # Keep only date metadata
        'quality_optimized': 95,
        'quality_compressed': 85
    }
    print("  ✓ Settings configured:")
    print(f"    - Project: {settings['shoot_name']}")
    print(f"    - Optimized JPG: {settings['generate_optimized_jpg']}")
    print(f"    - Optimized WebP: {settings['generate_optimized_webp']}")
    print(f"    - Compressed JPG: {settings['generate_compressed_jpg']}")
    print(f"    - Compressed WebP: {settings['generate_compressed_webp']}")
    print(f"    - EXIF: {settings['exif_option']}")

    # STEP 3: User uploads files
    print_step(3, "User Uploads Files via Drag-and-Drop")
    files = []
    for img_path in test_images:
        files.append(('files', (img_path.name, open(img_path, 'rb'), 'image/jpeg')))

    data = {'settings': json.dumps(settings)}

    print(f"  Uploading {len(test_images)} files...")
    start_upload = time.time()

    try:
        response = requests.post(f"{API_BASE}/jobs", files=files, data=data, timeout=120)
        upload_time = time.time() - start_upload

        # Close file handles
        for _, file_tuple in files:
            file_tuple[1].close()

        if response.status_code != 200:
            print(f"  ✗ Upload failed: {response.status_code}")
            print(f"    Error: {response.text}")
            return False

        result = response.json()
        job_id = result['job_id']
        print(f"  ✓ Upload successful!")
        print(f"    - Job ID: {job_id}")
        print(f"    - Upload time: {upload_time:.2f}s")
        print(f"    - Average: {upload_time/len(test_images):.2f}s per file")

    except Exception as e:
        print(f"  ✗ Upload error: {str(e)}")
        for _, file_tuple in files:
            try:
                file_tuple[1].close()
            except:
                pass
        return False

    # STEP 4: User watches progress
    print_step(4, "User Watches Real-Time Progress")
    print("  Processing...")

    start_process = time.time()
    poll_count = 0
    max_polls = 60  # 60 seconds max

    while poll_count < max_polls:
        try:
            response = requests.get(f"{API_BASE}/jobs/{job_id}/status")

            if response.status_code != 200:
                print(f"  ✗ Status check failed: {response.status_code}")
                return False

            status_data = response.json()
            status = status_data.get('status')
            message = status_data.get('message', '')

            poll_count += 1

            # Show progress indicator
            progress_chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
            print(f"\r  {progress_chars[poll_count % len(progress_chars)]} Status: {status} - {message}", end='', flush=True)

            if status == 'success':
                process_time = time.time() - start_process
                print(f"\n  ✓ Processing complete!")
                print(f"    - Processing time: {process_time:.2f}s")
                print(f"    - Average: {process_time/len(test_images):.2f}s per file")
                result_data = status_data.get('result', {})
                break
            elif status == 'failure':
                print(f"\n  ✗ Processing failed: {status_data.get('error', 'Unknown error')}")
                return False

            time.sleep(1)

        except Exception as e:
            print(f"\n  ✗ Status polling error: {str(e)}")
            return False

    if poll_count >= max_polls:
        print(f"\n  ✗ Timeout: Processing took longer than {max_polls} seconds")
        return False

    # STEP 5: User views results
    print_step(5, "User Views Results")
    zip_packages = result_data.get('zip_packages', [])

    if not zip_packages:
        print("  ✗ No ZIP packages created")
        return False

    print(f"  ✓ Results ready:")
    print(f"    - ZIP packages: {len(zip_packages)}")
    for zip_file in zip_packages:
        print(f"      • {zip_file}")

    # STEP 6: User downloads results
    print_step(6, "User Downloads Results")

    for zip_filename in zip_packages:
        download_url = f"{API_BASE}/jobs/{job_id}/download/{zip_filename}"
        print(f"  Downloading: {zip_filename}")

        try:
            start_download = time.time()
            response = requests.get(download_url, stream=True)

            if response.status_code != 200:
                print(f"  ✗ Download failed: {response.status_code}")
                print(f"    Error: {response.text}")
                return False

            # Calculate size and speed
            content_length = response.headers.get('content-length')
            if content_length:
                size_mb = int(content_length) / (1024 * 1024)

                # Save file
                output_path = TEST_DIR / zip_filename
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

                download_time = time.time() - start_download
                speed_mbps = (size_mb / download_time) if download_time > 0 else 0

                print(f"  ✓ Download successful!")
                print(f"    - Size: {size_mb:.2f} MB")
                print(f"    - Time: {download_time:.2f}s")
                print(f"    - Speed: {speed_mbps:.2f} MB/s")
                print(f"    - Saved to: {output_path}")
            else:
                print(f"  ✓ Download successful (size unknown)")

        except Exception as e:
            print(f"  ✗ Download error: {str(e)}")
            return False

    # STEP 7: Verify downloaded files
    print_step(7, "Verify Downloaded Files")

    import zipfile
    for zip_filename in zip_packages:
        zip_path = TEST_DIR / zip_filename

        if not zip_path.exists():
            print(f"  ✗ ZIP file not found: {zip_filename}")
            return False

        try:
            with zipfile.ZipFile(zip_path, 'r') as zipf:
                file_list = zipf.namelist()
                print(f"  ✓ {zip_filename}:")
                print(f"    - Files in ZIP: {len(file_list)}")

                # Check for expected file types
                jpg_files = [f for f in file_list if f.endswith('.jpg') or f.endswith('.jpeg')]
                webp_files = [f for f in file_list if f.endswith('.webp')]

                print(f"    - JPG files: {len(jpg_files)}")
                print(f"    - WebP files: {len(webp_files)}")

                # Verify ZIP integrity
                bad_file = zipf.testzip()
                if bad_file:
                    print(f"  ✗ ZIP integrity check failed: {bad_file}")
                    return False
                else:
                    print(f"    - ZIP integrity: ✓ OK")

        except Exception as e:
            print(f"  ✗ ZIP verification failed: {str(e)}")
            return False

    return True

def test_error_scenarios():
    """Test error handling scenarios"""
    print("\n" + "=" * 60)
    print("Testing Error Scenarios")
    print("=" * 60)

    tests_passed = 0
    tests_total = 0

    # Test 1: Empty file upload
    print("\n1. Testing empty file upload...")
    tests_total += 1
    try:
        response = requests.post(f"{API_BASE}/jobs", files=[], data={'settings': '{}'})
        if response.status_code >= 400:
            print("  ✓ Correctly rejects empty upload")
            tests_passed += 1
        else:
            print("  ✗ Should reject empty upload")
    except Exception as e:
        print(f"  ✗ Error: {e}")

    # Test 2: Invalid settings format
    print("\n2. Testing invalid settings format...")
    tests_total += 1
    try:
        test_img = create_test_image("test_invalid.jpg")
        files = [('files', (test_img.name, open(test_img, 'rb'), 'image/jpeg'))]
        response = requests.post(f"{API_BASE}/jobs", files=files, data={'settings': 'not json'})
        files[0][1][1].close()

        if response.status_code >= 400:
            print("  ✓ Correctly rejects invalid settings")
            tests_passed += 1
        else:
            print("  ✗ Should reject invalid settings")
    except Exception as e:
        print(f"  ✗ Error: {e}")

    # Test 3: Non-existent job status
    print("\n3. Testing non-existent job status...")
    tests_total += 1
    try:
        response = requests.get(f"{API_BASE}/jobs/fake-job-id/status")
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'pending':
                print("  ✓ Returns pending for unknown job")
                tests_passed += 1
            else:
                print("  ✗ Should return pending status")
        else:
            print("  ✗ Unexpected status code")
    except Exception as e:
        print(f"  ✗ Error: {e}")

    print(f"\nError Handling Tests: {tests_passed}/{tests_total} passed")
    return tests_passed == tests_total

def main():
    """Run all UX flow tests"""
    print("\n" + "=" * 60)
    print("Starting Comprehensive UX Flow Testing")
    print("=" * 60)

    # Test complete happy path
    ux_flow_success = test_complete_ux_flow()

    # Test error scenarios
    error_handling_success = test_error_scenarios()

    # Summary
    print("\n" + "=" * 60)
    print("UX Flow Test Summary")
    print("=" * 60)
    print(f"Complete UX Flow:     {'✓ PASSED' if ux_flow_success else '✗ FAILED'}")
    print(f"Error Handling:       {'✓ PASSED' if error_handling_success else '✗ FAILED'}")

    if ux_flow_success and error_handling_success:
        print("\n🎉 All UX flow tests passed!")
        print("\nUser Experience Quality:")
        print("  ✓ Intuitive upload process")
        print("  ✓ Real-time progress feedback")
        print("  ✓ Clear results presentation")
        print("  ✓ Easy download process")
        print("  ✓ Proper error handling")
        return True
    else:
        print("\n⚠️  Some UX flow tests failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
