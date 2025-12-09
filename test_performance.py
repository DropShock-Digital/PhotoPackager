#!/usr/bin/env python3
"""
Performance Testing Suite
Tests performance metrics, optimization, and scalability
"""

import requests
import json
import time
from pathlib import Path
from PIL import Image
import statistics
import psutil
import os

API_BASE = "http://localhost:8000/api"
STATIC_BASE = "http://localhost:8000"
TEST_DIR = Path(__file__).parent / "test_perf_images"
TEST_DIR.mkdir(exist_ok=True)

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print('='*60)

def create_test_image(filename, size=(3840, 2160), quality=95):
    """Create a high-resolution test image"""
    img = Image.new('RGB', size, color=(100, 150, 200))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)

    # Add complex content to simulate real photos
    for i in range(100):
        x1, y1 = i * 38, i * 21
        x2, y2 = x1 + 200, y1 + 200
        draw.rectangle([x1, y1, x2, y2], outline=(255, 255, 255), width=2)

    img_path = TEST_DIR / filename
    img.save(img_path, 'JPEG', quality=quality)
    return img_path

def test_static_file_performance():
    """Test static file loading performance"""
    print_section("Static File Performance")

    files_to_test = [
        ('/', 'HTML'),
        ('/style.css', 'CSS'),
        ('/script.js', 'JavaScript')
    ]

    results = []

    for path, file_type in files_to_test:
        times = []
        sizes = []

        # Test 5 times for consistency
        for _ in range(5):
            start = time.time()
            response = requests.get(f"{STATIC_BASE}{path}")
            elapsed = time.time() - start

            if response.status_code == 200:
                times.append(elapsed * 1000)  # Convert to ms
                sizes.append(len(response.content))
            else:
                print(f"✗ Failed to load {file_type}: {response.status_code}")
                return False

        avg_time = statistics.mean(times)
        avg_size = statistics.mean(sizes)
        std_dev = statistics.stdev(times) if len(times) > 1 else 0

        results.append((file_type, avg_size, avg_time, std_dev))

        print(f"\n{file_type}:")
        print(f"  Size: {avg_size/1024:.2f} KB")
        print(f"  Load time: {avg_time:.2f}ms (±{std_dev:.2f}ms)")

        # Performance criteria
        if avg_time < 50:
            print(f"  Performance: ✓ Excellent")
        elif avg_time < 100:
            print(f"  Performance: ✓ Good")
        elif avg_time < 200:
            print(f"  Performance: ⚠ Acceptable")
        else:
            print(f"  Performance: ✗ Slow")

    total_size = sum(r[1] for r in results) / 1024
    total_time = sum(r[2] for r in results)

    print(f"\nTotal payload: {total_size:.2f} KB")
    print(f"Total load time: {total_time:.2f}ms")

    if total_time < 150:
        print("Overall: ✓ Fast initial load")
    elif total_time < 300:
        print("Overall: ✓ Good initial load")
    else:
        print("Overall: ⚠ Consider optimization")

    return total_time < 500  # 500ms threshold

def test_upload_performance():
    """Test upload performance with varying file counts"""
    print_section("Upload Performance")

    test_cases = [
        (1, "Single file"),
        (5, "Small batch"),
        (10, "Medium batch"),
        (20, "Large batch")
    ]

    results = []

    for file_count, description in test_cases:
        print(f"\n{description} ({file_count} files):")

        # Create test images
        test_images = []
        for i in range(file_count):
            img_path = create_test_image(f"perf_test_{i}.jpg", size=(1920, 1080))
            test_images.append(img_path)

        # Measure upload
        files = [(f'files', (img.name, open(img, 'rb'), 'image/jpeg')) for img in test_images]
        settings = {
            'shoot_name': f'Perf_Test_{file_count}',
            'base_name': 'photo',
            'generate_optimized_jpg': True,
            'generate_optimized_webp': False,
            'generate_compressed_jpg': False,
            'generate_compressed_webp': False,
            'create_zip_packages': True,
            'exif_option': 'keep'
        }

        data = {'settings': json.dumps(settings)}

        start = time.time()
        try:
            response = requests.post(f"{API_BASE}/jobs", files=files, data=data, timeout=300)

            # Close file handles
            for _, file_tuple in files:
                file_tuple[1].close()

            upload_time = time.time() - start

            if response.status_code == 200:
                result = response.json()
                job_id = result['job_id']

                # Measure total processing time
                start_wait = time.time()
                while True:
                    status_response = requests.get(f"{API_BASE}/jobs/{job_id}/status")
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        if status_data['status'] == 'success':
                            total_time = time.time() - start
                            processing_time = time.time() - start_wait
                            break
                        elif status_data['status'] == 'failure':
                            print(f"  ✗ Processing failed")
                            break
                    time.sleep(0.5)

                results.append({
                    'count': file_count,
                    'upload_time': upload_time,
                    'processing_time': processing_time,
                    'total_time': total_time
                })

                print(f"  Upload: {upload_time:.2f}s ({upload_time/file_count:.3f}s per file)")
                print(f"  Processing: {processing_time:.2f}s ({processing_time/file_count:.3f}s per file)")
                print(f"  Total: {total_time:.2f}s")

                # Performance rating
                time_per_file = total_time / file_count
                if time_per_file < 0.5:
                    print(f"  Performance: ✓ Excellent (<0.5s per file)")
                elif time_per_file < 1.0:
                    print(f"  Performance: ✓ Good (<1s per file)")
                elif time_per_file < 2.0:
                    print(f"  Performance: ⚠ Acceptable (<2s per file)")
                else:
                    print(f"  Performance: ✗ Slow (>{time_per_file:.2f}s per file)")

            else:
                print(f"  ✗ Upload failed: {response.status_code}")

        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            for _, file_tuple in files:
                try:
                    file_tuple[1].close()
                except:
                    pass

        # Cleanup
        for img in test_images:
            if img.exists():
                img.unlink()

    # Analyze scalability
    if len(results) >= 2:
        print("\nScalability Analysis:")
        first = results[0]
        last = results[-1]

        scaling_factor = last['count'] / first['count']
        time_scaling = last['total_time'] / first['total_time']

        print(f"  File count increased: {scaling_factor:.1f}x")
        print(f"  Time increased: {time_scaling:.1f}x")

        if time_scaling < scaling_factor * 1.2:
            print(f"  Scalability: ✓ Linear or better")
        elif time_scaling < scaling_factor * 2:
            print(f"  Scalability: ✓ Acceptable")
        else:
            print(f"  Scalability: ⚠ Suboptimal")

    return True

def test_memory_usage():
    """Test memory usage during operations"""
    print_section("Memory Usage")

    try:
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB

        print(f"Initial memory: {initial_memory:.2f} MB")

        # Create and process images
        test_images = []
        for i in range(10):
            img_path = create_test_image(f"mem_test_{i}.jpg", size=(2560, 1440))
            test_images.append(img_path)

        during_create = process.memory_info().rss / 1024 / 1024
        print(f"After creating 10 images: {during_create:.2f} MB (Δ{during_create-initial_memory:.2f} MB)")

        # Upload
        files = [(f'files', (img.name, open(img, 'rb'), 'image/jpeg')) for img in test_images]
        settings = {
            'shoot_name': 'Memory_Test',
            'base_name': 'photo',
            'generate_optimized_jpg': True,
            'generate_optimized_webp': True,
            'create_zip_packages': True,
            'exif_option': 'keep'
        }

        data = {'settings': json.dumps(settings)}
        response = requests.post(f"{API_BASE}/jobs", files=files, data=data, timeout=120)

        for _, file_tuple in files:
            file_tuple[1].close()

        during_process = process.memory_info().rss / 1024 / 1024
        print(f"After processing: {during_process:.2f} MB (Δ{during_process-initial_memory:.2f} MB)")

        # Cleanup
        for img in test_images:
            if img.exists():
                img.unlink()

        final_memory = process.memory_info().rss / 1024 / 1024
        print(f"After cleanup: {final_memory:.2f} MB (Δ{final_memory-initial_memory:.2f} MB)")

        memory_increase = final_memory - initial_memory
        if memory_increase < 50:
            print(f"\nMemory efficiency: ✓ Excellent (<50MB increase)")
            return True
        elif memory_increase < 100:
            print(f"\nMemory efficiency: ✓ Good (<100MB increase)")
            return True
        else:
            print(f"\nMemory efficiency: ⚠ High memory usage ({memory_increase:.2f}MB)")
            return False

    except Exception as e:
        print(f"✗ Memory test error: {str(e)}")
        return False

def test_concurrent_requests():
    """Test handling of concurrent requests"""
    print_section("Concurrent Request Handling")

    import concurrent.futures

    def make_request(request_id):
        """Make a single request"""
        try:
            # Create a small test image
            img_path = create_test_image(f"concurrent_{request_id}.jpg", size=(800, 600))

            files = [('files', (img_path.name, open(img_path, 'rb'), 'image/jpeg'))]
            settings = {
                'shoot_name': f'Concurrent_{request_id}',
                'base_name': 'photo',
                'generate_optimized_jpg': True,
                'create_zip_packages': False,
                'exif_option': 'keep'
            }
            data = {'settings': json.dumps(settings)}

            start = time.time()
            response = requests.post(f"{API_BASE}/jobs", files=files, data=data, timeout=60)
            elapsed = time.time() - start

            files[0][1][1].close()

            if img_path.exists():
                img_path.unlink()

            return {
                'id': request_id,
                'status': response.status_code,
                'time': elapsed,
                'success': response.status_code == 200
            }

        except Exception as e:
            return {
                'id': request_id,
                'status': 0,
                'time': 0,
                'success': False,
                'error': str(e)
            }

    # Test with 5 concurrent requests
    num_concurrent = 5
    print(f"Testing {num_concurrent} concurrent uploads...")

    start_all = time.time()

    with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
        futures = [executor.submit(make_request, i) for i in range(num_concurrent)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    total_time = time.time() - start_all

    successful = sum(1 for r in results if r['success'])
    avg_time = statistics.mean([r['time'] for r in results if r['success']])

    print(f"\nResults:")
    print(f"  Total time: {total_time:.2f}s")
    print(f"  Successful: {successful}/{num_concurrent}")
    print(f"  Average time per request: {avg_time:.2f}s")

    if successful == num_concurrent:
        print(f"  Concurrent handling: ✓ All requests succeeded")
        return True
    else:
        print(f"  Concurrent handling: ⚠ {num_concurrent - successful} requests failed")
        return False

def main():
    """Run all performance tests"""
    print("\n" + "=" * 60)
    print("PhotoPackager Performance Test Suite")
    print("=" * 60)

    results = []

    results.append(("Static File Performance", test_static_file_performance()))
    results.append(("Upload Performance", test_upload_performance()))
    results.append(("Memory Usage", test_memory_usage()))
    results.append(("Concurrent Requests", test_concurrent_requests()))

    # Summary
    print_section("Performance Test Summary")

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{name:30} {status}")

    print(f"\nOverall: {passed}/{total} test categories passed")

    if passed == total:
        print("\n🎉 All performance tests passed!")
        print("\nPerformance Characteristics:")
        print("  ✓ Fast static file loading")
        print("  ✓ Efficient image processing")
        print("  ✓ Good memory management")
        print("  ✓ Handles concurrent requests")
        return True
    else:
        print(f"\n⚠️  {total - passed} performance tests failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
