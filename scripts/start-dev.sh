#!/bin/bash

# Quick start script for development
# Starts all required services

set -e

echo "🚀 Starting Stratic Plan Development Environment"
echo ""

# Check if Supabase is running
if ! npx supabase status &> /dev/null; then
    echo "🗄️  Starting Supabase..."
    npx supabase start
else
    echo "✅ Supabase is already running"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 3

# Check service status
echo ""
echo "📊 Service Status:"
echo ""

if npx supabase status &> /dev/null; then
    echo "✅ Supabase: Running"
    echo "   - API: http://localhost:54321"
    echo "   - Studio: http://localhost:54323"
    echo "   - Database: localhost:54322"
else
    echo "❌ Supabase: Not running"
fi

if docker ps | grep -q stratic-plan-redis; then
    echo "✅ Redis: Running (localhost:6379)"
else
    echo "❌ Redis: Not running"
fi

echo ""
echo "✨ All services started!"
echo ""
echo "Start the Next.js dev server with: npm run dev"
echo "Then access the app at: http://localhost:3000"

