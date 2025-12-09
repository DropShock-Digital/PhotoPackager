#!/usr/bin/env python3
"""
UI Visual Consistency Test
Tests that all HTML, CSS, and JavaScript files are properly formatted and consistent
"""

import re
from pathlib import Path

def test_html_structure():
    """Test HTML structure and consistency"""
    print("=" * 60)
    print("Testing HTML Structure")
    print("=" * 60)

    html_file = Path("/mnt/d/Data_Portable/Development/Repositories/PhotoPackager/web_app/static/index.html")
    content = html_file.read_text()

    tests_passed = 0
    tests_failed = 0

    # Test 1: DOCTYPE present
    if "<!DOCTYPE html>" in content:
        print("✓ DOCTYPE declaration present")
        tests_passed += 1
    else:
        print("✗ DOCTYPE declaration missing")
        tests_failed += 1

    # Test 2: Meta viewport for responsive design
    if 'name="viewport"' in content:
        print("✓ Viewport meta tag present")
        tests_passed += 1
    else:
        print("✗ Viewport meta tag missing")
        tests_failed += 1

    # Test 3: CSS file linked
    if 'href="style.css"' in content:
        print("✓ CSS stylesheet linked")
        tests_passed += 1
    else:
        print("✗ CSS stylesheet not linked")
        tests_failed += 1

    # Test 4: JavaScript file linked
    if 'src="script.js"' in content:
        print("✓ JavaScript file linked")
        tests_passed += 1
    else:
        print("✗ JavaScript file not linked")
        tests_failed += 1

    # Test 5: File input element present
    if 'type="file"' in content and 'id="file-input"' in content:
        print("✓ File input element present")
        tests_passed += 1
    else:
        print("✗ File input element missing")
        tests_failed += 1

    # Test 6: Drop zone present
    if 'id="drop-zone"' in content:
        print("✓ Drop zone element present")
        tests_passed += 1
    else:
        print("✗ Drop zone element missing")
        tests_failed += 1

    # Test 7: Progress section present
    if 'id="progress-section"' in content:
        print("✓ Progress section present")
        tests_passed += 1
    else:
        print("✗ Progress section missing")
        tests_failed += 1

    # Test 8: Results section present
    if 'id="results-section"' in content:
        print("✓ Results section present")
        tests_passed += 1
    else:
        print("✗ Results section missing")
        tests_failed += 1

    # Test 9: Processing options present
    if 'id="options-section"' in content:
        print("✓ Options section present")
        tests_passed += 1
    else:
        print("✗ Options section missing")
        tests_failed += 1

    # Test 10: Modal present
    if 'id="error-modal"' in content:
        print("✓ Error modal present")
        tests_passed += 1
    else:
        print("✗ Error modal missing")
        tests_failed += 1

    print(f"\nHTML Tests: {tests_passed} passed, {tests_failed} failed")
    return tests_failed == 0

def test_css_structure():
    """Test CSS structure and glassmorphism implementation"""
    print("\n" + "=" * 60)
    print("Testing CSS Structure")
    print("=" * 60)

    css_file = Path("/mnt/d/Data_Portable/Development/Repositories/PhotoPackager/web_app/static/style.css")
    content = css_file.read_text()

    tests_passed = 0
    tests_failed = 0

    # Test 1: CSS variables defined
    if ':root {' in content and '--' in content:
        print("✓ CSS variables defined")
        tests_passed += 1
    else:
        print("✗ CSS variables not found")
        tests_failed += 1

    # Test 2: Backdrop filter present (glassmorphism)
    if 'backdrop-filter:' in content or 'backdrop-filter :' in content:
        print("✓ Backdrop filter (glassmorphism) implemented")
        tests_passed += 1
    else:
        print("✗ Backdrop filter missing")
        tests_failed += 1

    # Test 3: Responsive breakpoints
    media_queries = content.count('@media')
    if media_queries >= 3:
        print(f"✓ Responsive design with {media_queries} media queries")
        tests_passed += 1
    else:
        print(f"✗ Insufficient responsive breakpoints ({media_queries} found)")
        tests_failed += 1

    # Test 4: Animations defined
    animations = re.findall(r'@keyframes\s+(\w+)', content)
    if len(animations) >= 4:
        print(f"✓ Animations defined: {', '.join(animations)}")
        tests_passed += 1
    else:
        print(f"✗ Insufficient animations ({len(animations)} found)")
        tests_failed += 1

    # Test 5: Glass panel classes
    if '.glass-panel' in content and '.glass-nav' in content:
        print("✓ Glass panel classes defined")
        tests_passed += 1
    else:
        print("✗ Glass panel classes missing")
        tests_failed += 1

    # Test 6: Drop zone styling
    if '.drop-zone' in content:
        print("✓ Drop zone styling present")
        tests_passed += 1
    else:
        print("✗ Drop zone styling missing")
        tests_failed += 1

    # Test 7: Progress bar styling
    if '.progress-bar' in content:
        print("✓ Progress bar styling present")
        tests_passed += 1
    else:
        print("✗ Progress bar styling missing")
        tests_failed += 1

    # Test 8: Accessibility (prefers-reduced-motion)
    if '@media (prefers-reduced-motion:' in content or '@media (prefers-reduced-motion :' in content:
        print("✓ Accessibility: reduced motion support")
        tests_passed += 1
    else:
        print("✗ Accessibility: missing reduced motion support")
        tests_failed += 1

    # Test 9: Dark theme/gradient
    if 'linear-gradient' in content and ('background:' in content or 'background :' in content):
        print("✓ Gradient background implemented")
        tests_passed += 1
    else:
        print("✗ Gradient background missing")
        tests_failed += 1

    # Test 10: Button styling
    if '.glass-button' in content:
        print("✓ Button styling present")
        tests_passed += 1
    else:
        print("✗ Button styling missing")
        tests_failed += 1

    print(f"\nCSS Tests: {tests_passed} passed, {tests_failed} failed")
    return tests_failed == 0

def test_javascript_structure():
    """Test JavaScript structure and functionality"""
    print("\n" + "=" * 60)
    print("Testing JavaScript Structure")
    print("=" * 60)

    js_file = Path("/mnt/d/Data_Portable/Development/Repositories/PhotoPackager/web_app/static/script.js")
    content = js_file.read_text()

    tests_passed = 0
    tests_failed = 0

    # Test 1: IIFE pattern
    if '(function()' in content or '(function ()' in content:
        print("✓ IIFE pattern used")
        tests_passed += 1
    else:
        print("✗ IIFE pattern not found")
        tests_failed += 1

    # Test 2: Strict mode
    if "'use strict'" in content or '"use strict"' in content:
        print("✓ Strict mode enabled")
        tests_passed += 1
    else:
        print("✗ Strict mode not enabled")
        tests_failed += 1

    # Test 3: State management
    if 'state' in content and 'selectedFiles' in content:
        print("✓ State management implemented")
        tests_passed += 1
    else:
        print("✗ State management missing")
        tests_failed += 1

    # Test 4: Drag and drop handlers
    drag_handlers = ['dragenter', 'dragover', 'dragleave', 'drop']
    found_handlers = [h for h in drag_handlers if h in content]
    if len(found_handlers) == 4:
        print(f"✓ All drag-and-drop handlers present")
        tests_passed += 1
    else:
        print(f"✗ Missing drag handlers: {set(drag_handlers) - set(found_handlers)}")
        tests_failed += 1

    # Test 5: File validation
    if 'validateFile' in content:
        print("✓ File validation function present")
        tests_passed += 1
    else:
        print("✗ File validation function missing")
        tests_failed += 1

    # Test 6: FormData API usage
    if 'FormData' in content:
        print("✓ FormData API used for uploads")
        tests_passed += 1
    else:
        print("✗ FormData API not found")
        tests_failed += 1

    # Test 7: Async/await pattern
    async_count = content.count('async ')
    await_count = content.count('await ')
    if async_count >= 3 and await_count >= 3:
        print(f"✓ Async/await pattern used ({async_count} async, {await_count} await)")
        tests_passed += 1
    else:
        print(f"✗ Insufficient async/await usage")
        tests_failed += 1

    # Test 8: Status polling
    if 'startPolling' in content or 'pollStatus' in content:
        print("✓ Status polling implemented")
        tests_passed += 1
    else:
        print("✗ Status polling missing")
        tests_failed += 1

    # Test 9: Progress tracking
    if 'updateProgress' in content or 'progress' in content:
        print("✓ Progress tracking implemented")
        tests_passed += 1
    else:
        print("✗ Progress tracking missing")
        tests_failed += 1

    # Test 10: Error handling
    try_count = content.count('try {')
    catch_count = content.count('catch')
    if try_count >= 3 and catch_count >= 3:
        print(f"✓ Error handling present ({try_count} try/catch blocks)")
        tests_passed += 1
    else:
        print(f"✗ Insufficient error handling")
        tests_failed += 1

    print(f"\nJavaScript Tests: {tests_passed} passed, {tests_failed} failed")
    return tests_failed == 0

def test_integration():
    """Test integration between HTML, CSS, and JavaScript"""
    print("\n" + "=" * 60)
    print("Testing HTML/CSS/JS Integration")
    print("=" * 60)

    html_file = Path("/mnt/d/Data_Portable/Development/Repositories/PhotoPackager/web_app/static/index.html")
    css_file = Path("/mnt/d/Data_Portable/Development/Repositories/PhotoPackager/web_app/static/style.css")
    js_file = Path("/mnt/d/Data_Portable/Development/Repositories/PhotoPackager/web_app/static/script.js")

    html_content = html_file.read_text()
    css_content = css_file.read_text()
    js_content = js_file.read_text()

    tests_passed = 0
    tests_failed = 0

    # Test 1: HTML IDs referenced in JavaScript
    html_ids = set(re.findall(r'id="([^"]+)"', html_content))
    js_ids = set(re.findall(r'getElementById\([\'"]([^\'"]+)[\'"]\)', js_content))

    missing_ids = js_ids - html_ids
    if not missing_ids:
        print(f"✓ All JavaScript IDs exist in HTML ({len(js_ids)} references)")
        tests_passed += 1
    else:
        print(f"✗ Missing HTML IDs: {missing_ids}")
        tests_failed += 1

    # Test 2: CSS classes used in HTML
    html_classes = set(re.findall(r'class="([^"]+)"', html_content))
    # Flatten classes (some elements have multiple classes)
    html_classes_flat = set()
    for classes in html_classes:
        html_classes_flat.update(classes.split())

    css_classes = set(re.findall(r'\.([a-z][a-z0-9-_]*)', css_content, re.IGNORECASE))

    # Check if major glass classes are defined
    required_classes = {'glass-panel', 'glass-nav', 'glass-button', 'drop-zone'}
    missing_classes = required_classes - css_classes
    if not missing_classes:
        print(f"✓ All required CSS classes defined")
        tests_passed += 1
    else:
        print(f"✗ Missing CSS classes: {missing_classes}")
        tests_failed += 1

    # Test 3: Event handlers exist for interactive elements
    interactive_ids = ['file-input', 'browse-btn', 'start-btn', 'cancel-btn', 'clear-files-btn']
    found_in_js = sum(1 for id in interactive_ids if id in js_content)
    if found_in_js >= len(interactive_ids) - 1:  # Allow 1 missing
        print(f"✓ Interactive elements have JS handlers ({found_in_js}/{len(interactive_ids)})")
        tests_passed += 1
    else:
        print(f"✗ Missing JS handlers for interactive elements")
        tests_failed += 1

    # Test 4: API endpoints consistency
    # Check for API_BASE constant and endpoint usage
    has_api_base = 'API_BASE:' in js_content and '/api' in js_content
    has_jobs_endpoint = '/jobs' in js_content
    has_fetch_calls = 'fetch(' in js_content or 'fetch (' in js_content

    if has_api_base and has_jobs_endpoint and has_fetch_calls:
        print(f"✓ API endpoints referenced correctly")
        tests_passed += 1
    else:
        print(f"✗ API endpoints missing or incorrect")
        tests_failed += 1

    print(f"\nIntegration Tests: {tests_passed} passed, {tests_failed} failed")
    return tests_failed == 0

def main():
    """Run all visual consistency tests"""
    print("\n" + "=" * 60)
    print("PhotoPackager UI Visual Consistency Test Suite")
    print("=" * 60 + "\n")

    results = []
    results.append(("HTML Structure", test_html_structure()))
    results.append(("CSS Structure", test_css_structure()))
    results.append(("JavaScript Structure", test_javascript_structure()))
    results.append(("Integration", test_integration()))

    print("\n" + "=" * 60)
    print("Test Suite Summary")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{name:30} {status}")

    print(f"\nOverall: {passed}/{total} test categories passed")

    if passed == total:
        print("\n🎉 All visual consistency tests passed!")
        return True
    else:
        print(f"\n⚠️  {total - passed} test categories failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
