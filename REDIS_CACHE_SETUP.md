# Redis Cache Implementation

## Overview
Full Redis caching system implementation for the Admin Settings Performance tab.

## What Was Done

### 1. Installed Redis Client
```bash
npm install ioredis --save
```

### 2. Created Docker Setup
**File:** `docker-compose.redis.yml`

Redis 7.4 Alpine container with:
- Port 6379 exposed
- Persistent data volume
- Health checks
- Auto-restart policy

**Start Redis:**
```bash
docker-compose -f docker-compose.redis.yml up -d
```

**Stop Redis:**
```bash
docker-compose -f docker-compose.redis.yml down
```

**View Logs:**
```bash
docker logs stratic-plan-redis
```

### 3. Created Redis Client Utility
**File:** `lib/redis.ts`

Features:
- Singleton Redis client with connection pooling
- Automatic reconnection on failure
- Error handling and logging
- Graceful degradation if Redis unavailable

**Available Functions:**
```typescript
import { RedisCache } from '@/lib/redis'

// Set value with TTL
await RedisCache.set('key', data, 3600) // 1 hour TTL

// Get value
const data = await RedisCache.get<MyType>('key')

// Delete key
await RedisCache.del('key')

// Clear all cache
await RedisCache.flushAll()

// Get statistics
const stats = await RedisCache.getStats()

// Test connection
const isConnected = await RedisCache.ping()
```

### 4. Created Cache API Endpoint
**File:** `app/api/cache/route.ts`

**Endpoints:**

```typescript
GET /api/cache
// Returns cache statistics
{
  connected: boolean
  stats: {
    totalKeys: number
    usedMemory: string
    hitRate: number
  }
}

DELETE /api/cache
// Clears all cache
{
  success: true
  message: "Cache cleared successfully"
}
```

### 5. Wired Up Performance Settings
**File:** `components/admin/settings/PerformanceSettings.tsx`

- "Clear All Cache" button now functional
- Connects to `/api/cache` API
- Shows success/error messages
- Auto-refreshes metrics after cache clear

### 6. Environment Configuration
**File:** `.env.local`

Added:
```env
REDIS_URL=redis://localhost:6379
```

## Testing

### 1. Verify Redis is Running
```bash
# Check Docker container
docker ps | grep redis

# Test connection
docker exec stratic-plan-redis redis-cli ping
# Should return: PONG
```

### 2. Test Cache Functions
```bash
# Set a test value
docker exec stratic-plan-redis redis-cli SET test "Hello Redis"

# Get the value
docker exec stratic-plan-redis redis-cli GET test

# Check all keys
docker exec stratic-plan-redis redis-cli KEYS "*"
```

### 3. Test via Admin UI

1. Navigate to: **http://localhost:3000/admin/settings**
2. Click **Performance** tab
3. Click **Caching** sub-tab
4. Click **"Clear All Cache"** button
5. Verify success message appears
6. Check browser console for any errors

### 4. Test API Endpoints

```bash
# Get cache stats (requires auth cookie)
curl http://localhost:3000/api/cache

# Clear cache (requires auth cookie)
curl -X DELETE http://localhost:3000/api/cache
```

## Redis Configuration Options

### Current Settings (Default)
- **Host:** localhost
- **Port:** 6379
- **Database:** 0
- **Max Retries:** 3
- **Retry Delay:** 50-2000ms (exponential backoff)
- **Persistence:** AOF (Append Only File)

### Customization

Edit `docker-compose.redis.yml` to customize:

```yaml
command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

Common options:
- `--maxmemory` - Maximum memory limit
- `--maxmemory-policy` - Eviction policy (allkeys-lru, volatile-lru, etc.)
- `--save` - RDB snapshot intervals
- `--appendonly yes` - Enable AOF persistence

## Cache Usage Examples

### 1. Caching Database Queries

```typescript
import { RedisCache } from '@/lib/redis'

async function getUsers() {
  const cacheKey = 'users:all'
  
  // Try cache first
  const cached = await RedisCache.get<User[]>(cacheKey)
  if (cached) {
    return cached
  }
  
  // Fetch from database
  const users = await db.from('users').select('*')
  
  // Store in cache (1 hour TTL)
  await RedisCache.set(cacheKey, users, 3600)
  
  return users
}
```

### 2. Caching API Responses

```typescript
export async function GET(request: Request) {
  const cacheKey = `api:${request.url}`
  
  const cached = await RedisCache.get(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' }
    })
  }
  
  const data = await fetchData()
  await RedisCache.set(cacheKey, data, 300) // 5 min
  
  return NextResponse.json(data, {
    headers: { 'X-Cache': 'MISS' }
  })
}
```

### 3. Cache Invalidation

```typescript
// Invalidate specific key
await RedisCache.del('users:all')

// Invalidate by pattern (requires custom implementation)
async function clearUserCache() {
  const client = getRedisClient()
  const keys = await client.keys('users:*')
  if (keys.length > 0) {
    await client.del(...keys)
  }
}
```

## Performance Settings Integration

The caching tab now supports:

✅ **Enable/Disable Caching** - Toggle Redis usage
✅ **Redis URL Configuration** - Change Redis connection string
✅ **Cache TTL Settings** - Configure default time-to-live
✅ **Cache Type Toggles:**
  - Database Query Cache
  - Page Cache
  - API Response Cache
✅ **Clear All Cache** - Functional button with API integration

## Monitoring

### Redis Stats in Admin UI

The Performance tab now shows real-time:
- Connection status
- Total cached keys
- Memory usage
- Cache hit rate

### Redis CLI Monitoring

```bash
# Monitor all commands
docker exec stratic-plan-redis redis-cli MONITOR

# Get info
docker exec stratic-plan-redis redis-cli INFO

# Get memory stats
docker exec stratic-plan-redis redis-cli INFO memory

# Get stats
docker exec stratic-plan-redis redis-cli INFO stats
```

## Troubleshooting

### Redis Won't Start

```bash
# Check logs
docker logs stratic-plan-redis

# Restart container
docker restart stratic-plan-redis

# Remove and recreate
docker-compose -f docker-compose.redis.yml down
docker-compose -f docker-compose.redis.yml up -d
```

### Connection Errors

1. **Check Redis is running:**
   ```bash
   docker ps | grep redis
   ```

2. **Check port 6379 is available:**
   ```bash
   lsof -i :6379
   ```

3. **Test connection:**
   ```bash
   docker exec stratic-plan-redis redis-cli ping
   ```

4. **Check environment variable:**
   ```bash
   grep REDIS_URL .env.local
   ```

### Cache Not Working

1. **Check Redis client logs** in application console
2. **Verify auth** - Only admins can clear cache
3. **Check network** - Ensure Docker network is accessible
4. **Review error logs** - Check browser console and server logs

## Production Considerations

### 1. Use Redis Cloud or Managed Service
```env
REDIS_URL=redis://:password@your-redis-host:6379
```

### 2. Enable Password Protection
```yaml
command: redis-server --requirepass your-password
```

### 3. Configure Memory Limits
```yaml
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### 4. Enable TLS for Security
```env
REDIS_URL=rediss://username:password@your-redis-host:6380
```

### 5. Use Redis Cluster for High Availability
- Deploy Redis Sentinel or Redis Cluster
- Configure multiple Redis nodes
- Use Redis client with cluster support

## Future Enhancements

1. **Cache Warming** - Pre-populate cache on deployment
2. **Selective Cache Clear** - Clear by pattern or category
3. **Cache Analytics** - Track hit/miss rates per endpoint
4. **Cache Stampede Protection** - Prevent thundering herd
5. **Multi-Level Caching** - Combine Redis with in-memory cache
6. **Cache Tagging** - Group related cache keys
7. **Background Cache Refresh** - Update cache before expiry

## Related Files

- `lib/redis.ts` - Redis client and utilities
- `app/api/cache/route.ts` - Cache management API
- `docker-compose.redis.yml` - Redis Docker configuration
- `components/admin/settings/PerformanceSettings.tsx` - Admin UI
- `.env.local` - Environment configuration

## Commands Reference

```bash
# Start Redis
docker-compose -f docker-compose.redis.yml up -d

# Stop Redis
docker-compose -f docker-compose.redis.yml down

# View logs
docker logs -f stratic-plan-redis

# Connect to Redis CLI
docker exec -it stratic-plan-redis redis-cli

# Check Redis stats
docker exec stratic-plan-redis redis-cli INFO stats

# Flush all data (DANGEROUS!)
docker exec stratic-plan-redis redis-cli FLUSHALL
```
