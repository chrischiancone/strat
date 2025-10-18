# Strategic Planning System - Hosting Migration Guide

## Current Setup Analysis

Your application currently uses:
- **Next.js 14** with App Router (frontend)
- **Supabase Local** (PostgreSQL + Auth + Storage + Realtime)
- **Local development** on `localhost:3001` with Supabase on `127.0.0.1:54321`
- **Database migrations** with 19 migration files
- **File storage** for attachments and documents
- **Email functionality** via Nodemailer

## Hosting Options (Open Source Aligned)

### Option 1: Self-Hosted Infrastructure (Recommended)
**Best for**: Full control, cost-effective, open source philosophy

#### Frontend Hosting
- **Coolify** (Self-hosted Vercel alternative)
- **CapRover** (Self-hosted PaaS)
- **Docker + Nginx** on VPS
- **Netlify** (has free tier, open source friendly)

#### Database & Backend
- **Self-hosted Supabase** (Open source PostgreSQL + APIs)
- **Standalone PostgreSQL** + custom APIs
- **Supabase Cloud** (managed but built on open source)

#### Infrastructure Providers
- **Hetzner** (EU-based, privacy-focused, cost-effective)
- **DigitalOcean** (developer-friendly)
- **Linode/Akamai** (good performance/price)
- **OVHcloud** (European, competitive pricing)

### Option 2: Hybrid Approach
- **Frontend**: Vercel/Netlify (free tiers available)
- **Database**: Self-hosted PostgreSQL or Supabase
- **Storage**: MinIO (self-hosted S3 alternative)

### Option 3: Fully Managed (Open Source Stack)
- **Railway** (PostgreSQL + Next.js deployment)
- **Supabase Cloud** (managed but open source based)
- **PlanetScale** (MySQL-based, has free tier)

## Recommended Migration Path: Self-Hosted Supabase + VPS

### Phase 1: Infrastructure Setup

#### 1.1 Server Selection
```bash
# Recommended specs for municipal government use:
# - 4 vCPU, 8GB RAM, 160GB SSD (Hetzner CX31: ~€15/month)
# - Ubuntu 22.04 LTS
# - Additional backup storage
```

#### 1.2 Domain & DNS Setup
```bash
# Purchase domain or use subdomain
# Example: strategic-plan.yourdomain.com
# Set up DNS records:
# A record: strategic-plan.yourdomain.com -> YOUR_SERVER_IP
# A record: api.strategic-plan.yourdomain.com -> YOUR_SERVER_IP
```

#### 1.3 Server Initial Setup
```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-plugin -y

# Install Node.js (for building)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Create application directory
mkdir -p /opt/strategic-plan
cd /opt/strategic-plan
```

### Phase 2: Database Migration

#### 2.1 Self-Hosted Supabase Setup
```yaml
# docker-compose.yml for Supabase
version: '3.8'

services:
  postgres:
    image: supabase/postgres:17.3.0
    container_name: strategic_plan_db
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  supabase-kong:
    image: supabase/kong:2.8.1
    container_name: strategic_plan_kong
    restart: unless-stopped
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong.yml
      KONG_DNS_ORDER: LAST,A,CNAME
      KONG_PLUGINS: request-transformer,cors,key-auth,acl
    volumes:
      - ./kong.yml:/kong.yml
    ports:
      - "8000:8000"

  supabase-auth:
    image: supabase/gotrue:v2.158.1
    container_name: strategic_plan_auth
    restart: unless-stopped
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres?search_path=auth
      GOTRUE_SITE_URL: https://strategic-plan.yourdomain.com
      GOTRUE_URI_ALLOW_LIST: https://strategic-plan.yourdomain.com
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_JWT_EXP: 3600
    depends_on:
      - postgres

  supabase-rest:
    image: postgrest/postgrest:v12.2.3
    container_name: strategic_plan_rest
    restart: unless-stopped
    environment:
      PGRST_DB_URI: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres
      PGRST_DB_SCHEMAS: public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  supabase-realtime:
    image: supabase/realtime:v2.28.32
    container_name: strategic_plan_realtime
    restart: unless-stopped
    environment:
      PORT: 4000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: postgres
      DB_SSL: "false"
      SECRET_KEY_BASE: ${REALTIME_SECRET_KEY_BASE}
    depends_on:
      - postgres

  supabase-storage:
    image: supabase/storage-api:v1.11.1
    container_name: strategic_plan_storage
    restart: unless-stopped
    environment:
      ANON_KEY: ${ANON_KEY}
      SERVICE_KEY: ${SERVICE_ROLE_KEY}
      POSTGREST_URL: http://supabase-rest:3000
      PGOPTIONS: -c search_path=storage,public
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/postgres
      FILE_SIZE_LIMIT: 52428800
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
      TENANT_ID: strategic-plan
      REGION: us-east-1
      GLOBAL_S3_BUCKET: strategic-plan
    volumes:
      - storage_data:/var/lib/storage
    depends_on:
      - postgres
      - supabase-rest

volumes:
  postgres_data:
  storage_data:
```

#### 2.2 Environment Configuration
```bash
# Create .env file
cat > .env << EOF
POSTGRES_PASSWORD=your_secure_postgres_password_here
JWT_SECRET=your_jwt_secret_256_bit_key_here
ANON_KEY=your_anon_key_here
SERVICE_ROLE_KEY=your_service_role_key_here
REALTIME_SECRET_KEY_BASE=your_realtime_secret_key_base_here
EOF

# Secure the environment file
chmod 600 .env
```

#### 2.3 Database Migration
```bash
# Copy your migration files
cp -r /path/to/local/supabase/migrations ./supabase/

# Start the database
docker-compose up -d postgres

# Wait for database to be ready
sleep 30

# Run migrations
docker exec strategic_plan_db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/20250109000001_create_core_tables.sql
# Continue for all migration files...

# Or use Supabase CLI to migrate
supabase db push --db-url postgresql://postgres:${POSTGRES_PASSWORD}@YOUR_SERVER_IP:5432/postgres
```

### Phase 3: Application Deployment

#### 3.1 Application Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 3.2 Docker Compose for Full Stack
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  app:
    build: .
    container_name: strategic_plan_app
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=https://api.strategic-plan.yourdomain.com
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_APP_URL=https://strategic-plan.yourdomain.com
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - supabase-kong

  nginx:
    image: nginx:alpine
    container_name: strategic_plan_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

#### 3.3 Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }
    
    upstream supabase {
        server supabase-kong:8000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name strategic-plan.yourdomain.com api.strategic-plan.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # Main application
    server {
        listen 443 ssl http2;
        server_name strategic-plan.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Supabase API
    server {
        listen 443 ssl http2;
        server_name api.strategic-plan.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

        location / {
            proxy_pass http://supabase;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Phase 4: SSL and Security

#### 4.1 SSL Certificate Setup
```bash
# Install Certbot
snap install core; snap refresh core
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificates
certbot certonly --standalone -d strategic-plan.yourdomain.com -d api.strategic-plan.yourdomain.com

# Copy certificates to nginx directory
mkdir -p /opt/strategic-plan/ssl
cp /etc/letsencrypt/live/strategic-plan.yourdomain.com/fullchain.pem /opt/strategic-plan/ssl/cert.pem
cp /etc/letsencrypt/live/strategic-plan.yourdomain.com/privkey.pem /opt/strategic-plan/ssl/key.pem

# Set up automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /opt/strategic-plan/docker-compose.production.yml restart nginx" | crontab -
```

#### 4.2 Firewall Configuration
```bash
# Configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Phase 5: Deployment Process

#### 5.1 Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Build and deploy
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

echo "✅ Deployment complete!"
echo "🌐 App: https://strategic-plan.yourdomain.com"
echo "📊 API: https://api.strategic-plan.yourdomain.com"

# Check health
sleep 30
if curl -f -s https://strategic-plan.yourdomain.com > /dev/null; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi
```

#### 5.2 Environment Variables for Production
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://api.strategic-plan.yourdomain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://strategic-plan.yourdomain.com
NODE_ENV=production

# Email configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## Phase 6: Monitoring and Maintenance

### 6.1 Monitoring Setup
```yaml
# Add to docker-compose.production.yml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin_password
    volumes:
      - grafana_data:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
```

### 6.2 Backup Strategy
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker exec strategic_plan_db pg_dump -U postgres postgres | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /opt/strategic-plan/storage_data

# Upload to remote backup (optional)
# rsync -av $BACKUP_DIR/ user@backup-server:/backups/strategic-plan/

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 6.3 Update Process
```bash
#!/bin/bash
# update.sh

echo "📦 Updating Strategic Planning System..."

# Backup before update
./backup.sh

# Pull updates
git pull origin main

# Update dependencies
npm ci

# Rebuild and deploy
docker-compose -f docker-compose.production.yml build --no-cache app
docker-compose -f docker-compose.production.yml up -d

echo "✅ Update complete!"
```

## Cost Estimation

### Self-Hosted Option (Monthly)
- **VPS (Hetzner CX31)**: €15 (~$16)
- **Domain**: $12/year (~$1/month)
- **Backup Storage**: €3 (~$3)
- **Total**: ~$20/month

### Hybrid Option (Monthly)
- **Vercel Pro**: $20
- **Database VPS**: $10
- **Storage**: $5
- **Total**: ~$35/month

### Fully Managed (Monthly)
- **Vercel Pro**: $20
- **Supabase Pro**: $25
- **Total**: ~$45/month

## Migration Checklist

### Pre-Migration
- [ ] Server setup and configuration
- [ ] Domain and DNS configuration
- [ ] SSL certificates obtained
- [ ] Database backup created
- [ ] Environment variables configured

### Migration Day
- [ ] Deploy database with migrations
- [ ] Deploy application
- [ ] Configure reverse proxy
- [ ] Test all functionality
- [ ] Update DNS records
- [ ] Verify SSL certificates

### Post-Migration
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update development team
- [ ] Document new deployment process
- [ ] Schedule regular maintenance

## Troubleshooting

### Common Issues
1. **Database connection issues**: Check firewall and connection strings
2. **SSL certificate problems**: Verify domain ownership and certificate paths
3. **File upload issues**: Check storage configuration and permissions
4. **Email not working**: Verify SMTP settings and authentication

### Log Locations
- Application logs: `docker logs strategic_plan_app`
- Database logs: `docker logs strategic_plan_db`
- Nginx logs: `docker logs strategic_plan_nginx`

## Alternative Hosting Options

### Quick Deploy Options
- **Railway**: One-click deployment with PostgreSQL
- **Render**: Free tier available, automatic deployments
- **Fly.io**: Global deployment, reasonable pricing

### Enterprise Options
- **AWS ECS/RDS**: Full AWS ecosystem
- **Google Cloud Run**: Serverless container deployment
- **Azure Container Instances**: Microsoft cloud solution

Would you like me to help you implement any specific part of this migration plan?