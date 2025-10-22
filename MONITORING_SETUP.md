# Monitoring and Observability Setup

Comprehensive guide for setting up monitoring, logging, and alerting for the Strategic Planning System.

## Overview

Production monitoring stack includes:
- **Error Tracking**: Sentry
- **Application Logs**: Structured JSON logging
- **Metrics**: Docker stats, custom metrics
- **Uptime Monitoring**: Health checks
- **Alerts**: Webhook notifications
- **Performance**: APM and tracing

---

## Error Tracking (Sentry)

### Setup Sentry

#### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io/)
2. Create account or sign in
3. Create new project for "stratic-plan"
4. Note your DSN (Data Source Name)

#### 2. Install Sentry SDK

```bash
# Already included in dependencies
npm install @sentry/nextjs
```

#### 3. Initialize Sentry

The application already has Sentry configuration files:
- `development/configs/sentry.client.config.ts` - Client-side
- `development/configs/sentry.server.config.ts` - Server-side
- `development/configs/sentry.edge.config.ts` - Edge runtime

#### 4. Configure Environment

Add to `.env.production`:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-key@sentry.io/your-project-id
SENTRY_ORG=your-organization
SENTRY_PROJECT=strategic-plan
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ENVIRONMENT=production

# Sample rates (0.0 to 1.0)
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
```

#### 5. Verify Setup

```bash
# Build application
npm run build

# Check for Sentry initialization
grep -r "Sentry.init" .next/

# Test error tracking (in development)
curl -X POST https://your-app.com/api/test-error
```

### Sentry Best Practices

#### Filter Sensitive Data

```typescript
// In sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.['authorization'];
    }
    
    // Filter out known issues
    if (event.exception?.values?.[0]?.value?.includes('Network error')) {
      return null; // Don't send to Sentry
    }
    
    return event;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
```

#### Custom Context

```typescript
import * as Sentry from '@sentry/nextjs';

// Add user context
Sentry.setUser({
  id: userId,
  email: userEmail,
  department: userDepartment,
});

// Add custom tags
Sentry.setTag('feature', 'strategic-planning');
Sentry.setTag('version', process.env.APP_VERSION);

// Add breadcrumbs
Sentry.addBreadcrumb({
  category: 'database',
  message: 'Queried strategic plans',
  level: 'info',
});
```

### Alerts

Configure alerts in Sentry dashboard:
- Error frequency > 10/minute
- New error types
- Performance degradation
- High error rate (> 5%)

---

## Application Logging

### Structured Logging

The application uses a structured logger at `lib/logger.ts`:

```typescript
import { logger } from '@/lib/logger';

// Log levels: debug, info, warn, error
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});

logger.error('Database query failed', {
  error: error.message,
  query: 'SELECT * FROM users',
  duration: 1500,
});
```

### Log Format

Production logs are JSON formatted:

```json
{
  "level": "error",
  "message": "Database connection failed",
  "timestamp": "2025-10-20T21:00:00.000Z",
  "context": {
    "error": "Connection timeout",
    "service": "database",
    "attempt": 3
  }
}
```

### Log Levels

- **DEBUG**: Detailed information for diagnosing issues
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failures

Configure level via environment:

```bash
LOG_LEVEL=info  # production
LOG_LEVEL=debug # development
```

### Viewing Logs

```bash
# Docker Compose logs
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f app

# Filter by level
docker compose -f docker-compose.production.yml logs app | grep ERROR

# Last 100 lines
docker compose -f docker-compose.production.yml logs --tail=100 app

# Follow with timestamp
docker compose -f docker-compose.production.yml logs -f -t app
```

### Log Rotation

Configure Docker logging:

**docker-compose.production.yml**:
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Or system-wide in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5",
    "compress": "true"
  }
}
```

---

## Metrics and Monitoring

### Health Checks

The application includes health check endpoints:

#### Application Health

```bash
# Check application health
curl https://your-domain.com/api/health

# Response
{
  "status": "healthy",
  "timestamp": "2025-10-20T21:00:00.000Z",
  "uptime": 86400,
  "version": "1.0.0"
}
```

#### Database Health

```bash
# Check database connectivity
docker exec strategic_plan_db pg_isready -U postgres

# Database statistics
docker exec strategic_plan_db psql -U postgres -d postgres -c "SELECT * FROM pg_stat_activity;"
```

#### Redis Health

```bash
# Check Redis
docker exec stratic-plan-redis redis-cli PING

# Redis stats
docker exec stratic-plan-redis redis-cli INFO stats
```

### Docker Metrics

```bash
# Real-time stats
docker stats

# Specific container
docker stats strategic_plan_app

# Format output
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Custom Metrics

Create metrics endpoint at `app/api/metrics/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const metrics = {
    timestamp: new Date().toISOString(),
    app: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    },
    // Add custom metrics
    users: {
      active: await getActiveUsersCount(),
      total: await getTotalUsersCount(),
    },
    plans: {
      total: await getPlansCount(),
      active: await getActivePlansCount(),
    },
  };
  
  return NextResponse.json(metrics);
}
```

---

## Uptime Monitoring

### Option 1: UptimeRobot (Free)

1. Sign up at [uptimerobot.com](https://uptimerobot.com/)
2. Add monitor:
   - Type: HTTPS
   - URL: `https://your-domain.com/api/health`
   - Interval: 5 minutes
3. Configure alerts (email, Slack, webhook)

### Option 2: Pingdom

1. Sign up at [pingdom.com](https://www.pingdom.com/)
2. Create uptime check
3. Set alert thresholds
4. Configure notification channels

### Option 3: Self-Hosted (Uptime Kuma)

```bash
# Run Uptime Kuma
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma:1

# Access at http://localhost:3001
```

Configure monitors:
- Application health endpoint
- Database connectivity
- SSL certificate expiry
- DNS resolution

---

## Alerting

### Webhook Notifications

Configure webhook for alerts in `.env.production`:

```bash
# Slack webhook
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Generic webhook
ALERT_WEBHOOK_URL=https://your-webhook-service.com/alerts
```

### Alert Script

**scripts/send-alert.sh**:

```bash
#!/bin/bash

WEBHOOK_URL="${ALERT_WEBHOOK_URL}"
MESSAGE="$1"
SEVERITY="${2:-info}"

if [ -z "$WEBHOOK_URL" ]; then
    echo "No webhook configured"
    exit 0
fi

# Send to Slack
curl -X POST "$WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "{
        \"text\": \"[$SEVERITY] Strategic Plan Alert\",
        \"blocks\": [{
            \"type\": \"section\",
            \"text\": {
                \"type\": \"mrkdwn\",
                \"text\": \"$MESSAGE\"
            }
        }]
    }"
```

### Monitoring Script

**scripts/health-monitor.sh**:

```bash
#!/bin/bash

# Check application health
if ! curl -f https://your-domain.com/api/health > /dev/null 2>&1; then
    ./scripts/send-alert.sh "Application health check failed" "critical"
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    ./scripts/send-alert.sh "Disk usage is ${DISK_USAGE}%" "warning"
fi

# Check database
if ! docker exec strategic_plan_db pg_isready -U postgres > /dev/null 2>&1; then
    ./scripts/send-alert.sh "Database is not responding" "critical"
fi

# Check backup age
LAST_BACKUP=$(find /opt/strategic-plan/backups -name "backup_*.sql.gz" -mtime -1 | wc -l)
if [ "$LAST_BACKUP" -eq 0 ]; then
    ./scripts/send-alert.sh "No backup in last 24 hours" "warning"
fi
```

Add to crontab:

```cron
# Run health checks every 5 minutes
*/5 * * * * /opt/strategic-plan/scripts/health-monitor.sh
```

---

## Performance Monitoring

### Application Performance

Monitor using Sentry Performance:

```typescript
import * as Sentry from '@sentry/nextjs';

// Manual transaction
const transaction = Sentry.startTransaction({
  op: 'database.query',
  name: 'Get Strategic Plans',
});

try {
  const plans = await fetchPlans();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### Database Performance

```bash
# Slow queries
docker exec strategic_plan_db psql -U postgres -d postgres -c "
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;"

# Active connections
docker exec strategic_plan_db psql -U postgres -d postgres -c "
SELECT COUNT(*) FROM pg_stat_activity;"

# Table sizes
docker exec strategic_plan_db psql -U postgres -d postgres -c "
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Redis Performance

```bash
# Stats
docker exec stratic-plan-redis redis-cli INFO stats

# Slow log
docker exec stratic-plan-redis redis-cli SLOWLOG GET 10

# Memory usage
docker exec stratic-plan-redis redis-cli INFO memory
```

---

## Dashboards

### Simple Status Page

Create `public/status.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>System Status</title>
    <script>
        async function checkHealth() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                document.getElementById('status').innerHTML = 
                    `<span style="color: green;">✓ Operational</span>`;
                document.getElementById('details').innerText = 
                    JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('status').innerHTML = 
                    `<span style="color: red;">✗ Down</span>`;
            }
        }
        setInterval(checkHealth, 30000);
        checkHealth();
    </script>
</head>
<body>
    <h1>Strategic Plan System Status</h1>
    <div id="status">Checking...</div>
    <pre id="details"></pre>
</body>
</html>
```

### Grafana + Prometheus (Advanced)

**docker-compose.monitoring.yml**:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false

volumes:
  prometheus_data:
  grafana_data:
```

---

## Monitoring Checklist

### Daily
- [ ] Review error logs
- [ ] Check health endpoints
- [ ] Verify backups completed
- [ ] Review disk space

### Weekly
- [ ] Review Sentry errors
- [ ] Check slow queries
- [ ] Review performance metrics
- [ ] Test alerts

### Monthly
- [ ] Review SSL certificates
- [ ] Update dependencies
- [ ] Test disaster recovery
- [ ] Review monitoring coverage

---

## Troubleshooting

### High Error Rate

```bash
# Check error logs
docker compose -f docker-compose.production.yml logs app | grep ERROR

# Check Sentry dashboard
# Visit: https://sentry.io

# Check resource usage
docker stats

# Check database connections
docker exec strategic_plan_db psql -U postgres -d postgres -c "SELECT COUNT(*) FROM pg_stat_activity;"
```

### Performance Issues

```bash
# Check slow queries
docker exec strategic_plan_db psql -U postgres -d postgres -c "
SELECT query, mean_exec_time FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;"

# Check Redis latency
docker exec stratic-plan-redis redis-cli --latency

# Check Node.js memory
docker exec strategic_plan_app node -e "console.log(process.memoryUsage())"
```

### Missing Logs

```bash
# Check Docker logging driver
docker inspect strategic_plan_app | grep LogConfig

# Check log file size limits
docker inspect strategic_plan_app | grep -A5 LogConfig

# Restart with fresh logs
docker compose -f docker-compose.production.yml restart app
```

---

## Best Practices

### Monitoring
1. Monitor what matters (4 golden signals: latency, traffic, errors, saturation)
2. Set appropriate alert thresholds
3. Avoid alert fatigue
4. Document monitoring procedures
5. Regular review and updates

### Logging
1. Use structured logging (JSON)
2. Include context and metadata
3. Rotate logs regularly
4. Protect sensitive data
5. Centralize log storage

### Alerting
1. Alert on symptoms, not causes
2. Make alerts actionable
3. Include context in alerts
4. Test alert channels
5. Document escalation procedures

---

## Additional Tools

### Log Aggregation
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Loki**: Lightweight log aggregation
- **Papertrail**: Hosted log management

### APM (Application Performance Monitoring)
- **New Relic**: Full-stack observability
- **DataDog**: Infrastructure and APM
- **Elastic APM**: Open-source APM

### Uptime Monitoring
- **UptimeRobot**: Free tier available
- **Pingdom**: Comprehensive monitoring
- **StatusCake**: Website monitoring

---

**Last Updated**: 2025-10-20  
**Version**: 1.0
