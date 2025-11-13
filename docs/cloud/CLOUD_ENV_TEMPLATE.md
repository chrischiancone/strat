# Cloud Environment Variables Template

Copy these to your `.env` file on the cloud server or `.env.local` for cloud development.

## For Supabase Cloud + Redis Cloud (Recommended)

```bash
# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Direct Connection - Optional)
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Redis Cloud Configuration
REDIS_URL=redis://default:[PASSWORD]@redis-xxxxx.cloud.redislabs.com:12345
REDIS_PASSWORD=your_redis_password

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## For VPS Docker Setup

```bash
# Database
POSTGRES_PASSWORD=generate-with-scripts/generate-cloud-keys.sh
DATABASE_URL=postgresql://postgres:POSTGRES_PASSWORD@your-server-ip:54322/postgres

# JWT Secrets (generate with scripts/generate-cloud-keys.sh)
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
JWT_EXP=3600
REALTIME_SECRET_KEY_BASE=your-secret-key-base-32-chars-minimum

# Supabase Keys (get from docker logs after first start)
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Redis
REDIS_PASSWORD=generate-with-scripts/generate-cloud-keys.sh
REDIS_URL=redis://:REDIS_PASSWORD@your-server-ip:6379

# URLs
SITE_URL=http://your-server-ip:3000
PUBLIC_URL=http://your-server-ip:54321
URI_ALLOW_LIST=http://localhost:3000,http://your-server-ip:3000
```

## Developer .env.local (Pointing to Cloud)

```bash
# Point to cloud server instead of localhost
NEXT_PUBLIC_SUPABASE_URL=http://your-server-ip:54321
# OR for Supabase Cloud:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-cloud>
SUPABASE_SERVICE_ROLE_KEY=<from-cloud>
DATABASE_URL=postgresql://postgres:password@your-server-ip:54322/postgres
REDIS_URL=redis://:password@your-server-ip:6379
```

## Security Notes

1. **Generate strong passwords**: Use `npm run cloud:keys`
2. **Never commit** actual passwords to Git
3. **Use password manager** to share credentials
4. **Rotate regularly**: Change passwords monthly
5. **Restrict access**: Use IP whitelisting if possible

