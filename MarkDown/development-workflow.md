# Development Workflow

## Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/strategic-planning-system.git
cd strategic-planning-system

# 2. Install dependencies
npm install

# 3. Start Supabase locally
npx supabase start

# 4. Copy environment variables
cp .env.example .env.local
# Edit .env.local with Supabase credentials from `supabase status`

# 5. Run database migrations
npx supabase db push

# 6. Generate TypeScript types
npx supabase gen types typescript --local > types/database.ts

# 7. Start development server
npm run dev
```

## Git Workflow

**Branch Strategy**:

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/epic-1-story-1.1` - Feature branches

**Commit Convention**:

```
type(scope): subject

[optional body]

[optional footer]
```

Examples:
- `feat(initiatives): add create initiative form`
- `fix(budgets): correct funding source validation`
- `docs(readme): update setup instructions`

## Code Review Checklist

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] RLS policies tested for role
- [ ] Zod schema validation present
- [ ] No console.logs left in code
- [ ] Accessibility tested (keyboard navigation)
- [ ] Mobile responsive
- [ ] Error handling implemented

---
