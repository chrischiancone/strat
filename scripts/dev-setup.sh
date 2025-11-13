#!/bin/bash

# Development Environment Setup Script
# This script helps set up the development environment for new developers

set -e

echo "🚀 Setting up Stratic Plan Development Environment"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.x or later."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Set up environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo "⚠️  Please update .env.local with your configuration values"
else
    echo "✅ .env.local already exists"
fi
echo ""

# Start Supabase
echo "🗄️  Starting Supabase..."
if ! npx supabase status &> /dev/null; then
    echo "Starting Supabase for the first time..."
    npx supabase start
else
    echo "Supabase is already running"
    npx supabase status
fi
echo ""

# Extract Supabase credentials
echo "📋 Supabase Configuration:"
echo "Copy these values to your .env.local file:"
echo ""
npx supabase status | grep -E "(API URL|anon key|service_role key|Database URL)" || true
echo ""

# Start Docker services
echo "🐳 Starting Docker services (Redis, etc.)..."
docker-compose -f docker-compose.dev.yml up -d
echo "✅ Docker services started"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
if npx supabase migration up --local; then
    echo "✅ Migrations applied"
else
    echo "⚠️  Some migrations may have failed (this is OK if tables already exist)"
    echo "ℹ️  Checking migration status..."
    npx supabase migration list --local || true
fi
echo ""

# Verify services
echo "🔍 Verifying services..."
echo ""

# Check Supabase
if npx supabase status &> /dev/null; then
    echo "✅ Supabase is running"
else
    echo "❌ Supabase is not running"
fi

# Check Redis
if docker ps | grep -q stratic-plan-redis; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with Supabase credentials (shown above)"
echo "2. Start the development server: npm run dev"
echo "3. Access the application at http://localhost:3000"
echo "4. Access Supabase Studio at http://localhost:54323"
echo ""
echo "For more information, see DEVELOPMENT_SETUP.md"

