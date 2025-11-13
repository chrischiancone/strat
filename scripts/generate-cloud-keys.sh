#!/bin/bash

# Generate secure keys for cloud environment
# Run this to generate JWT secrets and passwords

echo "🔐 Generating secure keys for cloud environment"
echo ""

# Generate JWT Secret (32+ characters)
JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
echo "JWT_SECRET=$JWT_SECRET"

# Generate Realtime Secret
REALTIME_SECRET=$(openssl rand -base64 32 | tr -d '\n')
echo "REALTIME_SECRET_KEY_BASE=$REALTIME_SECRET"

# Generate Database Password
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '\n')
echo "POSTGRES_PASSWORD=$DB_PASSWORD"

# Generate Redis Password
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '\n')
echo "REDIS_PASSWORD=$REDIS_PASSWORD"

echo ""
echo "✅ Copy these values to your .env file on the cloud server"
echo "⚠️  Keep these secure and share only with your team!"

