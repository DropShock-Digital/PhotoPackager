#!/bin/bash
# Cleanup script for PhotoPackager residue files from old editions
# This removes test outputs, old builds, and duplicate files

set -e

echo "========================================================================"
echo "PhotoPackager Cleanup Script"
echo "Removing residue files from old editions"
echo "========================================================================"

# Navigate to project root
cd "$(dirname "$0")"

# Count files to be deleted
total_deleted=0

# Function to remove and count
remove_dir() {
    if [ -d "$1" ]; then
        size=$(du -sh "$1" 2>/dev/null | cut -f1)
        echo "  Removing: $1 ($size)"
        rm -rf "$1"
        ((total_deleted++))
    fi
}

remove_file() {
    if [ -f "$1" ]; then
        size=$(du -h "$1" 2>/dev/null | cut -f1)
        echo "  Removing: $1 ($size)"
        rm -f "$1"
        ((total_deleted++))
    fi
}

# 1. Remove test output directories
echo ""
echo "1. Cleaning test output directories..."
remove_dir "test_images"
remove_dir "test_ux_images"
remove_dir "test_perf_images"
remove_dir "outputs"
remove_dir "temp_uploads"

# 2. Remove Python cache
echo ""
echo "2. Cleaning Python cache files..."
remove_dir "__pycache__"
remove_dir "cli/__pycache__"
remove_dir "gui/__pycache__"
remove_dir "tests/__pycache__"
remove_dir "web_app/__pycache__"
remove_dir "web_app/photopackager_core/__pycache__"
remove_dir "photopackager/__pycache__"
remove_dir ".pytest_cache"

# 3. Remove old venv directories (keep venv_quick)
echo ""
echo "3. Cleaning old virtual environments..."
remove_dir "venv"
remove_dir "venv_mac"
remove_dir "venv_windows"

# 4. Remove build artifacts
echo ""
echo "4. Cleaning build artifacts..."
remove_dir "build"
remove_dir "dist"
remove_dir "release"
remove_dir "*.egg-info"

# 5. Remove old/duplicate Python files in root
echo ""
echo "5. Cleaning old root-level Python files..."
remove_file "app.py"
remove_file "config.py"
remove_file "filesystem.py"
remove_file "image_processing.py"
remove_file "job.py"
remove_file "macos_package.py"
remove_file "utils.py"
remove_file "process_charles_photos.py"

# 6. Remove duplicate/old documentation
echo ""
echo "6. Cleaning duplicate documentation..."
remove_file "README (2).md"
remove_file "plan.md"
remove_file "ARCHITECTURE.md"

# 7. Archive old CLI/GUI directories (move to archive folder)
echo ""
echo "7. Archiving old CLI/GUI directories..."
if [ -d "cli" ] || [ -d "gui" ] || [ -d "photopackager" ] || [ -d "tests" ] || [ -d "assets" ]; then
    mkdir -p "_archive_old_editions"

    if [ -d "cli" ]; then
        echo "  Moving cli/ to _archive_old_editions/"
        mv cli _archive_old_editions/ 2>/dev/null || true
        ((total_deleted++))
    fi

    if [ -d "gui" ]; then
        echo "  Moving gui/ to _archive_old_editions/"
        mv gui _archive_old_editions/ 2>/dev/null || true
        ((total_deleted++))
    fi

    if [ -d "photopackager" ]; then
        echo "  Moving photopackager/ to _archive_old_editions/"
        mv photopackager _archive_old_editions/ 2>/dev/null || true
        ((total_deleted++))
    fi

    if [ -d "tests" ]; then
        echo "  Moving tests/ to _archive_old_editions/"
        mv tests _archive_old_editions/ 2>/dev/null || true
        ((total_deleted++))
    fi

    if [ -d "assets" ]; then
        echo "  Moving assets/ to _archive_old_editions/"
        mv assets _archive_old_editions/ 2>/dev/null || true
        ((total_deleted++))
    fi

    if [ -d "web_app/tests" ]; then
        echo "  Moving web_app/tests/ to _archive_old_editions/"
        mv web_app/tests _archive_old_editions/ 2>/dev/null || true
        ((total_deleted++))
    fi
fi

# 8. Clean log files (keep current one)
echo ""
echo "8. Cleaning old log files..."
find . -maxdepth 1 -name "*.log.*" -o -name "*.log.old" 2>/dev/null | while read f; do
    remove_file "$f"
done

# 9. Remove any .pyc files
echo ""
echo "9. Cleaning compiled Python files..."
find . -type f -name "*.pyc" -delete 2>/dev/null && echo "  Removed .pyc files"

# Summary
echo ""
echo "========================================================================"
echo "Cleanup Summary"
echo "========================================================================"
echo "Total items removed/archived: $total_deleted"
echo ""

# Show remaining structure
echo "Current directory structure:"
echo ""
ls -lah | grep -v "^total" | awk '{print $9}' | grep -v "^\." | grep -v "^$" | sort

echo ""
echo "========================================================================"
echo "Cleanup Complete!"
echo "========================================================================"
echo ""
echo "Remaining important files:"
echo "  ✓ web_app/          - Active web application"
echo "  ✓ venv_quick/       - Python virtual environment"
echo "  ✓ test_*.py         - Test suites"
echo "  ✓ README.md         - Documentation"
echo "  ✓ COMPLETION_SUMMARY.md - Project completion report"
echo ""
echo "Archived (if existed):"
echo "  → _archive_old_editions/  - Old CLI/GUI implementations"
echo ""
