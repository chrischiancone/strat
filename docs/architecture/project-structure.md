# Project Structure

## Complete Directory Structure

```
strategic-planning-system/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Run tests on PR
│       └── deploy.yml             # Deploy to Vercel
├── app/                           # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Main dashboard
│   │   │   └── loading.tsx
│   │   ├── plans/
│   │   │   ├── page.tsx           # List plans
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx       # Plan detail
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── goals/
│   │   │   │       └── [goalId]/
│   │   │   │           └── initiatives/
│   │   │   │               └── [initiativeId]/
│   │   │   │                   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── initiatives/
│   │   ├── budgets/
│   │   ├── reports/
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── users/
│   │   ├── departments/
│   │   ├── audit-logs/
│   │   └── layout.tsx
│   ├── api/
│   │   └── export-pdf/
│   │       └── route.ts
│   ├── actions/                   # Server Actions
│   │   ├── plans.ts
│   │   ├── initiatives.ts
│   │   └── budgets.ts
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── providers/
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   ├── middleware.ts          # Middleware client
│   │   └── auth.ts                # Auth helpers
│   ├── auth/
│   │   └── roles.ts               # Role utilities
│   ├── validation/
│   │   ├── plan.ts
│   │   ├── initiative.ts
│   │   └── budget.ts
│   ├── utils/
│   │   ├── cn.ts                  # Class merger
│   │   ├── currency.ts
│   │   └── date.ts
│   └── pdf/
│       └── generator.ts           # PDF export logic
├── types/
│   ├── database.ts                # Auto-generated Supabase types
│   └── models.ts                  # Application types
├── supabase/
│   ├── migrations/                # Database migrations
│   │   ├── 20250109000001_create_core_tables.sql
│   │   ├── 20250109000002_create_planning_tables.sql
│   │   ├── 20250109000003_create_supporting_tables.sql
│   │   ├── 20250109000004_create_system_tables.sql
│   │   ├── 20250109000005_enable_rls_policies.sql
│   │   └── 20250109000006_seed_data.sql
│   ├── config.toml                # Supabase config
│   └── seed.sql                   # Test data
├── docs/                          # Documentation
│   ├── prd/                       # Product Requirements
│   ├── epics/                     # User stories
│   ├── architecture.md            # This file
│   └── database-schema-overview.md
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   ├── images/
│   └── fonts/
├── .env.local                     # Local environment variables
├── .env.example                   # Example env file
├── next.config.js                 # Next.js config
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json                  # TypeScript config
├── package.json
└── README.md
```

## Environment Variables

**.env.local**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Third-party services
SENTRY_DSN=
VERCEL_ANALYTICS_ID=
```

**.env.production** (Vercel):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
NEXT_PUBLIC_APP_URL=https://strategic-planning.yourdomain.com
```

---
