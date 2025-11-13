# Cloud-Based Development Setup

This guide shows you how to set up a **shared cloud development environment** so developers don't need to run Docker services locally.

## 🎯 Options Overview

### Option 1: Supabase Cloud + Redis Cloud (Recommended)
- **Supabase**: Use free cloud project
- **Redis**: Redis Cloud free tier
- **Cost**: Free
- **Setup**: 10 minutes

### Option 2: Full Cloud VPS
- **Provider**: DigitalOcean, AWS EC2, Linode, etc.
- **Services**: All Docker services on one server
- **Cost**: ~$5-20/month
- **Setup**: 30 minutes

### Option 3: Managed Services (Railway/Render)
- **Provider**: Railway.app or Render.com
- **Services**: Managed containers
- **Cost**: Free tier available
- **Setup**: 15 minutes

---

## Option 1: Supabase Cloud + Redis Cloud (Easiest)

### Step 1: Create Supabase Cloud Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: Stratic Plan Dev
   - **Database Password**: (save this!)
   - **Region**: Choose closest to your team
5. Wait for project to be created (~2 minutes)

### Step 2: Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (keep secret!)

### Step 3: Link Local to Cloud

```bash
# Link your local project to cloud
npx supabase link --project-ref <your-project-ref>

# Push migrations to cloud
npx supabase db push
```

### Step 4: Set Up Redis Cloud

1. Go to https://redis.com/try-free/
2. Sign up for free account
3. Create a free database
4. Copy connection details:
   - **Host**: `redis-xxxxx.cloud.redislabs.com`
   - **Port**: `12345`
   - **Password**: (save this!)

### Step 5: Configure Environment

Create `.env.local` with cloud credentials:

```bash
# Supabase Cloud
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database (direct connection)
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Redis Cloud
REDIS_URL=redis://default:[PASSWORD]@redis-xxxxx.cloud.redislabs.com:12345
REDIS_PASSWORD=your_redis_password

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 6: Share with Team

1. Share the `.env.local` template (without actual passwords)
2. Each developer creates their own Supabase account OR
3. Share one Supabase project credentials (team account)

**⚠️ Security Note**: Use a team password manager (1Password, LastPass) to share credentials securely.

---

## Option 2: Full Cloud VPS Setup

### Step 1: Provision VPS

**Recommended Providers:**
- **DigitalOcean**: $6/month (1GB RAM) - https://digitalocean.com
- **Linode**: $5/month - https://linode.com
- **Vultr**: $6/month - https://vultr.com
- **AWS EC2**: Free tier available - https://aws.amazon.com

**Minimum Requirements:**
- 2GB RAM
- 1 CPU core
- 20GB storage
- Ubuntu 22.04 LTS

### Step 2: Set Up Server

```bash
# SSH into your server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install docker-compose-plugin -y

# Create app directory
mkdir -p /opt/stratic-plan
cd /opt/stratic-plan
```

### Step 3: Deploy Docker Compose

Upload `docker-compose.cloud.yml` (created below) to your server:

```bash
# On your local machine
scp docker-compose.cloud.yml root@your-server-ip:/opt/stratic-plan/
scp .env.cloud.example root@your-server-ip:/opt/stratic-plan/.env
```

### Step 4: Configure and Start

```bash
# On server
cd /opt/stratic-plan
nano .env  # Edit with your credentials

# Start services
docker compose -f docker-compose.cloud.yml up -d

# Check status
docker compose -f docker-compose.cloud.yml ps
```

### Step 5: Configure Firewall

```bash
# Allow necessary ports
ufw allow 22/tcp    # SSH
ufw allow 54321/tcp # Supabase API
ufw allow 54322/tcp # Database (optional, for direct access)
ufw allow 54323/tcp # Supabase Studio
ufw allow 6379/tcp  # Redis
ufw enable
```

### Step 6: Developer Configuration

Each developer updates `.env.local`:

```bash
# Point to cloud server
NEXT_PUBLIC_SUPABASE_URL=http://your-server-ip:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
DATABASE_URL=postgresql://postgres:password@your-server-ip:54322/postgres
REDIS_URL=redis://:password@your-server-ip:6379
```

---

## Option 3: Railway/Render (Managed)

### Railway Setup

1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Add services:
   - **PostgreSQL** (database)
   - **Redis** (cache)
   - **Supabase** (via custom Dockerfile)

### Render Setup

1. Go to https://render.com
2. Sign up
3. New → Web Service
4. Connect GitHub repo
5. Add services:
   - **PostgreSQL** database
   - **Redis** instance

---

## 🔧 Cloud Docker Compose Configuration

I'll create `docker-compose.cloud.yml` for you to deploy on a VPS.

---

## 📋 Comparison

| Option | Cost | Setup Time | Maintenance | Best For |
|--------|------|------------|-------------|----------|
| **Supabase Cloud + Redis Cloud** | Free | 10 min | Low | Small teams |
| **VPS with Docker** | $5-20/mo | 30 min | Medium | Full control |
| **Railway/Render** | Free-$20/mo | 15 min | Low | Easy deployment |

---

## 🔐 Security Considerations

### For Shared Cloud Environment:

1. **Use strong passwords** for all services
2. **Restrict database access** by IP (if possible)
3. **Use VPN** for database access (recommended)
4. **Rotate credentials** regularly
5. **Monitor access logs**
6. **Use environment-specific keys** (dev vs prod)

### IP Whitelisting (Supabase Cloud)

1. Go to Project Settings → Database
2. Add developer IPs to connection pooler
3. Or use connection string with IP restrictions

---

## 🚀 Quick Start: Supabase Cloud

```bash
# 1. Create Supabase project (web UI)
# 2. Get credentials

# 3. Link local project
npx supabase link --project-ref <your-ref>

# 4. Push migrations
npx supabase db push

# 5. Update .env.local with cloud URLs
# 6. Start Next.js
npm run dev
```

No Docker needed! 🎉

---

## 📝 Environment Template for Cloud

See `.env.cloud.example` for complete template.

---

## 🔄 Migration Workflow (Cloud)

```bash
# Developer 1 creates migration
npm run db:migration add_feature
# Edit migration file
git add supabase/migrations/
git commit -m "feat: add feature"
git push

# Developer 2 pulls and applies
git pull
npx supabase db push  # Pushes to cloud
```

**Important**: Coordinate migrations! Only one person should push at a time.

---

## 💡 Recommendations

**For 2 developers:**
- ✅ Use **Supabase Cloud** (free tier)
- ✅ Use **Redis Cloud** (free tier)
- ✅ No VPS needed
- ✅ Fastest setup

**For larger teams:**
- ✅ Use **VPS** with Docker Compose
- ✅ More control
- ✅ Can add more services
- ✅ Better for scaling

**For production-like dev:**
- ✅ Use **Railway** or **Render**
- ✅ Managed infrastructure
- ✅ Easy scaling
- ✅ Built-in monitoring

