# Multi-Developer Development Setup Guide

This guide will help you set up the Stratic Plan development environment for collaborative development.

## 🌐 Cloud Development Option

**New!** You can now run services in the cloud so developers don't need Docker locally.

👉 **See `CLOUD_SETUP_SUMMARY.md` for quick start**  
👉 **See `CLOUD_SETUP_GUIDE.md` for detailed instructions**

**Recommended:** Use Supabase Cloud + Redis Cloud (free, 10-minute setup)

---

## Local Development Setup

If you prefer to run everything locally, follow the steps below.

## Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js** 20.x or later
- **Supabase CLI** (`npm install -g supabase` or `npx supabase`)
- **Git** for version control

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Stratic Plan"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Start Supabase to get the connection strings
npx supabase start

# Copy the values from the Supabase output into .env.local
# You'll need:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL
```

### 4. Start Backend Services

```bash
# Start Redis and optional tools
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker-compose -f docker-compose.dev.yml ps
```

### 5. Run Database Migrations

```bash
# Ensure all migrations are applied
npx supabase migration up --local

# Or reset the database (WARNING: deletes all data)
npx supabase db reset --local
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **Supabase API**: http://localhost:54321
- **Redis**: localhost:6379

## Optional Tools

### Start with Development Tools

```bash
# Start Redis + pgAdmin + Redis Commander
docker-compose -f docker-compose.dev.yml --profile tools up -d
```

Access:
- **pgAdmin**: http://localhost:5050 (admin@straticplan.local / admin)
- **Redis Commander**: http://localhost:8081

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Next.js App | 3000 | Main application |
| Supabase API | 54321 | Backend API |
| Supabase DB | 54322 | PostgreSQL database |
| Supabase Studio | 54323 | Database management UI |
| Mailpit | 54324 | Email testing |
| Redis | 6379 | Cache service |
| pgAdmin | 5050 | Database admin (optional) |
| Redis Commander | 8081 | Redis GUI (optional) |

## Multi-Developer Workflow

### Shared Development Database

**Option 1: Local Supabase (Recommended for Development)**
- Each developer runs Supabase locally
- Migrations are version-controlled
- Each developer has their own data

**Option 2: Shared Remote Database**
- Use a shared Supabase project
- All developers connect to the same database
- Coordinate migrations carefully

### Working with Migrations

```bash
# Create a new migration
npx supabase migration new migration_name

# Apply pending migrations
npx supabase migration up --local

# Check migration status
npx supabase migration list --local

# Reset database (WARNING: deletes all data)
npx supabase db reset --local
```

### Database Backup and Restore

```bash
# Backup database
npx supabase db dump --local -f backup.sql

# Restore from backup
npx supabase db reset --local
psql -h localhost -p 54322 -U postgres -d postgres < backup.sql
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```bash
# Supabase Configuration (get these from: npx supabase status)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database Connection
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Redis Configuration
REDIS_URL=redis://:dev-redis-password@localhost:6379
REDIS_PASSWORD=dev-redis-password
```

### Optional Variables

```bash
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI/ML Services
PERPLEXITY_API_KEY=your_key_here

# Email (for production)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password

# Error Tracking
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn

# Security
SESSION_SECRET=dev-session-secret-change-in-production
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Troubleshooting

### Port Conflicts

If ports are already in use:

```bash
# Check what's using the ports
lsof -i :3000
lsof -i :54321
lsof -i :54322
lsof -i :6379

# Stop conflicting services or change ports in:
# - docker-compose.dev.yml (for Redis)
# - supabase/config.toml (for Supabase)
```

### Supabase Not Starting

```bash
# Stop all Supabase containers
npx supabase stop

# Remove old containers
docker ps -a | grep supabase | awk '{print $1}' | xargs docker rm -f

# Start fresh
npx supabase start
```

### Redis Connection Issues

```bash
# Check Redis is running
docker-compose -f docker-compose.dev.yml ps redis

# Check Redis logs
docker-compose -f docker-compose.dev.yml logs redis

# Restart Redis
docker-compose -f docker-compose.dev.yml restart redis
```

### Database Migration Issues

```bash
# Check migration status
npx supabase migration list --local

# If migrations are stuck, reset (WARNING: deletes data)
npx supabase db reset --local
```

### Clear All Data and Start Fresh

```bash
# Stop all services
npx supabase stop
docker-compose -f docker-compose.dev.yml down -v

# Remove Supabase volumes
docker volume ls | grep supabase | awk '{print $2}' | xargs docker volume rm

# Start fresh
npx supabase start
docker-compose -f docker-compose.dev.yml up -d
```

## Development Workflow

### Daily Workflow

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Check for new migrations**
   ```bash
   npx supabase migration list --local
   ```

3. **Apply migrations**
   ```bash
   npx supabase migration up --local
   ```

4. **Start services**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   npm run dev
   ```

### Creating Migrations

1. **Make database changes** (via Supabase Studio or direct SQL)

2. **Generate migration**
   ```bash
   npx supabase db diff -f migration_name
   ```

3. **Review the generated migration file**

4. **Test locally**
   ```bash
   npx supabase db reset --local
   ```

5. **Commit migration**
   ```bash
   git add supabase/migrations/
   git commit -m "feat: add migration_name"
   ```

## Best Practices

1. **Never commit `.env.local`** - Use `.env.example` as template
2. **Always test migrations locally** before pushing
3. **Use descriptive migration names** - Include date and description
4. **Coordinate on shared database** - Communicate before running destructive operations
5. **Backup before major changes** - Use `npx supabase db dump`
6. **Keep dependencies updated** - Run `npm update` regularly

## Additional Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Documentation](https://nextjs.org/docs)

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs: `npx supabase logs`
3. Check Docker logs: `docker-compose -f docker-compose.dev.yml logs`
4. Ask in team chat or create an issue

