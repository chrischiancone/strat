# Strategic Planning System

A modern web application for municipal government strategic planning, built with Next.js 14, TypeScript, and Supabase.

## Overview

This system enables municipal governments to create, manage, and track strategic plans, goals, and initiatives with multi-year fiscal planning and comprehensive reporting capabilities.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS 3.x
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for Supabase local development)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Stratic Plan"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Local Development

Start Supabase local instance:

```bash
supabase start
```

This will create a local PostgreSQL database with all tables and RLS policies.

### 4. Configure Environment Variables

Copy the Supabase credentials from the `supabase start` output to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── actions/           # Server actions
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components (Header, Sidebar)
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility libraries
│   └── supabase/         # Supabase client configurations
├── supabase/             # Supabase configuration
│   └── migrations/       # Database migrations
├── types/                # TypeScript type definitions
└── docs/                 # Project documentation
```

## Database Schema

The system includes 15 main tables:

### Core Tables
- `users` - User accounts and profiles
- `municipalities` - Municipality information
- `departments` - Department structure
- `fiscal_years` - Multi-year fiscal periods

### Planning Tables
- `strategic_plans` - Strategic plans
- `goals` - Strategic goals
- `initiatives` - Individual initiatives
- `budget_allocations` - Budget planning
- `kpis` - Key performance indicators
- `milestones` - Project milestones

### Supporting Tables
- `comments` - User comments
- `attachments` - File attachments
- `activity_log` - Audit trail
- `notifications` - User notifications
- `tags` - Tagging system

All tables are protected with Row-Level Security (RLS) policies.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Supabase Commands

- `supabase start` - Start local Supabase
- `supabase stop` - Stop local Supabase
- `supabase status` - Check Supabase status
- `supabase db reset` - Reset database to migrations

## Authentication

The system uses Supabase Auth with email/password authentication:

- **/login** - User login
- **/signup** - User registration
- **/dashboard** - Protected dashboard (requires authentication)

User profiles are created by administrators with appropriate roles and department assignments.

## Development Workflow

This project follows the BMad (Business Model-Driven Development) methodology:

1. Requirements documented in `/docs/prd/`
2. Architecture defined in `/docs/architecture/`
3. Features organized into Epics in `/docs/epics/`
4. User stories tracked in `/stories/`

## Documentation

- [Product Requirements Document](./docs/prd/index.md)
- [Architecture Documentation](./docs/architecture/index.md)
- [Epic 4: System Administration](./docs/epics/epic-4-system-administration.md)

## License

Proprietary - Municipal Government Internal Use

## Support

For questions or issues, contact the development team.

claude --dangerously-skip-permissions
