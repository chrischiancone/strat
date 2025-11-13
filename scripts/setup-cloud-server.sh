#!/bin/bash

# Cloud Server Setup Script
# Run this on your VPS/cloud server to set up the shared development environment

set -e

echo "🚀 Setting up Stratic Plan Cloud Development Server"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (sudo ./setup-cloud-server.sh)"
    exit 1
fi

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    apt-get update
    apt-get install -y docker-compose-plugin
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Create app directory
APP_DIR="/opt/stratic-plan"
if [ ! -d "$APP_DIR" ]; then
    echo "📁 Creating app directory..."
    mkdir -p $APP_DIR
    echo "✅ Directory created: $APP_DIR"
else
    echo "✅ Directory exists: $APP_DIR"
fi

cd $APP_DIR

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    if [ -f .env.cloud.example ]; then
        cp .env.cloud.example .env
        echo "⚠️  Please edit .env with your passwords and configuration"
        echo "   Run: nano $APP_DIR/.env"
    else
        echo "⚠️  .env.cloud.example not found. Creating basic .env..."
        cat > .env << 'EOF'
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
JWT_SECRET=CHANGE_THIS_JWT_SECRET_32_CHARS_MIN
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD
SITE_URL=http://YOUR_SERVER_IP:3000
PUBLIC_URL=http://YOUR_SERVER_IP:54321
EOF
        echo "⚠️  Please edit .env with your configuration"
    fi
else
    echo "✅ .env file already exists"
fi

# Set up firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 54321/tcp # Supabase API
ufw allow 54322/tcp # Database
ufw allow 54323/tcp # Supabase Studio
ufw allow 6379/tcp  # Redis
ufw allow 54324/tcp # Mailpit
ufw --force enable
echo "✅ Firewall configured"

# Create systemd service for auto-start
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/stratic-plan.service << EOF
[Unit]
Description=Stratic Plan Development Services
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/docker compose -f docker-compose.cloud.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.cloud.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable stratic-plan.service
echo "✅ Systemd service created"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit configuration: nano $APP_DIR/.env"
echo "2. Start services: cd $APP_DIR && docker compose -f docker-compose.cloud.yml up -d"
echo "3. Check status: docker compose -f docker-compose.cloud.yml ps"
echo "4. View logs: docker compose -f docker-compose.cloud.yml logs -f"
echo ""
echo "Services will be available at:"
echo "  - Supabase API: http://YOUR_SERVER_IP:54321"
echo "  - Supabase Studio: http://YOUR_SERVER_IP:54323"
echo "  - Database: YOUR_SERVER_IP:54322"
echo "  - Redis: YOUR_SERVER_IP:6379"
echo "  - Mailpit: http://YOUR_SERVER_IP:54324"

