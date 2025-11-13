# Performance Optimization Guide

## Quick Wins Implemented

### 1. Middleware Caching ✅
- **Issue**: Security settings were queried from database on every request
- **Fix**: Added in-memory caching with 5-minute TTL
- **Impact**: Eliminates database queries for 99%+ of requests

### 2. Query Result Caching ✅
- **New Utility**: `lib/cache/query-cache.ts`
- **Usage**: Automatically cache database query results using Redis
- **Impact**: Reduces database load for frequently accessed data

### 3. Next.js Image Optimization ✅
- **Enabled**: WebP and AVIF formats
- **Added**: Image size optimization
- **Impact**: Faster page loads, reduced bandwidth

### 4. Build Optimizations ✅
- **Enabled**: SWC minification
- **Enabled**: React strict mode
- **Impact**: Smaller bundle sizes, better runtime performance

## Usage Examples

### Query Caching

```typescript
import { cacheQuery } from '@/lib/cache/query-cache'

// Cache a query result
const initiatives = await cacheQuery(
  'initiatives',
  { department_id: deptId, status: 'active' },
  async () => {
    const { data } = await supabase
      .from('initiatives')
      .select('id, name, status')
      .eq('department_id', deptId)
      .eq('status', 'active')
    return data
  },
  { ttl: 1800 } // Cache for 30 minutes
)
```

### Page-Level Caching

```typescript
// app/plans/page.tsx
export const revalidate = 300 // Revalidate every 5 minutes

export default async function PlansPage() {
  const plans = await getPlans()
  return <PlansList plans={plans} />
}
```

### API Route Caching

```typescript
// app/api/initiatives/route.ts
export async function GET() {
  const initiatives = await getInitiatives()
  
  return Response.json(initiatives, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
```

## Additional Optimizations

### Database Query Optimization

1. **Replace `select('*')` with specific columns**:
```typescript
// ❌ Bad
.select('*')

// ✅ Good
.select('id, name, status, created_at')
```

2. **Use indexes** - Already implemented in migrations
3. **Batch queries** - Use `.in()` instead of loops
4. **Use JOINs** - Already optimized in dashboard queries

### Component Optimization

1. **Use React.memo for expensive components**:
```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component code
})
```

2. **Lazy load heavy components**:
```typescript
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

3. **Use useMemo and useCallback**:
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

const handleClick = useCallback(() => {
  // Handler code
}, [dependencies])
```

## Monitoring Performance

### Check Cache Statistics

```typescript
import { getCacheStats } from '@/lib/cache/query-cache'

const stats = await getCacheStats()
console.log('Cache hit rate:', stats.hitRate)
console.log('Total keys:', stats.totalKeys)
```

### Performance Metrics

The application tracks:
- Database query times
- Component render times
- Cache hit rates
- Memory usage

Check `/api/metrics` endpoint for detailed performance data.

## Redis Setup

Ensure Redis is running:

```bash
# Start Redis with Docker
npm run dev:services

# Or use local Redis
redis-server
```

Set `REDIS_URL` in `.env.local`:
```
REDIS_URL=redis://localhost:6379
```

## Expected Performance Improvements

- **Middleware**: 90%+ reduction in database queries
- **Cached queries**: 50-80% faster response times
- **Image loading**: 30-50% smaller file sizes
- **Bundle size**: 10-20% reduction with SWC minification

## Troubleshooting

### Cache not working?
1. Check Redis is running: `redis-cli ping`
2. Verify `REDIS_URL` is set
3. Check cache hit rate in metrics

### Still slow?
1. Check database query logs
2. Verify indexes are created
3. Profile with Next.js built-in profiler
4. Check for N+1 query patterns

