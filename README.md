# Strategic Planning System

A comprehensive municipal strategic planning and budget management platform built with Next.js 14, Supabase, and TypeScript.

## 🎯 Overview

The Strategic Planning System enables municipal governments to:
- Create and manage multi-year strategic plans
- Track initiatives, budgets, and performance metrics
- Facilitate collaboration between departments
- Generate reports for city council and stakeholders
- Maintain audit trails for accountability

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or later
- **Docker Desktop** (for local Supabase)
- **Git** for version control
- **Supabase CLI** (`npm install -g supabase`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "Stratic Plan"

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start local Supabase (requires Docker)
npx supabase start

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Cloud Development Setup

For shared development environments, see [CLOUD_SETUP_GUIDE.md](./CLOUD_SETUP_GUIDE.md).

## 📁 Project Structure

```
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Authentication pages (login, signup)
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── admin/           # Admin-only pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── plans/           # Strategic plans management
│   │   ├── finance/         # Budget and financial tracking
│   │   └── initiatives/     # Initiative management
│   ├── actions/             # Server Actions (mutations)
│   └── api/                 # REST API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components
│   ├── admin/               # Admin-specific components
│   ├── plans/               # Strategic plan components
│   ├── finance/             # Budget/finance components
│   └── [feature]/           # Feature-specific components
├── lib/                     # Utility libraries
│   ├── supabase/            # Supabase client configurations
│   ├── auth/                # Authentication utilities
│   ├── security/            # Security & validation
│   ├── performance/         # Performance monitoring
│   └── utils/               # General utilities
├── hooks/                   # React hooks
├── types/                   # TypeScript type definitions
├── supabase/                # Supabase configuration
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase local config
├── scripts/                 # Development & utility scripts
├── docs/                    # Documentation
└── testing/                 # Test files
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                  # Start development server
npm run build                # Build for production
npm run start                # Start production server

# Code Quality
npm run lint                 # Run ESLint
npm run lint:fix             # Fix linting issues
npm run type-check           # TypeScript type checking
npm run format               # Format code with Prettier
npm run validate             # Run all checks (type, lint, format)

# Database
npm run db:migration         # Create new migration
npm run db:migrate           # Apply migrations (local)
npm run db:status            # Check migration status
npm run db:reset             # Reset database (local)
npm run db:backup            # Backup database
npm run db:restore           # Restore from backup

# Docker Services
npm run dev:services         # Start Redis, pgAdmin, etc.
npm run dev:services:down    # Stop services
npm run dev:services:logs    # View service logs

# Testing
npm run test                 # Run unit tests
npm run test:watch           # Watch mode
npm run test:e2e             # Run E2E tests
npm run test:coverage        # Generate coverage report

# Utilities
npm run cloud:keys           # Generate secure keys for cloud setup
```

### Environment Variables

Required environment variables (see `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-password

# AI Services (optional)
PERPLEXITY_API_KEY=your-key
CLAUDE_API_KEY=your-key
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Server Components + Server Actions
- **Caching**: Redis (optional)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Deployment**: Vercel/Netlify

### Key Design Decisions

- **Server Components First**: Maximize server-side rendering for performance
- **Row-Level Security**: Database-level access control via Supabase RLS
- **Type Safety**: End-to-end TypeScript with generated database types
- **Component Composition**: Reusable UI components via shadcn/ui
- **Audit Trails**: Comprehensive logging for government accountability

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

## 📚 Documentation

All documentation is organized in the `docs/` folder:

- **[Developer Onboarding](./docs/DEVELOPER_ONBOARDING.md)** - Quick start guide for new developers
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and patterns
- **[Code Documentation](./docs/CODE_DOCUMENTATION.md)** - Code structure and patterns
- **[API Reference](./docs/API.md)** - API endpoints and Server Actions
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Database structure
- **[Contributing](./CONTRIBUTING.md)** - Development guidelines

### Setup Guides
- **[Development Setup](./docs/setup/DEVELOPMENT_SETUP.md)** - Local development setup
- **[Cloud Setup Guide](./docs/cloud/CLOUD_SETUP_GUIDE.md)** - Shared cloud environment
- **[Quick Reference](./docs/QUICK_REFERENCE.md)** - Common tasks and patterns

### Additional Documentation
- **[Documentation Index](./docs/INDEX.md)** - Complete documentation index
- **[Fixes & Solutions](./docs/fixes/)** - Bug fixes and solutions
- **[Database Docs](./docs/database/)** - Database-related documentation

## 🔐 Security

- Row-Level Security (RLS) policies enforce data access
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- Security audit logging
- 2FA support (optional)
- Secure password requirements

See [docs/SECURITY.md](./docs/SECURITY.md) for security best practices.

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Unit tests only
npm run test

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:a11y
```

## 📦 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Security settings reviewed
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place

See [docs/PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md) for deployment guide.

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, code style, and pull request process.

## 📄 License

[Add your license here]

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](link-to-issues)
- **Questions**: [Discussions](link-to-discussions)

## 🙏 Acknowledgments

Built for municipal governments to streamline strategic planning and budget management.

