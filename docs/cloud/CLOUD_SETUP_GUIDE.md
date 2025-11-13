# Cloud Development Setup - Quick Guide

## 🎯 Recommended: Supabase Cloud + Redis Cloud (Free)

This is the **easiest and cheapest** option - no VPS needed!

### Setup Steps

1. **Create Supabase Cloud Project** (5 min)
   - Go to https://supabase.com
   - New Project → "Stratic Plan Dev"
   - Save the password!

2. **Get Credentials**
   - Project Settings → API
   - Copy: URL, anon key, service_role key

3. **Push Migrations**
   ```bash
   npx supabase link --project-ref <your-ref>
   npx supabase db push
   ```

4. **Set Up Redis Cloud** (5 min)
   - Go to https://redis.com/try-free/
   - Create free database
   - Copy connection string

5. **Update .env.local**
   ```bash
   # Use cloud URLs instead of localhost
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   REDIS_URL=redis://default:password@redis-xxxxx.cloud.redislabs.com:12345
   ```

6. **Share with Team**
   - Share `.env.local` template (without passwords)
   - Use password manager for actual credentials

### Benefits
- ✅ **Free** (both services have free tiers)
- ✅ **No server management**
- ✅ **Automatic backups**
- ✅ **Easy to set up**
- ✅ **Works immediately**

---

## 🖥️ Alternative: VPS with Docker (Full Control)

If you want everything on one server:

### Quick Setup

1. **Provision VPS** ($5-20/month)
   - DigitalOcean, Linode, Vultr, AWS EC2
   - Ubuntu 22.04, 2GB RAM minimum

2. **Run Setup Script**
   ```bash
   # On your local machine
   scp docker-compose.cloud.yml root@your-server-ip:/opt/
   scp scripts/setup-cloud-server.sh root@your-server-ip:/opt/
   
   # On server
   ssh root@your-server-ip
   cd /opt
   chmod +x setup-cloud-server.sh
   ./setup-cloud-server.sh
   ```

3. **Configure**
   ```bash
   cd /opt/stratic-plan
   nano .env  # Edit with generated passwords
   ```

4. **Start Services**
   ```bash
   docker compose -f docker-compose.cloud.yml up -d
   ```

5. **Get Connection Info**
   ```bash
   # Get anon key
   docker logs stratic-plan-postgrest | grep anon
   
   # Or access Studio
   # http://your-server-ip:54323
   ```

### Developer Setup

Each developer updates `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://your-server-ip:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-server>
SUPABASE_SERVICE_ROLE_KEY=<from-server>
DATABASE_URL=postgresql://postgres:password@your-server-ip:54322/postgres
REDIS_URL=redis://:password@your-server-ip:6379
```

---

## 📊 Comparison

| Feature | Supabase Cloud | VPS Docker |
|---------|---------------|------------|
| **Cost** | Free | $5-20/mo |
| **Setup Time** | 10 min | 30 min |
| **Maintenance** | None | Medium |
| **Control** | Limited | Full |
| **Backups** | Automatic | Manual |
| **Scaling** | Easy | Manual |

---

## 🔐 Security Best Practices

1. **Use strong passwords** (generate with `scripts/generate-cloud-keys.sh`)
2. **Restrict database access** by IP if possible
3. **Use VPN** for sensitive access
4. **Rotate credentials** monthly
5. **Monitor access logs**
6. **Never commit** `.env` files

---

## 🚀 Quick Start Commands

### For Supabase Cloud:
```bash
# Link to cloud
npx supabase link --project-ref <ref>

# Push migrations
npx supabase db push

# Update .env.local with cloud URLs
# Start dev server
npm run dev
```

### For VPS:
```bash
# On server
cd /opt/stratic-plan
docker compose -f docker-compose.cloud.yml up -d

# Check status
docker compose -f docker-compose.cloud.yml ps

# View logs
docker compose -f docker-compose.cloud.yml logs -f
```

---

## 📝 Migration Workflow (Cloud)

**Important**: Coordinate with your team!

```bash
# Developer 1 creates migration
npm run db:migration add_feature
# Edit and commit
git push

# Developer 2 applies
git pull
npx supabase db push  # Pushes to shared cloud DB
```

**⚠️ Only one person should push migrations at a time!**

---

## 💡 Recommendation

**For 2 developers**: Use **Supabase Cloud + Redis Cloud**
- Free
- Fast setup
- No maintenance
- Automatic backups

**For larger teams or more control**: Use **VPS with Docker**
- Full control
- Can customize
- Better for scaling
- More cost-effective at scale

