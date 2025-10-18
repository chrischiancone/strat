# Deployment Architecture

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ US-East │  │ US-West │  │  Europe │  │  Asia   │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
│            Global CDN (Cached Assets)                    │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Application (Vercel)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Server Components (SSR)                         │   │
│  │  - Render on-demand                              │   │
│  │  - Direct Supabase access                        │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Client Components (Browser)                     │   │
│  │  - Minimal JavaScript                            │   │
│  │  - Supabase client for real-time                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Cloud                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │  Auth & RLS  │  │   Storage    │  │
│  │  (Primary)   │  │              │  │   (Files)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │  PostgREST   │  │  Realtime    │                     │
│  │  (API)       │  │  (WebSocket) │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## Deployment Process

**Automatic Deployment via GitHub Actions**:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Database Migrations**:

```bash
# Run migrations on Supabase cloud
npx supabase db push --db-url $DATABASE_URL

# Or via Supabase CLI (connected to project)
npx supabase link --project-ref your-project-ref
npx supabase db push
```

## Environment-Specific Configuration

**next.config.js**:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project.supabase.co'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        has: [{ type: 'cookie', key: 'sb-access-token' }],
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---
