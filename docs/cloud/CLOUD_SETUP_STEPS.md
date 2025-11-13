# Cloud Setup - Step by Step

## ✅ Step 1: Supabase Cloud - COMPLETE!

Your project is linked and migrations are pushed:
- **Project URL**: https://jmdbxoapgedlvdyydicf.supabase.co
- **Anon Key**: (you have this)
- **Migrations**: All 40 migrations applied successfully

## 🔑 Step 2: Get Service Role Key

1. Go to: https://supabase.com/dashboard/project/jmdbxoapgedlvdyydicf
2. Click **Settings** (gear icon) in the left sidebar
3. Click **API** in the settings menu
4. Scroll to **Project API keys**
5. Find **`service_role`** key (NOT the anon key)
6. Click **Copy** or **Reveal** to see it
7. **⚠️ Keep this secret!** It has admin access to your database

## 🔴 Step 3: Set Up Redis Cloud

### Option A: Redis Cloud (Free Tier)

1. Go to: https://redis.com/try-free/
2. Sign up (free account)
3. Click **Create Database**
4. Choose **Free** tier
5. Select region closest to you
6. Click **Activate**
7. Wait for database to be created (~1 minute)
8. Click on your database
9. Copy the connection details:
   - **Endpoint**: `redis-xxxxx.cloud.redislabs.com`
   - **Port**: `12345` (or shown port)
   - **Password**: (shown in connection details)

### Option B: Use Local Redis (Temporary)

If you want to test without Redis Cloud first:
```bash
# Start local Redis
docker-compose -f docker-compose.dev.yml up -d redis

# Use in .env.local:
REDIS_URL=redis://:dev-redis-password@localhost:6379
```

## 📝 Step 4: Update .env.local

Create or update your `.env.local` file with:

```bash
# Supabase Cloud
NEXT_PUBLIC_SUPABASE_URL=https://jmdbxoapgedlvdyydicf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZGJ4b2FwZ2VkbHZkeXlkaWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTIxNzYsImV4cCI6MjA3ODYyODE3Nn0._6Zvy_hoKJHDl3uZxtZ7Wj-urtZxu3MvDFls3-IsDnA
SUPABASE_SERVICE_ROLE_KEY=<GET_FROM_SUPABASE_DASHBOARD>

# Redis Cloud (after you set it up)
REDIS_URL=redis://default:<PASSWORD>@redis-xxxxx.cloud.redislabs.com:12345
REDIS_PASSWORD=<YOUR_REDIS_PASSWORD>

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Optional - for direct connections)
# Get from Supabase Dashboard > Settings > Database > Connection string
# DATABASE_URL=postgresql://postgres.jmdbxoapgedlvdyydicf:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## 🚀 Step 5: Test the Setup

```bash
# Start the dev server
npm run dev

# Should connect to cloud Supabase and Redis
```

## 👥 Step 6: Share with Remote Developer

1. Share the `.env.local` template (without actual passwords)
2. They need to:
   - Get their own Supabase account, OR
   - You share the service_role key securely (use password manager)
   - Set up their own Redis Cloud account, OR
   - You share Redis credentials securely

**Recommended**: Each developer gets their own free Supabase and Redis Cloud accounts for development.

## 📋 Checklist

- [x] Supabase project created
- [x] Project linked locally
- [x] Migrations pushed
- [ ] Service role key obtained
- [ ] Redis Cloud set up
- [ ] .env.local updated
- [ ] Tested connection
- [ ] Shared with team

## 🔐 Security Notes

1. **Never commit** `.env.local` to Git
2. **Use password manager** to share credentials
3. **Service role key** has full database access - keep secret!
4. **Rotate credentials** if shared publicly

## 🆘 Troubleshooting

### Can't find service_role key?
- Make sure you're in **Settings > API**
- Look for **Project API keys** section
- It's labeled **`service_role`** (secret)

### Redis connection fails?
- Check the endpoint and port
- Verify password is correct
- Make sure Redis Cloud database is active

### Database connection issues?
- Verify Supabase project is active
- Check that migrations completed successfully
- Try refreshing the Supabase dashboard

