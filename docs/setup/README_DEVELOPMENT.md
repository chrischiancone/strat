# Quick Start Guide for Developers

## 🚀 Getting Started in 5 Minutes

### 1. Prerequisites Check
```bash
# Check Docker
docker --version

# Check Node.js (should be 20.x or later)
node --version

# Check npm
npm --version
```

### 2. Initial Setup (First Time Only)
```bash
# Install dependencies
npm install

# Run automated setup
npm run dev:setup
```

This will:
- ✅ Install all npm packages
- ✅ Create `.env.local` from template
- ✅ Start Supabase
- ✅ Start Redis and other services
- ✅ Run database migrations
- ✅ Show you the configuration values

### 3. Configure Environment
After running setup, copy the Supabase credentials shown in the output to your `.env.local` file.

### 4. Start Development
```bash
# Start all backend services
npm run dev:start

# In another terminal, start the Next.js app
npm run dev
```

### 5. Access the Application
- **App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **API**: http://localhost:54321

## 📋 Daily Workflow

### Starting Work
```bash
# Pull latest changes
git pull

# Start services
npm run dev:start

# Check for new migrations
npm run db:status

# Apply migrations if needed
npm run db:migrate

# Start dev server
npm run dev
```

### Stopping Work
```bash
# Stop services (optional - keeps Supabase running)
npm run dev:stop

# Or just stop Docker services
npm run dev:services:down
```

## 🛠️ Common Commands

```bash
# Database
npm run db:migration          # Create new migration
npm run db:migrate            # Apply migrations
npm run db:status             # Check migration status
npm run db:reset              # Reset database (WARNING: deletes data)

# Services
npm run dev:start             # Start all services
npm run dev:stop              # Stop all services
npm run dev:services          # Start Docker services only
npm run dev:services:down     # Stop Docker services
npm run dev:services:logs     # View service logs

# Development
npm run dev                   # Start Next.js dev server
npm run build                 # Build for production
npm run lint                  # Run linter
npm run test                  # Run tests
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000
lsof -i :54321
lsof -i :54322
lsof -i :6379

# Kill the process or change ports in config files
```

### Services Won't Start
```bash
# Check Docker is running
docker ps

# Check service logs
npm run dev:services:logs

# Restart everything
npm run dev:stop
npm run dev:start
```

### Database Issues
```bash
# Check Supabase status
npx supabase status

# View Supabase logs
npx supabase logs

# Reset database (WARNING: deletes all data)
npm run db:reset
```

### Redis Connection Issues
```bash
# Check Redis is running
docker ps | grep redis

# Restart Redis
docker-compose -f docker-compose.dev.yml restart redis

# Test Redis connection
docker exec stratic-plan-redis redis-cli -a dev-redis-password ping
```

## 📚 More Information

For detailed setup instructions, see [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)

## 💡 Tips

1. **Keep Supabase running** - It's faster to leave it running between sessions
2. **Use Supabase Studio** - Great for viewing data and testing queries
3. **Check logs** - Use `npm run dev:services:logs` to debug issues
4. **Backup before major changes** - Use `npm run db:backup`
5. **Coordinate migrations** - Communicate with team before running destructive operations

## 🆘 Need Help?

1. Check the troubleshooting section
2. Review [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
3. Check service logs
4. Ask in team chat

