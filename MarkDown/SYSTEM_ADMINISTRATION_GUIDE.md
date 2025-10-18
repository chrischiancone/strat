# Strategic Planning System - System Administration Guide

**Version 1.0** | **Last Updated: January 2025**

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture Overview](#system-architecture-overview)
3. [Infrastructure and Deployment](#infrastructure-and-deployment)
4. [Installation and Setup](#installation-and-setup)
5. [Configuration Management](#configuration-management)
6. [User Management](#user-management)
7. [Security and Access Control](#security-and-access-control)
8. [Database Administration](#database-administration)
9. [Backup and Recovery](#backup-and-recovery)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)
13. [Maintenance Procedures](#maintenance-procedures)
14. [Upgrade and Migration](#upgrade-and-migration)
15. [Integration Management](#integration-management)
16. [Disaster Recovery](#disaster-recovery)
17. [Security Hardening](#security-hardening)
18. [Support and Escalation](#support-and-escalation)

---

## Introduction

### Purpose

This System Administration Guide provides comprehensive technical documentation for administrators responsible for deploying, configuring, maintaining, and troubleshooting the Strategic Planning System.

### Audience

This guide is intended for:
- **System Administrators**: Managing infrastructure and deployment
- **Database Administrators**: Managing PostgreSQL/Supabase
- **DevOps Engineers**: CI/CD and automation
- **IT Support Staff**: First-line troubleshooting
- **Security Officers**: Security configuration and audits

### Prerequisites

Administrators should have:
- Experience with Linux/Unix systems
- Knowledge of PostgreSQL database administration
- Familiarity with Node.js and npm
- Understanding of Docker and containerization
- Experience with Next.js applications
- Basic understanding of Supabase platform
- Knowledge of Git version control

### Administrator Responsibilities

System administrators are responsible for:
- System installation and configuration
- User account management
- Security policy enforcement
- Database backups and recovery
- System monitoring and performance
- Troubleshooting and support
- System updates and patches
- Documentation maintenance

---

## System Architecture Overview

### Technology Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript 5.3.3
- Tailwind CSS 3.4.1
- shadcn/ui component library

**Backend**:
- Supabase (PostgreSQL 17)
- Supabase Auth
- Supabase Storage
- Supabase Realtime

**Infrastructure**:
- Node.js 24.2.0
- npm 11.3.0
- Docker (for local Supabase)
- Git version control

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                    (Next.js Frontend)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Next.js Server                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages/     │  │   Server     │  │   API        │      │
│  │   Routes     │  │   Actions    │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Supabase Client Library
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Supabase Platform                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │  Auth        │  │  Storage     │      │
│  │  Database    │  │  Service     │  │  Service     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Realtime    │  │  Edge        │  │  Analytics   │      │
│  │  Service     │  │  Functions   │  │  Service     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

The system uses 15 core tables:

**Core Tables**:
- `users` - User accounts and profiles
- `municipalities` - Municipality information
- `departments` - Department hierarchy
- `fiscal_years` - Fiscal year definitions

**Planning Tables**:
- `strategic_plans` - Strategic plans
- `strategic_goals` - Goals within plans
- `initiatives` - Initiatives under goals
- `initiative_budgets` - Budget allocations
- `initiative_kpis` - Key performance indicators
- `milestones` - Project milestones

**Supporting Tables**:
- `comments` - User comments and feedback
- `attachments` - File attachments
- `activity_log` - Audit trail
- `notifications` - User notifications
- `tags` - Tagging system

All tables use Row-Level Security (RLS) policies for access control.

### Network Architecture

**Development Environment**:
- Next.js: `http://localhost:3000`
- Supabase API: `http://127.0.0.1:54321`
- Supabase Studio: `http://127.0.0.1:54323`
- PostgreSQL: `localhost:54322`
- Inbucket (email): `http://127.0.0.1:54324`

**Production Environment**:
- Application: `https://yourdomain.com`
- Supabase API: `https://yourproject.supabase.co`
- CDN: CloudFlare/AWS CloudFront (recommended)

---

## Infrastructure and Deployment

### Development Environment

#### System Requirements

**Minimum Requirements**:
- CPU: 2 cores
- RAM: 8 GB
- Disk: 20 GB free space
- OS: macOS, Linux, or Windows with WSL2

**Recommended Requirements**:
- CPU: 4+ cores
- RAM: 16 GB
- Disk: 50 GB free space (SSD recommended)
- OS: macOS or Linux

#### Required Software

**Core Dependencies**:
```bash
# Node.js 18+ (recommended: 24.2.0)
node --version

# npm 9+ (recommended: 11.3.0)
npm --version

# Git 2.x
git --version

# Docker Desktop (for local Supabase)
docker --version
docker-compose --version

# Supabase CLI
supabase --version
```

**Installation Commands**:

**macOS** (using Homebrew):
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@24

# Install Docker Desktop
brew install --cask docker

# Install Supabase CLI
brew install supabase/tap/supabase
```

**Linux** (Ubuntu/Debian):
```bash
# Install Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER

# Install Supabase CLI
brew install supabase/tap/supabase
# OR download from: https://github.com/supabase/cli/releases
```

### Production Environment

#### Hosting Options

**Recommended: Vercel + Supabase Cloud**

**Vercel (Frontend)**:
- Automatic deployments from Git
- Edge network (CDN)
- SSL certificates included
- Environment variable management
- Automatic scaling

**Supabase Cloud (Backend)**:
- Managed PostgreSQL database
- Automatic backups
- Point-in-time recovery
- Connection pooling
- Monitoring and alerts

**Alternative: Self-Hosted**

**Requirements**:
- Linux server (Ubuntu 22.04 LTS recommended)
- 4 CPU cores minimum
- 8 GB RAM minimum
- 100 GB disk space (SSD)
- Public IP address
- Domain name with SSL certificate

**Self-Hosted Architecture**:
```
┌─────────────────┐
│   Nginx/Caddy   │  ← Reverse proxy with SSL
└────────┬────────┘
         │
┌────────▼────────┐
│   Next.js App   │  ← Node.js process (PM2)
│   (Port 3000)   │
└────────┬────────┘
         │
┌────────▼────────┐
│    Supabase     │  ← Docker Compose
│   (Multiple     │
│   containers)   │
└─────────────────┘
```

#### Infrastructure as Code

**Docker Compose** (for self-hosted):
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    restart: always
    volumes:
      - ./logs:/app/logs

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: always
```

#### DNS Configuration

**Required DNS Records**:
```
# A Record
yourdomain.com.        A    <your-server-ip>

# CNAME for www
www.yourdomain.com.  CNAME  yourdomain.com.

# Optional: Subdomain for API
api.yourdomain.com.  CNAME  yourdomain.com.
```

### Deployment Process

#### Vercel Deployment (Recommended)

**Initial Setup**:

1. **Connect Git Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link project
   vercel link
   ```

2. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL`

3. **Deploy**:
   ```bash
   # Deploy to production
   vercel --prod
   ```

**Automatic Deployments**:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

#### Manual Deployment

**Build for Production**:
```bash
# Install dependencies
npm ci

# Build application
npm run build

# Test production build locally
npm start
```

**Deploy to Server**:
```bash
# SSH into server
ssh user@your-server.com

# Navigate to app directory
cd /var/www/strategic-planning

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build

# Restart application (using PM2)
pm2 restart strategic-planning
```

---

## Installation and Setup

### Fresh Installation

#### Step 1: Clone Repository

```bash
# Clone repository
git clone <repository-url>
cd "Stratic Plan"

# Verify files
ls -la
```

#### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

#### Step 3: Start Supabase

```bash
# Initialize Supabase (first time only)
supabase init

# Start Supabase local instance
supabase start

# This will output:
# - API URL: http://127.0.0.1:54321
# - Anon key: <your-anon-key>
# - Service role key: <your-service-key>
# - Studio URL: http://127.0.0.1:54323
```

#### Step 4: Configure Environment Variables

```bash
# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

#### Step 5: Run Migrations

```bash
# Apply database migrations
supabase db reset

# Verify migrations
supabase db diff
```

#### Step 6: Start Application

```bash
# Start Next.js development server
npm run dev

# Open browser to http://localhost:3000
```

#### Step 7: Verify Installation

**Health Checks**:

1. **Database Connection**:
   ```bash
   supabase status
   ```
   Should show all services running.

2. **Application Running**:
   - Open `http://localhost:3000`
   - Should see login page

3. **Supabase Studio**:
   - Open `http://127.0.0.1:54323`
   - Should see database tables

4. **Test Login**:
   - Use seed user credentials (see migrations/20250109000006_seed_data.sql)
   - Default admin: admin@example.com / password123

### Production Setup

#### Supabase Cloud Setup

1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Click "New Project"
   - Enter project name and database password
   - Select region (closest to users)
   - Click "Create Project"

2. **Get API Credentials**:
   - Project Settings → API
   - Copy:
     - Project URL
     - Anon/public key

3. **Run Migrations**:
   ```bash
   # Link to cloud project
   supabase link --project-ref <your-project-ref>

   # Push migrations
   supabase db push
   ```

4. **Configure Storage Buckets**:
   ```bash
   # Create storage buckets
   supabase storage create attachments
   supabase storage create branding

   # Set bucket policies (see RLS section)
   ```

#### Vercel Setup

1. **Import Project**:
   - Go to https://vercel.com
   - Click "Import Project"
   - Select Git repository
   - Click "Import"

2. **Configure Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Test deployment at provided URL

4. **Add Custom Domain** (optional):
   - Settings → Domains
   - Add your domain
   - Configure DNS as instructed

---

## Configuration Management

### Environment Variables

#### Required Variables

**Development** (`.env.local`):
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Production**:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-production-anon-key>

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

#### Optional Variables

```bash
# Email Configuration (if using custom SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-api-key>
SMTP_FROM=noreply@yourdomain.com

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=<your-analytics-id>

# Error Tracking (optional)
SENTRY_DSN=<your-sentry-dsn>

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_FEATURE_X=true
```

### Supabase Configuration

#### config.toml

Located at `supabase/config.toml`.

**Key Configuration Sections**:

**API Settings**:
```toml
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
max_rows = 1000  # Increase if needed for large reports
```

**Database Settings**:
```toml
[db]
port = 54322
major_version = 17

[db.pooler]
enabled = false  # Enable for production with high concurrency
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100
```

**Authentication Settings**:
```toml
[auth]
enabled = true
site_url = "http://127.0.0.1:3000"  # Update for production
jwt_expiry = 3600  # 1 hour
enable_signup = true  # Set to false for admin-only signup
minimum_password_length = 6  # Increase for security

[auth.email]
enable_signup = true
enable_confirmations = false  # Enable for production
```

**Storage Settings**:
```toml
[storage]
enabled = true
file_size_limit = "50MiB"  # Adjust based on needs
```

### Next.js Configuration

#### next.config.js

**Security Headers**:
```javascript
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
        {
          key: 'Content-Security-Policy',
          value: 'default-src \'self\'; ...',
        },
      ],
    },
  ]
}
```

**Image Optimization**:
```javascript
images: {
  domains: ['localhost', 'yourproject.supabase.co'],
  formats: ['image/webp'],
}
```

### Application Settings

#### System Settings (Database)

System-wide settings are stored in the database (if implemented):

```sql
-- Example settings table
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Common settings
INSERT INTO system_settings (key, value) VALUES
  ('municipality_name', '"City of Example"'),
  ('fiscal_year_start_month', '7'),  -- July
  ('max_plan_duration_years', '3'),
  ('require_budget_validation', 'true'),
  ('enable_notifications', 'true');
```

Access via Settings UI: Admin → Settings → General

---

## User Management

### Creating Users

#### Via Admin UI

1. Navigate to **Admin → Users**
2. Click **Create New User**
3. Fill in user details:
   - Email address (required)
   - First name (required)
   - Last name (required)
   - Role (required)
   - Department (if applicable)
   - Status: Active
4. Click **Send Invitation**

User receives email with invitation link to set password.

#### Via Supabase Studio

1. Open Supabase Studio: `http://127.0.0.1:54323`
2. Go to **Authentication → Users**
3. Click **Add User**
4. Enter email and temporary password
5. Check "Auto Confirm User" (for testing)
6. Click **Save**

Then update `public.users` table:
```sql
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  department_id,
  status
) VALUES (
  '<user-auth-id>',
  'user@example.com',
  'John',
  'Doe',
  'director',
  '<department-uuid>',
  'active'
);
```

#### Via SQL

```sql
-- Create auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'newuser@example.com',
  crypt('temporary_password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) RETURNING id;

-- Create public user record (use returned ID)
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  department_id,
  status
) VALUES (
  '<auth-user-id-from-above>',
  'newuser@example.com',
  'New',
  'User',
  'staff',
  '<department-uuid>',
  'active'
);
```

### User Roles

**Available Roles**:
- `admin` - Full system access
- `director` - Department director
- `staff` - Strategic planner
- `city_manager` - City Manager
- `finance` - Finance Director
- `council` - Council member (read-only)
- `public` - Public user (limited access)

**Changing User Role**:

```sql
UPDATE public.users
SET role = 'director'
WHERE email = 'user@example.com';
```

### Deactivating Users

**Via UI**:
1. Admin → Users → Select user
2. Change Status to "Inactive"
3. Save

**Via SQL**:
```sql
UPDATE public.users
SET
  status = 'inactive',
  updated_at = NOW()
WHERE email = 'user@example.com';
```

Inactive users:
- Cannot log in
- Do not receive notifications
- Data remains intact for audit purposes

### Resetting Passwords

#### User Self-Service

1. User clicks "Forgot Password?" on login page
2. Enters email address
3. Receives password reset email
4. Clicks link and sets new password

#### Admin Reset

**Via Supabase Studio**:
1. Authentication → Users → Select user
2. Click "Send Password Recovery"
3. User receives reset email

**Force Reset** (SQL):
```sql
-- Update user to require password change
UPDATE auth.users
SET
  encrypted_password = crypt('TempPassword123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'user@example.com';
```

### Bulk User Import

**CSV Format**:
```csv
email,first_name,last_name,role,department_code
john.doe@example.com,John,Doe,director,PARKS
jane.smith@example.com,Jane,Smith,staff,PARKS
```

**Import Script** (Node.js):
```javascript
// scripts/import-users.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const csvParser = require('csv-parser')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function importUsers(csvPath) {
  const users = []

  fs.createReadStream(csvPath)
    .pipe(csvParser())
    .on('data', (row) => users.push(row))
    .on('end', async () => {
      for (const user of users) {
        // Create auth user
        const { data: authUser, error } = await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: {
            first_name: user.first_name,
            last_name: user.last_name,
          }
        })

        if (error) {
          console.error(`Error creating ${user.email}:`, error)
          continue
        }

        // Get department ID
        const { data: dept } = await supabase
          .from('departments')
          .select('id')
          .eq('code', user.department_code)
          .single()

        // Create public user record
        await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            department_id: dept?.id,
            status: 'active',
          })

        console.log(`Created user: ${user.email}`)
      }
    })
}

importUsers('./users.csv')
```

Run: `node scripts/import-users.js`

---

## Security and Access Control

### Authentication

#### Supabase Auth Configuration

**Email/Password Authentication**:
- Enabled by default
- Minimum password length: 6 characters (configurable)
- Password hashed with bcrypt
- Session token expires after 1 hour (configurable)

**Email Confirmation** (Production):
```toml
[auth.email]
enable_confirmations = true
```

When enabled:
- New users must confirm email before login
- Confirmation email sent automatically
- Confirmation link expires after 24 hours

#### Session Management

**Session Duration**:
```toml
[auth]
jwt_expiry = 3600  # 1 hour
```

**Session Timeout** (Inactivity):
```toml
[auth.sessions]
inactivity_timeout = "8h"
```

**Refresh Token Rotation**:
```toml
[auth]
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10
```

### Authorization (RLS Policies)

#### Row-Level Security Overview

All tables use RLS to enforce authorization:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can view their own record
CREATE POLICY "Users can view own record"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
```

#### Helper Functions

Located in migrations, key functions:

**Get User Role**:
```sql
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

**Check Department Access**:
```sql
CREATE OR REPLACE FUNCTION public.user_has_department_access(
  user_id uuid,
  dept_id uuid
)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND (role IN ('admin', 'city_manager', 'finance')
         OR department_id = dept_id)
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

#### Policy Examples

**Strategic Plans**:
```sql
-- Department directors can view their department's plans
CREATE POLICY "Directors view own department plans"
  ON strategic_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.department_id = strategic_plans.department_id
      AND users.role IN ('director', 'staff')
    )
  );

-- City Manager can view all plans
CREATE POLICY "City Manager views all plans"
  ON strategic_plans
  FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'city_manager'
  );
```

**Initiatives**:
```sql
-- Users can view initiatives in their department's plans
CREATE POLICY "View department initiatives"
  ON initiatives
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM strategic_plans sp
      INNER JOIN users u ON u.department_id = sp.department_id
      WHERE sp.id = initiatives.plan_id
      AND u.id = auth.uid()
    )
  );
```

#### Reviewing RLS Policies

**List all policies**:
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Test policies**:
```sql
-- Set role to test user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO '<user-uuid>';

-- Try query
SELECT * FROM strategic_plans;

-- Reset
RESET role;
```

### API Security

#### Rate Limiting

**Supabase Rate Limits** (`config.toml`):
```toml
[auth.rate_limit]
email_sent = 2  # emails per hour
token_refresh = 150  # per 5 minutes per IP
sign_in_sign_ups = 30  # per 5 minutes per IP
```

**Application Rate Limiting**:

Add middleware for additional protection:
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const limit = 100 // requests per minute
  const windowMs = 60 * 1000

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 0, resetTime: Date.now() + windowMs })
  }

  const rateLimitData = rateLimitMap.get(ip)

  if (Date.now() > rateLimitData.resetTime) {
    rateLimitData.count = 0
    rateLimitData.resetTime = Date.now() + windowMs
  }

  rateLimitData.count++

  if (rateLimitData.count > limit) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  return NextResponse.next()
}
```

#### CORS Configuration

**Supabase CORS** (managed automatically for your domain)

**Next.js API Routes**:
```typescript
// app/api/route.ts
export async function GET(request: Request) {
  return new Response(JSON.stringify({ data: 'response' }), {
    headers: {
      'Access-Control-Allow-Origin': 'https://yourdomain.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

#### Content Security Policy

Configured in `next.config.js`:

**Production CSP**:
```javascript
'Content-Security-Policy': `
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self' https://yourproject.supabase.co;
  frame-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`
```

### SSL/TLS Configuration

#### Vercel

- SSL certificates automatically provisioned via Let's Encrypt
- Auto-renewal
- HTTPS enforced by default

#### Self-Hosted (Nginx)

**Obtain Certificate** (Let's Encrypt):
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (cron job added automatically)
```

**Nginx SSL Configuration**:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Database Administration

### Database Access

#### Local Development

**psql Connection**:
```bash
# Get connection details
supabase status

# Connect with psql
psql postgresql://postgres:postgres@localhost:54322/postgres
```

**Supabase Studio**:
- Open `http://127.0.0.1:54323`
- Navigate to Database → Tables

#### Production (Supabase Cloud)

**Connection Pooler**:
```bash
# Connection string (from Supabase dashboard)
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**Direct Connection** (for admin tasks):
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Database Migrations

#### Creating Migrations

**Generate New Migration**:
```bash
# Create new migration file
supabase migration new add_feature_x

# Edit file in supabase/migrations/
```

**Example Migration**:
```sql
-- supabase/migrations/20250115000001_add_feature_x.sql

-- Add new column
ALTER TABLE initiatives
ADD COLUMN IF NOT EXISTS priority_score INTEGER;

-- Create index
CREATE INDEX IF NOT EXISTS idx_initiatives_priority_score
  ON initiatives(priority_score);

-- Update RLS policy
CREATE POLICY "Allow priority score update"
  ON initiatives
  FOR UPDATE
  USING (user_has_department_access(auth.uid(), plan_id));
```

#### Applying Migrations

**Local Development**:
```bash
# Apply all pending migrations
supabase db reset

# OR apply specific migration
psql < supabase/migrations/20250115000001_add_feature_x.sql
```

**Production**:
```bash
# Link to production project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push

# Verify
supabase db diff
```

#### Rolling Back Migrations

**Create Rollback Migration**:
```sql
-- supabase/migrations/20250115000002_rollback_feature_x.sql

-- Remove column
ALTER TABLE initiatives
DROP COLUMN IF EXISTS priority_score;

-- Drop index
DROP INDEX IF EXISTS idx_initiatives_priority_score;

-- Drop policy
DROP POLICY IF EXISTS "Allow priority score update" ON initiatives;
```

Apply rollback:
```bash
supabase db push
```

### Database Maintenance

#### Vacuum and Analyze

**Auto-vacuum** (enabled by default in PostgreSQL):
```sql
-- Check auto-vacuum settings
SHOW autovacuum;

-- Manual vacuum (if needed)
VACUUM ANALYZE;

-- Vacuum specific table
VACUUM ANALYZE strategic_plans;
```

#### Reindexing

```sql
-- Reindex all indexes in database
REINDEX DATABASE postgres;

-- Reindex specific table
REINDEX TABLE strategic_plans;

-- Reindex specific index
REINDEX INDEX idx_plans_department_id;
```

#### Monitoring Table Sizes

```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index sizes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Database Optimization

#### Query Performance

**Slow Query Log** (Supabase Cloud):
- Dashboard → Database → Performance
- View slow queries
- Analyze execution plans

**Manual Query Analysis**:
```sql
-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM strategic_plans
WHERE department_id = '<uuid>'
AND fiscal_year_start >= '2025-07-01';

-- Check for missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
AND tablename = 'strategic_plans';
```

#### Index Optimization

**Create Indexes**:
```sql
-- Composite index for common query
CREATE INDEX idx_plans_dept_fy
  ON strategic_plans(department_id, fiscal_year_start);

-- Partial index for active plans
CREATE INDEX idx_active_plans
  ON strategic_plans(status)
  WHERE status IN ('active', 'under_review');

-- GIN index for JSONB search
CREATE INDEX idx_swot_analysis_gin
  ON strategic_plans USING GIN(swot_analysis);
```

**Remove Unused Indexes**:
```sql
-- Find unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';

-- Drop unused index
DROP INDEX idx_unused_index;
```

#### Connection Pooling

**Enable in Supabase** (`config.toml`):
```toml
[db.pooler]
enabled = true
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100
```

**Application Connection Pooling**:
```typescript
// Use Supabase's connection pooler URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
```

---

## Backup and Recovery

### Backup Strategy

#### Backup Types

**Full Backup** (Supabase Cloud):
- Automatic daily backups
- Retained for 7 days (Free plan)
- Retained for 30 days (Pro plan)
- Point-in-time recovery (Pro plan)

**Local Backups**:
```bash
# Full database dump
pg_dump -h localhost -p 54322 -U postgres -F c -f backup_$(date +%Y%m%d).dump postgres

# Schema only
pg_dump -h localhost -p 54322 -U postgres -s -f schema_$(date +%Y%m%d).sql postgres

# Data only
pg_dump -h localhost -p 54322 -U postgres -a -f data_$(date +%Y%m%d).sql postgres
```

#### Automated Backups

**Cron Job** (self-hosted):
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-database.sh

# Backup script: /usr/local/bin/backup-database.sh
#!/bin/bash
BACKUP_DIR="/var/backups/strategic-planning"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_$DATE.dump"

# Create backup
pg_dump -h localhost -p 5432 -U postgres -F c -f "$BACKUP_DIR/$FILENAME" postgres

# Compress
gzip "$BACKUP_DIR/$FILENAME"

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.dump.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/$FILENAME.gz" s3://your-bucket/backups/
```

#### Storage Backups

**Supabase Storage**:
- Bucket data backed up with database
- Files stored on S3-compatible storage
- No additional backup needed

**Manual Storage Backup**:
```bash
# Download all files from bucket
supabase storage download attachments --recursive

# Or use rclone to sync to external storage
rclone sync supabase:attachments /backup/storage/attachments
```

### Restore Procedures

#### Database Restore

**From Local Backup**:
```bash
# Stop application
pm2 stop strategic-planning

# Restore database
pg_restore -h localhost -p 54322 -U postgres -d postgres -c backup_20250115.dump

# Restart application
pm2 start strategic-planning
```

**From Supabase Cloud Backup**:
1. Go to Supabase Dashboard
2. Database → Backups
3. Select backup to restore
4. Click "Restore"
5. Confirm restoration

**Point-in-Time Recovery** (Pro plan):
1. Dashboard → Database → Backups
2. Click "Point-in-Time Recovery"
3. Select date and time
4. Click "Restore"

#### Partial Restore

**Restore Single Table**:
```bash
# Extract table from backup
pg_restore -h localhost -p 54322 -U postgres -d postgres -t strategic_plans backup.dump

# Or restore from SQL file
psql -h localhost -p 54322 -U postgres -d postgres -f strategic_plans_backup.sql
```

#### Storage Restore

**Restore Files to Supabase Storage**:
```bash
# Upload files back to bucket
supabase storage upload attachments /backup/storage/attachments --recursive
```

### Disaster Recovery

#### Disaster Recovery Plan

**RTO (Recovery Time Objective)**: 4 hours
**RPO (Recovery Point Objective)**: 24 hours (daily backups)

**Recovery Steps**:

1. **Assess Situation**:
   - Identify scope of failure
   - Determine last known good state
   - Notify stakeholders

2. **Deploy New Infrastructure** (if needed):
   ```bash
   # Deploy application to new server/environment
   git clone <repository-url>
   cd strategic-planning
   npm ci
   npm run build
   pm2 start ecosystem.config.js
   ```

3. **Restore Database**:
   ```bash
   # Restore from latest backup
   pg_restore -d postgres backup_latest.dump
   ```

4. **Restore Storage**:
   ```bash
   # Re-upload files to storage buckets
   supabase storage upload attachments /backup/storage/attachments --recursive
   ```

5. **Update DNS**:
   ```bash
   # Point domain to new server
   # Update A record to new IP
   ```

6. **Verify System**:
   - Test login
   - Verify database connectivity
   - Check file uploads
   - Test key workflows

7. **Monitor**:
   - Check logs for errors
   - Monitor performance
   - Verify all services running

#### Testing Disaster Recovery

**Quarterly DR Test**:
1. Schedule maintenance window
2. Restore backups to test environment
3. Verify data integrity
4. Test application functionality
5. Document results and issues
6. Update DR plan as needed

---

## Monitoring and Logging

### Application Monitoring

#### Health Checks

**Endpoint**: `/api/health`

```typescript
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  // Check database connection
  const { error: dbError } = await supabase
    .from('users')
    .select('count')
    .limit(1)

  if (dbError) {
    return Response.json({ status: 'unhealthy', error: dbError.message }, { status: 503 })
  }

  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
  })
}
```

**Automated Health Check** (cron):
```bash
# Check every 5 minutes
*/5 * * * * curl -f https://yourdomain.com/api/health || echo "Health check failed" | mail -s "Alert: App Down" admin@example.com
```

#### Uptime Monitoring

**External Services**:
- UptimeRobot (free, 5-minute checks)
- Pingdom
- Datadog
- New Relic

**Configuration Example** (UptimeRobot):
1. Monitor Type: HTTP(s)
2. URL: https://yourdomain.com/api/health
3. Interval: 5 minutes
4. Alert Contact: email/SMS

### Logging

#### Application Logs

**Next.js Logs** (development):
```bash
# All logs go to console
npm run dev
```

**Production Logs** (PM2):
```bash
# View logs
pm2 logs strategic-planning

# View error logs only
pm2 logs strategic-planning --err

# Clear logs
pm2 flush

# Log file locations
~/.pm2/logs/strategic-planning-out.log
~/.pm2/logs/strategic-planning-error.log
```

**Custom Logging**:
```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
})

// Usage
import { logger } from '@/lib/logger'

logger.info({ userId, planId }, 'Plan created')
logger.error({ error }, 'Database error')
```

#### Database Logs

**Supabase Cloud**:
- Dashboard → Logs
- Filter by:
  - Database queries
  - API requests
  - Authentication events
  - Storage operations

**Query Logs** (PostgreSQL):
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- View logs
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

#### Access Logs

**Nginx Access Log**:
```nginx
# /etc/nginx/nginx.conf
http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
}
```

**View Logs**:
```bash
# Tail access log
tail -f /var/log/nginx/access.log

# View error log
tail -f /var/log/nginx/error.log

# Parse for specific IP
grep "192.168.1.100" /var/log/nginx/access.log

# Count requests by status code
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
```

### Audit Trail

**Activity Log Table**:
```sql
SELECT
  al.created_at,
  u.email AS user_email,
  al.action,
  al.resource_type,
  al.resource_id,
  al.details
FROM activity_log al
JOIN users u ON u.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 100;
```

**Export Audit Log**:
```bash
# CSV export
psql -h localhost -U postgres -d postgres -c "COPY (
  SELECT * FROM activity_log WHERE created_at >= NOW() - INTERVAL '30 days'
) TO STDOUT WITH CSV HEADER" > audit_log_$(date +%Y%m%d).csv
```

### Performance Monitoring

#### Application Performance

**Vercel Analytics** (automatic if using Vercel):
- Dashboard → Analytics
- View:
  - Page load times
  - Core Web Vitals
  - Geographic distribution
  - Browser/device breakdown

**Custom Performance Tracking**:
```typescript
// lib/performance.ts
export function trackPerformance(metricName: string, value: number) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('Performance Metric', {
      metric: metricName,
      value,
      timestamp: Date.now(),
    })
  }
}

// Usage
const startTime = performance.now()
// ... operation ...
const endTime = performance.now()
trackPerformance('plan_creation_time', endTime - startTime)
```

#### Database Performance

**Query Performance** (Supabase Dashboard):
- Database → Performance
- View slow queries
- View most frequent queries

**Custom Monitoring**:
```sql
-- Active queries
SELECT pid, usename, application_name, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle'
AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start;

-- Long-running queries
SELECT pid, now() - query_start AS duration, usename, query
FROM pg_stat_activity
WHERE state != 'idle'
AND now() - query_start > interval '5 minutes'
ORDER BY duration DESC;

-- Kill long-running query
SELECT pg_terminate_backend(PID);
```

### Alerting

#### Email Alerts

**Error Notifications**:
```typescript
// lib/notifications.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendErrorAlert(error: Error) {
  await transporter.sendMail({
    from: 'alerts@yourdomain.com',
    to: 'admin@yourdomain.com',
    subject: `[ALERT] Application Error: ${error.message}`,
    text: `
      Error: ${error.message}
      Stack: ${error.stack}
      Timestamp: ${new Date().toISOString()}
    `,
  })
}
```

#### Slack Notifications

```typescript
// lib/slack.ts
export async function sendSlackAlert(message: string) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message,
      username: 'Strategic Planning Alert',
      icon_emoji: ':warning:',
    }),
  })
}

// Usage
await sendSlackAlert(`Database backup failed: ${error.message}`)
```

---

## Performance Optimization

### Frontend Optimization

#### Image Optimization

**Next.js Image Component**:
```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // for above-the-fold images
/>
```

**Configure** (`next.config.js`):
```javascript
images: {
  domains: ['yourproject.supabase.co'],
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 60,
}
```

#### Code Splitting

**Dynamic Imports**:
```typescript
// Load heavy component only when needed
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // disable server-side rendering if needed
})
```

#### Caching

**React Server Components** (automatic caching):
```typescript
// app/plans/page.tsx
export const revalidate = 300 // revalidate every 5 minutes

async function getPlans() {
  const supabase = createClient()
  const { data } = await supabase
    .from('strategic_plans')
    .select('*')
  return data
}
```

**API Route Caching**:
```typescript
// app/api/plans/route.ts
export async function GET() {
  const data = await getPlans()

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
```

### Database Optimization

#### Query Optimization

**Use Indexes**:
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_plans_status ON strategic_plans(status);
CREATE INDEX idx_plans_dept_fy ON strategic_plans(department_id, fiscal_year_start);
```

**Optimize Queries**:
```typescript
// BAD: N+1 query problem
const plans = await supabase.from('strategic_plans').select('*')
for (const plan of plans.data) {
  const { data: goals } = await supabase
    .from('goals')
    .eq('plan_id', plan.id)
}

// GOOD: Use joins
const { data } = await supabase
  .from('strategic_plans')
  .select(`
    *,
    goals (*)
  `)
```

#### Connection Pooling

**Enable Pooler** (`config.toml`):
```toml
[db.pooler]
enabled = true
pool_mode = "transaction"
default_pool_size = 20
max_client_conn = 100
```

**Use Pooler URL**:
```
# Connection pooler URL (6543 port)
postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres
```

### CDN and Caching

#### Vercel Edge Network

- Static assets automatically cached
- Edge functions for dynamic content
- Automatic geographic distribution

#### Cache-Control Headers

```typescript
// app/api/public/route.ts
export async function GET() {
  return Response.json(data, {
    headers: {
      // Public, cache for 1 hour, stale for 1 day
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
```

### Load Testing

#### Apache Bench

```bash
# Test endpoint
ab -n 1000 -c 10 https://yourdomain.com/api/plans

# Results show:
# - Requests per second
# - Time per request
# - Transfer rate
```

#### Artillery

```yaml
# load-test.yml
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/api/health"
      - get:
          url: "/api/plans"
```

Run: `artillery run load-test.yml`

---

## Troubleshooting

### Common Issues

#### Application Won't Start

**Symptoms**:
- `npm run dev` fails
- Error messages on startup

**Diagnostics**:
```bash
# Check Node.js version
node --version

# Check for port conflicts
lsof -i :3000

# Check environment variables
cat .env.local

# Check for syntax errors
npm run lint
```

**Solutions**:
1. **Port in use**: Kill process or use different port
   ```bash
   # Kill process on port 3000
   kill -9 $(lsof -t -i:3000)

   # Or use different port
   PORT=3001 npm run dev
   ```

2. **Missing dependencies**: Reinstall
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Environment variables missing**: Check `.env.local`

#### Database Connection Failed

**Symptoms**:
- "Connection refused" errors
- Timeout errors
- RLS policy errors

**Diagnostics**:
```bash
# Check Supabase status
supabase status

# Test connection
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1"

# Check RLS policies
psql -c "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public'"
```

**Solutions**:
1. **Supabase not running**: Start it
   ```bash
   supabase start
   ```

2. **Wrong connection string**: Verify environment variables

3. **RLS blocking query**: Check policies
   ```sql
   -- Temporarily disable RLS for testing
   ALTER TABLE strategic_plans DISABLE ROW LEVEL SECURITY;

   -- Re-enable after testing
   ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
   ```

#### Authentication Issues

**Symptoms**:
- Users can't log in
- Session expired errors
- "Unauthorized" errors

**Diagnostics**:
```bash
# Check auth users
supabase db psql -c "SELECT email, email_confirmed_at FROM auth.users"

# Check user roles
psql -c "SELECT email, role, status FROM public.users"

# Check JWT expiry
supabase db psql -c "SHOW app.settings.jwt_exp"
```

**Solutions**:
1. **Email not confirmed**: Confirm manually
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = NOW()
   WHERE email = 'user@example.com';
   ```

2. **User inactive**: Activate
   ```sql
   UPDATE public.users
   SET status = 'active'
   WHERE email = 'user@example.com';
   ```

3. **Session expired**: User needs to log in again

#### Performance Issues

**Symptoms**:
- Slow page loads
- Timeouts
- High CPU/memory usage

**Diagnostics**:
```sql
-- Slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_table_size(schemaname||'.'||tablename)) as size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
```

**Solutions**:
1. **Add indexes**: Create indexes for slow queries
2. **Optimize queries**: Use EXPLAIN ANALYZE
3. **Enable connection pooling**
4. **Vacuum database**: `VACUUM ANALYZE`

### Debug Mode

**Enable Detailed Logging**:
```bash
# .env.local
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG=true
```

**Supabase Debug**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key, {
  auth: {
    debug: true, // Log auth events
  },
})
```

### Error Tracking

#### Sentry Integration

```bash
# Install Sentry
npm install @sentry/nextjs
```

**Configure** (`sentry.client.config.ts`):
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Support Contacts

**Internal Support**:
- Email: it-support@yourmunicipalityemail.com
- Slack: #strategic-planning-support

**Vendor Support**:
- Supabase: https://supabase.com/support
- Vercel: https://vercel.com/support
- Next.js: https://github.com/vercel/next.js/discussions

---

## Maintenance Procedures

### Daily Tasks

- [ ] Check system health dashboard
- [ ] Review error logs
- [ ] Monitor disk space usage
- [ ] Verify backups completed successfully

### Weekly Tasks

- [ ] Review slow query log
- [ ] Check database table sizes
- [ ] Review user support tickets
- [ ] Update system documentation (if needed)

### Monthly Tasks

- [ ] Apply security patches
- [ ] Review access logs for anomalies
- [ ] Test backup restoration
- [ ] Review and optimize database indexes
- [ ] Update dependencies (`npm audit`, `npm update`)

### Quarterly Tasks

- [ ] Disaster recovery test
- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning review
- [ ] User access audit

### Annual Tasks

- [ ] SSL certificate renewal (if not auto-renewing)
- [ ] Major version upgrades (Next.js, Node.js)
- [ ] Infrastructure review
- [ ] Comprehensive security assessment

---

## Upgrade and Migration

### Upgrading Dependencies

**Check for Updates**:
```bash
# Check outdated packages
npm outdated

# Update to latest
npm update

# Or use npm-check-updates
npx npm-check-updates -u
npm install
```

**Test After Upgrade**:
```bash
npm run build
npm run lint
npm test  # if tests exist
```

### Next.js Version Upgrade

**Example: v14.0 → v14.2**:

1. **Review Breaking Changes**:
   - https://nextjs.org/docs/upgrading

2. **Update Package**:
   ```bash
   npm install next@latest react@latest react-dom@latest
   ```

3. **Update Code** (if needed):
   - Follow migration guide
   - Update deprecated APIs

4. **Test Thoroughly**:
   - All routes
   - Server actions
   - API endpoints

### Database Schema Changes

See [Database Migrations](#database-migrations) section.

### Node.js Version Upgrade

**Example: v20 → v24**:

1. **Update Locally**:
   ```bash
   # Install new version
   brew install node@24

   # Update symlink
   brew link node@24
   ```

2. **Update Production**:
   ```bash
   # Using nvm
   nvm install 24
   nvm use 24

   # Rebuild node modules
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Update CI/CD**:
   ```yaml
   # .github/workflows/deploy.yml
   - uses: actions/setup-node@v3
     with:
       node-version: '24'
   ```

---

## Integration Management

### Email Service (SMTP)

**Configure** (`config.toml`):
```toml
[auth.email.smtp]
enabled = true
host = "smtp.sendgrid.net"
port = 587
user = "apikey"
pass = "env(SENDGRID_API_KEY)"
admin_email = "admin@yourdomain.com"
sender_name = "Strategic Planning System"
```

**Test Email**:
```bash
# Send test email via Supabase
supabase functions invoke send-email --data '{"to":"test@example.com"}'
```

### Single Sign-On (SSO)

**Azure AD Example**:

1. **Configure Azure AD Application**:
   - Register application
   - Configure redirect URIs
   - Get client ID and secret

2. **Configure Supabase** (`config.toml`):
   ```toml
   [auth.external.azure]
   enabled = true
   client_id = "env(AZURE_CLIENT_ID)"
   secret = "env(AZURE_CLIENT_SECRET)"
   url = "https://login.microsoftonline.com/{tenant-id}/v2.0"
   ```

3. **Update Login Page**:
   ```typescript
   const { error } = await supabase.auth.signInWithOAuth({
     provider: 'azure',
     options: {
       scopes: 'email',
     },
   })
   ```

### Analytics Integration

**Google Analytics**:
```typescript
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## Disaster Recovery

### Recovery Scenarios

#### Scenario 1: Database Corruption

**Detection**: Database errors, inconsistent data

**Recovery**:
1. Stop application
2. Restore database from latest backup
3. Apply any missing transactions (from logs)
4. Restart application
5. Verify data integrity

#### Scenario 2: Complete Server Failure

**Detection**: Server unreachable, hardware failure

**Recovery**:
1. Provision new server
2. Deploy application code
3. Restore database backup
4. Restore file storage
5. Update DNS records
6. Test thoroughly
7. Switch traffic to new server

#### Scenario 3: Data Breach

**Detection**: Unauthorized access detected

**Response**:
1. Immediately disable compromised accounts
2. Review access logs
3. Reset all passwords
4. Rotate API keys and secrets
5. Notify affected users (if required by law)
6. Conduct security audit
7. Implement additional security measures

---

## Security Hardening

### Application Security

- [ ] Keep dependencies updated (`npm audit`)
- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Enable CSRF protection
- [ ] Set secure headers (CSP, HSTS, etc.)
- [ ] Sanitize user input
- [ ] Use parameterized queries (automatic with Supabase)
- [ ] Log security events

### Database Security

- [ ] Use strong database passwords
- [ ] Enable RLS on all tables
- [ ] Grant minimum necessary permissions
- [ ] Disable unused extensions
- [ ] Encrypt backups
- [ ] Audit database access regularly

### Infrastructure Security

- [ ] Use firewall rules
- [ ] Keep OS and software updated
- [ ] Disable unused services
- [ ] Use SSH keys (not passwords)
- [ ] Enable fail2ban (for self-hosted)
- [ ] Configure intrusion detection

### Compliance

**GDPR** (if applicable):
- [ ] Implement data retention policies
- [ ] Provide data export functionality
- [ ] Allow users to delete accounts
- [ ] Maintain data processing records
- [ ] Ensure data encryption

**Government Requirements**:
- [ ] Maintain comprehensive audit logs
- [ ] Implement access controls
- [ ] Document security procedures
- [ ] Conduct regular security assessments

---

## Support and Escalation

### Support Tiers

**Tier 1: User Support**
- Handle: Login issues, password resets, basic questions
- Response Time: Same business day
- Escalate: Complex technical issues, bugs

**Tier 2: System Administrator**
- Handle: Configuration, user management, basic troubleshooting
- Response Time: 4 hours
- Escalate: Database issues, infrastructure problems

**Tier 3: Developer/DBA**
- Handle: Code bugs, database problems, performance issues
- Response Time: 1 business day
- Escalate: Critical system failures

**Tier 4: Vendor Support**
- Handle: Platform-level issues (Supabase, Vercel)
- Response Time: Per vendor SLA

### Incident Response

**Severity Levels**:

**Critical (P1)**:
- System down, all users affected
- Data loss or corruption
- Security breach
- Response: Immediate, 24/7

**High (P2)**:
- Major feature broken
- Many users affected
- Performance severely degraded
- Response: 2 hours during business hours

**Medium (P3)**:
- Minor feature broken
- Few users affected
- Workaround available
- Response: Next business day

**Low (P4)**:
- Cosmetic issue
- Feature request
- Documentation update
- Response: As resources allow

### Contact Information

**System Administrator**:
- Email: sysadmin@yourmunicipalityemail.com
- Phone: (XXX) XXX-XXXX
- On-call: [rotation schedule]

**Database Administrator**:
- Email: dba@yourmunicipalityemail.com

**IT Support**:
- Email: support@yourmunicipalityemail.com
- Help Desk: [ticket system URL]

**Vendor Support**:
- Supabase: https://supabase.com/dashboard/support
- Vercel: https://vercel.com/help

---

## Appendix

### Useful SQL Queries

**User Statistics**:
```sql
SELECT
  role,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count
FROM users
GROUP BY role;
```

**Plan Statistics**:
```sql
SELECT
  d.name as department,
  COUNT(*) as plan_count,
  COUNT(*) FILTER (WHERE sp.status = 'approved') as approved_count
FROM strategic_plans sp
JOIN departments d ON d.id = sp.department_id
GROUP BY d.name
ORDER BY plan_count DESC;
```

**Storage Usage**:
```sql
SELECT
  bucket_id,
  COUNT(*) as file_count,
  SUM(LENGTH(metadata::text)) as total_size_bytes,
  pg_size_pretty(SUM(LENGTH(metadata::text))::bigint) as total_size
FROM storage.objects
GROUP BY bucket_id;
```

### Useful Commands

**Supabase CLI**:
```bash
supabase status           # Check status
supabase start            # Start local instance
supabase stop             # Stop local instance
supabase db reset         # Reset database with migrations
supabase db push          # Push migrations to remote
supabase db pull          # Pull schema from remote
supabase db diff          # Show diff between local and remote
supabase functions deploy # Deploy edge functions
```

**PM2 Commands**:
```bash
pm2 start app.js          # Start application
pm2 stop app              # Stop application
pm2 restart app           # Restart application
pm2 reload app            # Reload (zero-downtime)
pm2 logs app              # View logs
pm2 monit                 # Monitor resources
pm2 list                  # List all processes
pm2 save                  # Save process list
pm2 startup               # Generate startup script
```

### Configuration Templates

**PM2 Ecosystem File**:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'strategic-planning',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/strategic-planning',
    instances: 2,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
}
```

**Nginx Configuration**:
```nginx
# /etc/nginx/sites-available/strategic-planning
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }
}
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | January 2025 | Initial release | System Administration Team |

---

**Document Information**:
- **Document Version**: 1.0
- **Last Updated**: January 2025
- **Maintained By**: System Administration Team
- **Contact**: sysadmin@yourmunicipalityemail.com

---

**End of System Administration Guide**

For additional support or questions, contact the IT Support team or refer to the vendor documentation links provided throughout this guide.
