#!/bin/bash

# Script to clean up temporary and debug files before sharing codebase

set -e

echo "🧹 Cleaning up temporary files..."

# Remove temporary files
echo "Removing temporary files..."
rm -f 1.txt
rm -f debug-settings.js
rm -f diagnose-perplexity.js
rm -f find-valid-models.js
rm -f migrate-to-cloud.js
rm -f test-deployment.js
rm -f test-upload.js
rm -f dev.log
rm -f server.log
rm -f next
rm -f strat_plan@0.1.0

# Remove temporary SQL files (after verifying they're in migrations)
echo "Removing temporary SQL files..."
rm -f TEMP_RLS_FIX.sql

echo "✅ Temporary files cleaned up!"
echo ""
echo "Note: SQL files and documentation have been organized."
echo "Run './scripts/organize-docs.sh' to organize documentation files."

