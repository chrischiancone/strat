#!/bin/bash

# Stop development environment script

set -e

echo "🛑 Stopping Stratic Plan Development Environment"
echo ""

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker-compose -f docker-compose.dev.yml down

# Stop Supabase (optional - comment out if you want to keep it running)
read -p "Stop Supabase? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Stopping Supabase..."
    npx supabase stop
else
    echo "ℹ️  Keeping Supabase running"
fi

echo ""
echo "✅ Development environment stopped"

