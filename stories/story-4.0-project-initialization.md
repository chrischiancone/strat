# Story 4.0: Project Initialization & Setup

**Epic:** Epic 4 - System Administration
**Story Points:** 21
**Priority:** P0 (Critical - Foundation)

---

## Status

Draft

---

## Story

**As a** Developer,
**I want** to initialize the Next.js project with Supabase backend and complete development environment setup,
**so that** I have a working foundation to implement Epic 4 user stories.

---

## Acceptance Criteria

1. Next.js 14+ project initialized with TypeScript and App Router
2. All required dependencies installed (React 18+, Supabase client, TailwindCSS, shadcn/ui, etc.)
3. Supabase CLI installed and local instance running
4. Database migrations executed successfully (15 tables created)
5. Supabase TypeScript types generated from schema
6. Environment variables configured (.env.local)
7. Project structure matches architecture specification
8. Basic authentication flow working (login/signup pages)
9. Root layout with navigation structure
10. Development server runs without errors
11. All linting and TypeScript compilation passes
12. Git repository initialized with .gitignore configured

---

## Tasks / Subtasks

- [ ] Task 1: Initialize Next.js Project (AC: 1, 2, 7)
  - [ ] 1.1: Run `npx create-next-app@latest` with TypeScript, App Router, TailwindCSS
  - [ ] 1.2: Install core dependencies (supabase-js, ssr, zod, react-hook-form, etc.)
  - [ ] 1.3: Install UI dependencies (shadcn/ui components, lucide-react, recharts)
  - [ ] 1.4: Install dev dependencies (prettier, eslint config, testing libraries)
  - [ ] 1.5: Configure TypeScript (tsconfig.json - strict mode)
  - [ ] 1.6: Configure TailwindCSS (tailwind.config.ts with custom theme)
  - [ ] 1.7: Configure ESLint and Prettier

- [ ] Task 2: Set Up Supabase Local Development (AC: 3, 4, 5)
  - [ ] 2.1: Install Supabase CLI globally
  - [ ] 2.2: Initialize Supabase in project (`supabase init`)
  - [ ] 2.3: Start Supabase local instance (`supabase start`)
  - [ ] 2.4: Verify migrations exist in `/supabase/migrations/` (6 migration files)
  - [ ] 2.5: Run migrations (`supabase db push`)
  - [ ] 2.6: Verify all 15 tables created successfully
  - [ ] 2.7: Generate TypeScript types (`supabase gen types typescript`)
  - [ ] 2.8: Create types/database.ts with generated types

- [ ] Task 3: Configure Environment & Project Structure (AC: 6, 7)
  - [ ] 3.1: Create .env.local with Supabase URL and keys
  - [ ] 3.2: Create .env.example as template
  - [ ] 3.3: Create project directory structure (lib/, components/, app/, types/)
  - [ ] 3.4: Create lib/supabase/client.ts (browser client)
  - [ ] 3.5: Create lib/supabase/server.ts (server client)
  - [ ] 3.6: Create lib/supabase/middleware.ts (middleware client)
  - [ ] 3.7: Create lib/utils/cn.ts (class merger utility)

- [ ] Task 4: Set Up Authentication Pages (AC: 8)
  - [ ] 4.1: Create app/(auth)/layout.tsx (auth-specific layout)
  - [ ] 4.2: Create app/(auth)/login/page.tsx (login page - Server Component)
  - [ ] 4.3: Create components/auth/LoginForm.tsx (login form - Client Component)
  - [ ] 4.4: Create app/(auth)/signup/page.tsx (signup page)
  - [ ] 4.5: Create components/auth/SignupForm.tsx (signup form)
  - [ ] 4.6: Create app/auth/callback/route.ts (OAuth callback handler)
  - [ ] 4.7: Create app/actions/auth.ts (server actions for auth)

- [ ] Task 5: Create Root Layout & Navigation (AC: 9)
  - [ ] 5.1: Create app/layout.tsx (root layout with metadata)
  - [ ] 5.2: Create app/globals.css (global styles with Tailwind directives)
  - [ ] 5.3: Create components/layout/Header.tsx (navigation header)
  - [ ] 5.4: Create components/layout/Sidebar.tsx (admin sidebar)
  - [ ] 5.5: Create app/(dashboard)/layout.tsx (authenticated layout)
  - [ ] 5.6: Create app/(dashboard)/dashboard/page.tsx (placeholder dashboard)
  - [ ] 5.7: Create middleware.ts (route protection)

- [ ] Task 6: Initialize shadcn/ui Components (AC: 2, 7)
  - [ ] 6.1: Run `npx shadcn-ui@latest init` to configure
  - [ ] 6.2: Install button component
  - [ ] 6.3: Install input component
  - [ ] 6.4: Install form component
  - [ ] 6.5: Install table component
  - [ ] 6.6: Install dialog component
  - [ ] 6.7: Verify components/ structure created

- [ ] Task 7: Testing & Validation (AC: 10, 11)
  - [ ] 7.1: Run `npm run dev` and verify server starts
  - [ ] 7.2: Navigate to http://localhost:3000 and verify root page loads
  - [ ] 7.3: Navigate to /login and verify login page renders
  - [ ] 7.4: Test Supabase connection (query users table)
  - [ ] 7.5: Run `npm run build` and verify TypeScript compiles
  - [ ] 7.6: Run `npm run lint` and fix any issues
  - [ ] 7.7: Verify all RLS policies active on Supabase

- [ ] Task 8: Git Repository Setup (AC: 12)
  - [ ] 8.1: Initialize git repository (`git init`)
  - [ ] 8.2: Create comprehensive .gitignore
  - [ ] 8.3: Initial commit with project structure
  - [ ] 8.4: Create README.md with setup instructions

---

## Dev Notes

### Architecture References

**Tech Stack (from docs/architecture/technology-stack.md):**
- Next.js 14.x with App Router
- React 18.x
- TypeScript 5.x (strict mode enabled)
- Supabase (PostgreSQL + Auth + RLS)
- TailwindCSS 3.x
- shadcn/ui (Radix UI components)
- React Hook Form 7.x + Zod 3.x
- Recharts 2.x (data visualization)

**Key Dependencies:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "tailwindcss": "^3.4.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.303.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

**Project Structure (from docs/architecture/project-structure.md):**
```
strategic-planning-system/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── plans/
│   │   ├── initiatives/
│   │   └── layout.tsx
│   ├── admin/
│   ├── actions/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/
│   ├── layout/
│   └── providers/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils/
│   └── validation/
├── types/
│   └── database.ts      # Generated from Supabase
├── supabase/
│   └── migrations/      # Already exists
├── middleware.ts
└── next.config.js
```

**Supabase Client Patterns (from docs/architecture/backend-architecture.md):**

1. Browser Client:
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

2. Server Client:
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**Authentication Flow (from docs/architecture/security-architecture.md):**
- Use Supabase Auth with email/password
- Server Actions for sign up, sign in, sign out
- Middleware for route protection
- RLS policies enforce data access

**Environment Variables:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Database Schema:**
- 15 tables already defined in `/supabase/migrations/`
- Migration files: 20250109000001 through 20250109000006
- Tables: municipalities, departments, fiscal_years, users, strategic_plans, strategic_goals, initiatives, initiative_budgets, initiative_kpis, quarterly_milestones, initiative_dependencies, initiative_collaborators, comments, audit_logs, document_embeddings

**Coding Standards (from docs/architecture/coding-standards.md):**
- TypeScript strict mode enabled
- No explicit `any` types
- Server Components by default, Client Components only for interactivity
- File naming: PascalCase for components, camelCase for utilities
- Use `'use client'` directive only when necessary

### Testing

**Testing Strategy (from docs/architecture/testing-strategy.md):**
- Unit tests with Vitest
- Integration tests for database operations
- E2E tests with Playwright (future stories)

**For Story 4.0:**
- Manual testing of development server startup
- Verify database connection and migrations
- Test basic authentication flow
- Verify TypeScript compilation
- No automated tests required for initial setup

**Test Standards:**
- Test files location: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- Use Vitest for unit/integration tests
- Follow testing pyramid: 60% unit, 30% integration, 10% E2E

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-10 | 1.0 | Initial story creation | James (Dev Agent) |

---

## Dev Agent Record

### Agent Model Used

*To be populated during implementation*

### Debug Log References

*To be populated during implementation*

### Completion Notes List

*To be populated during implementation*

### File List

*To be populated during implementation*

---

## QA Results

*To be populated by QA Agent after implementation*
