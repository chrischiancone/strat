#!/bin/bash

# Script to organize documentation files into proper directories

set -e

echo "📚 Organizing documentation files..."

# Create directories if they don't exist
mkdir -p docs/cloud docs/fixes docs/setup docs/database docs/sql docs/images

# Move cloud-related docs
echo "Moving cloud documentation..."
mv CLOUD_*.md docs/cloud/ 2>/dev/null || true
mv CLOUD_ENV_TEMPLATE.md docs/cloud/ 2>/dev/null || true

# Move fix-related docs
echo "Moving fix documentation..."
mv *_FIX.md docs/fixes/ 2>/dev/null || true
mv ENV_FIX_SUMMARY.md docs/fixes/ 2>/dev/null || true
mv COLLABORATION_FIX_GUIDE.md docs/fixes/ 2>/dev/null || true
mv COMMENT_ERROR_FIX.md docs/fixes/ 2>/dev/null || true

# Move setup docs
echo "Moving setup documentation..."
mv COLLABORATIVE_DEVELOPMENT_SETUP.md docs/setup/ 2>/dev/null || true
mv DEVELOPMENT_SETUP.md docs/setup/ 2>/dev/null || true
mv README_DEVELOPMENT.md docs/setup/ 2>/dev/null || true

# Move database docs
echo "Moving database documentation..."
mv MIGRATION_FIXES.md docs/database/ 2>/dev/null || true
mv DATABASE_OPERATIONS_FIX.md docs/database/ 2>/dev/null || true

# Move SQL files
echo "Moving SQL files..."
mv COLLABORATION_TABLES_SETUP.sql docs/sql/ 2>/dev/null || true
mv CHECK_COLLABORATION_TABLES.sql docs/sql/ 2>/dev/null || true
mv data_export.sql docs/sql/ 2>/dev/null || true

# Move images
echo "Moving images..."
mv "Screenshot 2025-10-12 at 10.31.00 AM.png" docs/images/ 2>/dev/null || true

# Move PDFs
echo "Moving PDFs..."
mv "FY25 WFS - Strategic Business Plan DRAFT.pdf" docs/ 2>/dev/null || true
mv "Strategic-Plan-Workforce-Services-2025-10-12.pdf" docs/ 2>/dev/null || true

echo "✅ Documentation organized!"
echo ""
echo "Documentation structure:"
echo "  docs/cloud/        - Cloud setup guides"
echo "  docs/fixes/        - Bug fix documentation"
echo "  docs/setup/        - Development setup guides"
echo "  docs/database/     - Database documentation"
echo "  docs/sql/          - SQL scripts"
echo "  docs/images/       - Images and screenshots"

