# Developer Onboarding Guide

Welcome to the Strategic Planning System development team! This guide will help you get up and running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Docker Desktop** (for local Supabase)
- **Git** for version control
- **VS Code** (recommended) or your preferred IDE

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Stratic Plan"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies and set up Husky pre-commit hooks automatically.

### 3. Set Up Supabase Local Instance

```bash
# Install Supabase CLI globally (if not already installed)
npm install -g supabase

# Start local Supabase instance
supabase start
```

This creates a local PostgreSQL database with all tables, functions, and RLS policies.

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with the Supabase credentials from the `supabase start` output:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── actions/           # Server Actions for mutations
│   └── api/               # REST API routes
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── ui/               # shadcn/ui components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client configurations
│   ├── security.ts       # Security utilities
│   ├── errorHandler.ts   # Error handling
│   └── logger.ts         # Logging utilities
├── supabase/             # Supabase configuration
│   └── migrations/       # Database migrations
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── types/               # TypeScript type definitions
└── docs/                # Documentation
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make Changes

Edit files and test locally. The development server supports hot reload.

### 3. Run Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### 4. Check Code Quality

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Run all checks
npm run validate
```

### 5. Commit Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat(component): add new feature"
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, etc.)

Pre-commit hooks will automatically:
- Run lint-staged (format and lint)
- Run type checking
- Run unit tests
- Validate commit message format

### 6. Push and Create Pull Request

```bash
git push origin feat/your-feature-name
```

Create a pull request on GitHub. The CI/CD pipeline will automatically:
- Run all tests
- Check code quality
- Build the application
- Run security scans

## Database Development

### Creating Migrations

```bash
npm run db:migration your_migration_name
```

This creates a new migration file in `supabase/migrations/`.

### Applying Migrations

```bash
npm run db:migrate
```

### Reset Database

```bash
npm run db:reset
```

**Warning:** This will delete all data and reapply migrations.

### Backup and Restore

```bash
# Backup
npm run db:backup

# Restore
npm run db:restore
```

## Testing

### Unit Tests

Test individual functions and utilities:

```typescript
// tests/unit/lib/security.test.ts
import { describe, it, expect } from 'vitest'
import { InputValidator } from '@/lib/security'

describe('InputValidator', () => {
  it('should validate email', () => {
    expect(InputValidator.isValidEmail('test@example.com')).toBe(true)
  })
})
```

### Integration Tests

Test server actions and API routes:

```typescript
// tests/integration/actions.test.ts
import { describe, it, expect } from 'vitest'
import { createInitiative } from '@/app/actions/initiatives'

describe('Initiative Actions', () => {
  it('should create initiative', async () => {
    const result = await createInitiative({...})
    expect(result.success).toBe(true)
  })
})
```

### E2E Tests

Test user workflows with Playwright:

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/)
})
```

## Debugging

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logging

Use the centralized logger:

```typescript
import { logger } from '@/lib/logger'

logger.info('Info message', { context: 'optional' })
logger.warn('Warning message')
logger.error('Error message', { error: errorObject })
```

## Common Issues

### Port 3000 Already in Use

```bash
lsof -ti:3000 | xargs kill -9
```

### Supabase Connection Issues

```bash
supabase stop
supabase start
```

### Node Module Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
rm -rf .next
npm run build
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code structure
- Write self-documenting code with clear names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Prefer composition over inheritance
- Use functional programming patterns where appropriate

## Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Project README](../README.md)
- [Architecture Documentation](./architecture/index.md)

## Getting Help

- **Slack**: #strategic-planning-dev
- **Email**: dev-team@example.com
- **GitHub Issues**: [Repository Issues](https://github.com/yourorg/repo/issues)

## Next Steps

1. Complete this onboarding guide
2. Read the [Architecture Documentation](./architecture/index.md)
3. Review open issues and pick a beginner-friendly task
4. Join the daily standup meeting
5. Pair with a senior developer on your first task

Welcome to the team! 🎉
