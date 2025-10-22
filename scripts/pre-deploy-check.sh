#!/bin/bash

# ===========================================
# Pre-Deployment Validation Script
# ===========================================
# This script validates the environment and configuration
# before deploying to production
#
# Usage: ./scripts/pre-deploy-check.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        print_success "$1 is installed ($(command -v $1))"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

check_env_var() {
    if [ -z "${!1}" ]; then
        print_error "Environment variable $1 is not set"
        return 1
    else
        # Don't print the actual value for security
        print_success "Environment variable $1 is set"
        return 0
    fi
}

check_env_var_warn() {
    if [ -z "${!1}" ]; then
        print_warning "Optional environment variable $1 is not set"
        return 1
    else
        print_success "Environment variable $1 is set"
        return 0
    fi
}

check_file_exists() {
    if [ -f "$1" ]; then
        print_success "File exists: $1"
        return 0
    else
        print_error "File not found: $1"
        return 1
    fi
}

# ===========================
# Start Validation
# ===========================
print_header "PRODUCTION DEPLOYMENT PRE-CHECK"
echo "Starting validation at $(date)"
echo ""

# ===========================
# 1. System Requirements
# ===========================
print_header "1. System Requirements"

check_command "node"
check_command "npm"
check_command "docker"
check_command "docker-compose"
check_command "git"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    print_success "Node.js version is $NODE_VERSION (>= 18)"
else
    print_error "Node.js version $NODE_VERSION is too old (need >= 18)"
fi

# ===========================
# 2. Environment Configuration
# ===========================
print_header "2. Environment Configuration"

# Check if .env.production exists
if [ -f ".env.production" ]; then
    print_success ".env.production file exists"
    source .env.production
else
    print_error ".env.production file not found"
    echo "  Copy .env.production.template to .env.production and configure it"
    exit 1
fi

# Check required environment variables
check_env_var "NEXT_PUBLIC_SUPABASE_URL"
check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_env_var "SUPABASE_SERVICE_ROLE_KEY"
check_env_var "NEXT_PUBLIC_APP_URL"
check_env_var "NODE_ENV"

# Check database variables (if self-hosted)
if [ ! -z "$POSTGRES_PASSWORD" ]; then
    check_env_var "JWT_SECRET"
    check_env_var "ANON_KEY"
    check_env_var "SERVICE_ROLE_KEY"
fi

# Check optional but recommended variables
check_env_var_warn "SENTRY_DSN"
check_env_var_warn "REDIS_URL"

# ===========================
# 3. Security Checks
# ===========================
print_header "3. Security Checks"

# Check for default/weak passwords
if grep -q "password123" .env.production 2>/dev/null; then
    print_error "Default password 'password123' found in .env.production"
fi

if grep -q "changeme" .env.production 2>/dev/null; then
    print_error "Placeholder 'changeme' found in .env.production"
fi

# Check file permissions
PERM=$(stat -f "%OLp" .env.production 2>/dev/null || stat -c "%a" .env.production 2>/dev/null)
if [ "$PERM" = "600" ] || [ "$PERM" = "400" ]; then
    print_success ".env.production has secure permissions ($PERM)"
else
    print_warning ".env.production permissions are $PERM (recommend 600)"
fi

# Check if .env files are in .gitignore
if grep -q "\.env\.production" .gitignore 2>/dev/null; then
    print_success ".env.production is in .gitignore"
else
    print_error ".env.production is NOT in .gitignore"
fi

# ===========================
# 4. Required Files
# ===========================
print_header "4. Required Files"

check_file_exists "package.json"
check_file_exists "next.config.js"
check_file_exists "Dockerfile"
check_file_exists "docker-compose.production.yml"
check_file_exists "nginx.conf"

# ===========================
# 5. Dependencies
# ===========================
print_header "5. Dependencies"

if [ -d "node_modules" ]; then
    print_success "node_modules directory exists"
else
    print_error "node_modules not found. Run: npm install"
fi

# Check for security vulnerabilities
print_info "Checking for security vulnerabilities..."
if npm audit --audit-level=high --production > /dev/null 2>&1; then
    print_success "No high-severity vulnerabilities found"
else
    print_warning "Security vulnerabilities detected. Run: npm audit"
fi

# ===========================
# 6. Build Test
# ===========================
print_header "6. Build Test"

print_info "Testing production build..."
if npm run build > /tmp/build.log 2>&1; then
    print_success "Production build successful"
else
    print_error "Production build failed. Check /tmp/build.log"
    tail -20 /tmp/build.log
fi

# ===========================
# 7. Code Quality
# ===========================
print_header "7. Code Quality"

print_info "Running linter..."
if npm run lint > /dev/null 2>&1; then
    print_success "Linting passed"
else
    print_warning "Linting issues found. Run: npm run lint"
fi

print_info "Running type check..."
if npm run type-check > /dev/null 2>&1; then
    print_success "Type checking passed"
else
    print_warning "Type checking issues found. Run: npm run type-check"
fi

# ===========================
# 8. Docker Configuration
# ===========================
print_header "8. Docker Configuration"

# Validate docker-compose file
if docker-compose -f docker-compose.production.yml config > /dev/null 2>&1; then
    print_success "docker-compose.production.yml is valid"
else
    print_error "docker-compose.production.yml has errors"
fi

# Check if SSL certificates exist
if [ -d "ssl" ] && [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    print_success "SSL certificates found"
else
    print_warning "SSL certificates not found in ./ssl/ directory"
    echo "  You'll need to provide SSL certificates before deploying"
fi

# ===========================
# 9. Database Migrations
# ===========================
print_header "9. Database Migrations"

if [ -d "supabase/migrations" ]; then
    MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    print_success "Found $MIGRATION_COUNT database migration(s)"
else
    print_warning "No database migrations directory found"
fi

# ===========================
# 10. Git Status
# ===========================
print_header "10. Git Status"

if [ -d ".git" ]; then
    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        print_success "No uncommitted changes"
    else
        print_warning "You have uncommitted changes"
        git status --short
    fi
    
    # Get current branch
    BRANCH=$(git branch --show-current)
    print_info "Current branch: $BRANCH"
    
    # Check if we're on main/master
    if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
        print_success "On production branch: $BRANCH"
    else
        print_warning "Not on main/master branch (current: $BRANCH)"
    fi
fi

# ===========================
# Summary
# ===========================
print_header "VALIDATION SUMMARY"

echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Pre-deployment checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review any warnings above"
    echo "  2. Deploy with: docker-compose -f docker-compose.production.yml up -d"
    echo "  3. Monitor logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "  4. Verify deployment: curl https://your-domain.com/api/health"
    exit 0
else
    echo -e "${RED}✗ Pre-deployment checks failed!${NC}"
    echo ""
    echo "Please fix the errors above before deploying."
    exit 1
fi
