#!/bin/bash

# Script to update .env.local with Supabase Cloud credentials

set -e

ENV_FILE=".env.local"
BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔄 Updating .env.local for Supabase Cloud"
echo ""

# Backup existing file
if [ -f "$ENV_FILE" ]; then
    echo "📦 Backing up existing .env.local..."
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE"
fi

# Check if file exists, create if not
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
    echo "📝 Created new .env.local file"
fi

# Update Supabase URL
echo "🔧 Updating Supabase URL..."
if grep -q "NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE"; then
    # Update existing
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://jmdbxoapgedlvdyydicf.supabase.co|' "$ENV_FILE"
    else
        # Linux
        sed -i 's|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://jmdbxoapgedlvdyydicf.supabase.co|' "$ENV_FILE"
    fi
else
    # Add new
    echo "NEXT_PUBLIC_SUPABASE_URL=https://jmdbxoapgedlvdyydicf.supabase.co" >> "$ENV_FILE"
fi

# Update Anon Key
echo "🔧 Updating Supabase Anon Key..."
if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$ENV_FILE"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZGJ4b2FwZ2VkbHZkeXlkaWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTIxNzYsImV4cCI6MjA3ODYyODE3Nn0._6Zvy_hoKJHDl3uZxtZ7Wj-urtZxu3MvDFls3-IsDnA|' "$ENV_FILE"
    else
        sed -i 's|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZGJ4b2FwZ2VkbHZkeXlkaWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTIxNzYsImV4cCI6MjA3ODYyODE3Nn0._6Zvy_hoKJHDl3uZxtZ7Wj-urtZxu3MvDFls3-IsDnA|' "$ENV_FILE"
    fi
else
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZGJ4b2FwZ2VkbHZkeXlkaWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTIxNzYsImV4cCI6MjA3ODYyODE3Nn0._6Zvy_hoKJHDl3uZxtZ7Wj-urtZxu3MvDFls3-IsDnA" >> "$ENV_FILE"
fi

echo ""
echo "✅ Updated Supabase Cloud credentials in .env.local"
echo ""
echo "⚠️  IMPORTANT: You still need to:"
echo "   1. Get your service_role key from Supabase Dashboard"
echo "   2. Update SUPABASE_SERVICE_ROLE_KEY in .env.local"
echo "   3. Set up Redis Cloud and add REDIS_URL"
echo ""
echo "📖 See CLOUD_SETUP_STEPS.md for complete instructions"

