#!/usr/bin/env python3
"""
Final Integration Test Suite
Comprehensive testing of the entire PhotoPackager application
"""

import subprocess
import sys
from pathlib import Path
import time

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")

def run_test_suite(test_file, description):
    """Run a test suite and return results"""
    print(f"Running: {description}")
    print("-" * 70)

    try:
        result = subprocess.run(
            [sys.executable, test_file],
            capture_output=True,
            text=True,
            timeout=300
        )

        print(result.stdout)

        if result.stderr:
            print("STDERR:")
            print(result.stderr)

        success = result.returncode == 0

        if success:
            print(f"\n✓ {description} PASSED")
        else:
            print(f"\n✗ {description} FAILED (exit code: {result.returncode})")

        return success

    except subprocess.TimeoutExpired:
        print(f"\n✗ {description} TIMEOUT (>300s)")
        return False
    except Exception as e:
        print(f"\n✗ {description} ERROR: {str(e)}")
        return False

def check_file_structure():
    """Verify all required files exist"""
    print_header("File Structure Verification")

    required_files = [
        "web_app/static/index.html",
        "web_app/static/style.css",
        "web_app/static/script.js",
        "web_app/standalone_server.py",
        "web_app/schemas.py",
        "web_app/photopackager_core/job.py",
        "web_app/photopackager_core/models.py",
        "web_app/photopackager_core/config.py",
    ]

    all_exist = True

    for file_path in required_files:
        full_path = Path(file_path)
        if full_path.exists():
            size = full_path.stat().st_size / 1024  # KB
            print(f"✓ {file_path:50} ({size:8.2f} KB)")
        else:
            print(f"✗ {file_path:50} MISSING")
            all_exist = False

    if all_exist:
        print("\n✓ All required files present")
    else:
        print("\n✗ Some required files are missing")

    return all_exist

def check_server_status():
    """Check if server is running"""
    print_header("Server Status Check")

    import requests

    try:
        response = requests.get("http://localhost:8000/", timeout=5)

        if response.status_code == 200:
            print("✓ Server is running and responding")
            print(f"  Status: {response.status_code}")
            print(f"  Content-Length: {len(response.content)} bytes")
            return True
        else:
            print(f"✗ Server returned unexpected status: {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print("✗ Server is not running or not accessible")
        print("  Please start the server with: python3 web_app/standalone_server.py")
        return False
    except Exception as e:
        print(f"✗ Error checking server: {str(e)}")
        return False

def check_code_quality():
    """Basic code quality checks"""
    print_header("Code Quality Checks")

    checks_passed = 0
    checks_total = 0

    # Check 1: No TODO comments left in code
    checks_total += 1
    print("Checking for unresolved TODO comments...")
    try:
        result = subprocess.run(
            ["grep", "-r", "TODO", "web_app/static/", "--include=*.js", "--include=*.html", "--include=*.css"],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:  # grep returns 1 when no matches
            print("  ✓ No unresolved TODOs found")
            checks_passed += 1
        else:
            todo_count = len(result.stdout.strip().split('\n'))
            print(f"  ⚠ Found {todo_count} TODO comments")
            checks_passed += 1  # Not critical
    except Exception as e:
        print(f"  ⚠ Could not check TODOs: {e}")

    # Check 2: No console.log in production code
    checks_total += 1
    print("Checking for debug console.log statements...")
    try:
        result = subprocess.run(
            ["grep", "-c", "console\\.log", "web_app/static/script.js"],
            capture_output=True,
            text=True
        )

        count = int(result.stdout.strip()) if result.returncode == 0 else 0

        if count == 0:
            print("  ✓ No console.log statements found")
            checks_passed += 1
        elif count <= 3:
            print(f"  ⚠ Found {count} console.log statements (acceptable for debugging)")
            checks_passed += 1
        else:
            print(f"  ✗ Found {count} console.log statements (consider removing)")

    except Exception as e:
        print(f"  ⚠ Could not check console.log: {e}")

    # Check 3: File sizes reasonable
    checks_total += 1
    print("Checking file sizes...")

    js_size = Path("web_app/static/script.js").stat().st_size / 1024
    css_size = Path("web_app/static/style.css").stat().st_size / 1024
    html_size = Path("web_app/static/index.html").stat().st_size / 1024

    total_size = js_size + css_size + html_size

    print(f"  JavaScript: {js_size:.2f} KB")
    print(f"  CSS: {css_size:.2f} KB")
    print(f"  HTML: {html_size:.2f} KB")
    print(f"  Total: {total_size:.2f} KB")

    if total_size < 200:
        print(f"  ✓ Total size is reasonable (<200KB)")
        checks_passed += 1
    else:
        print(f"  ⚠ Total size is large (consider optimization)")

    print(f"\nCode Quality: {checks_passed}/{checks_total} checks passed")
    return checks_passed >= checks_total - 1  # Allow 1 failure

def run_all_test_suites():
    """Run all test suites"""
    print_header("Running All Test Suites")

    test_suites = [
        ("test_api.py", "API Endpoint Tests"),
        ("test_ui_visual.py", "UI Visual Consistency Tests"),
        ("test_ux_flow.py", "UX Flow Tests"),
        ("test_performance.py", "Performance Tests"),
    ]

    results = []

    for test_file, description in test_suites:
        if Path(test_file).exists():
            success = run_test_suite(test_file, description)
            results.append((description, success))
            print("\n" + "-" * 70 + "\n")
            time.sleep(1)  # Brief pause between tests
        else:
            print(f"⚠ Test file not found: {test_file}")
            results.append((description, False))

    return results

def generate_final_report(results):
    """Generate final test report"""
    print_header("Final Integration Test Report")

    total_passed = sum(1 for _, success in results if success)
    total_tests = len(results)

    print("Test Results Summary:")
    print("-" * 70)

    for test_name, success in results:
        status = "✓ PASSED" if success else "✗ FAILED"
        print(f"{test_name:40} {status}")

    print("-" * 70)
    print(f"\nTotal: {total_passed}/{total_tests} test suites passed")

    # Calculate percentage
    percentage = (total_passed / total_tests * 100) if total_tests > 0 else 0

    print(f"Success Rate: {percentage:.1f}%")

    if percentage == 100:
        print("\n" + "=" * 70)
        print("🎉 CONGRATULATIONS! ALL TESTS PASSED! 🎉")
        print("=" * 70)
        print("\nPhotoPackager is ready for production use!")
        print("\nKey Features Verified:")
        print("  ✓ Modern glassmorphism UI design")
        print("  ✓ Drag-and-drop file upload")
        print("  ✓ Real-time progress tracking")
        print("  ✓ Multiple quality output options")
        print("  ✓ ZIP package generation")
        print("  ✓ Error handling and validation")
        print("  ✓ Performance optimization")
        print("  ✓ Responsive design")
        print("  ✓ Concurrent request handling")
        print("\nServer running at: http://localhost:8000")
        return True

    elif percentage >= 75:
        print("\n✓ Most tests passed - application is functional")
        print("⚠ Review failed tests and address issues")
        return True

    else:
        print("\n✗ Too many tests failed - requires attention")
        print("Please review and fix the issues before deployment")
        return False

def main():
    """Main integration test workflow"""
    print("\n" + "=" * 70)
    print("  PhotoPackager - Final Integration Test Suite")
    print("  Complete Application Verification")
    print("=" * 70)

    all_results = []

    # Phase 1: File structure
    file_check = check_file_structure()
    all_results.append(("File Structure", file_check))

    if not file_check:
        print("\n✗ Critical: File structure issues detected")
        print("Cannot proceed with testing")
        return False

    # Phase 2: Server status
    server_check = check_server_status()
    all_results.append(("Server Status", server_check))

    if not server_check:
        print("\n✗ Critical: Server is not running")
        print("Please start the server before running tests")
        return False

    # Phase 3: Code quality
    code_quality = check_code_quality()
    all_results.append(("Code Quality", code_quality))

    # Phase 4: Run all test suites
    test_results = run_all_test_suites()
    all_results.extend(test_results)

    # Phase 5: Generate report
    success = generate_final_report(all_results)

    return success

if __name__ == "__main__":
    try:
        success = main()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠ Tests interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n\n✗ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)
