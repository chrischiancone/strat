#!/bin/bash

# Database Health Check Script
# Verifies database status, constraints, and common issues

echo "========================================="
echo "Stratic Plan - Database Health Check"
echo "========================================="
echo ""

# Check if Supabase is running
echo "1. Checking if Supabase is running..."
if ! npx supabase status > /dev/null 2>&1; then
    echo "❌ Supabase is not running. Start it with: npx supabase start"
    exit 1
fi
echo "✅ Supabase is running"
echo ""

# Check strategic_plans constraints
echo "2. Checking strategic_plans table constraints..."
CONSTRAINT_CHECK=$(docker exec supabase_db_Stratic_Plan psql -U postgres -d postgres -t -c "
  SELECT constraint_name 
  FROM information_schema.table_constraints 
  WHERE table_name = 'strategic_plans' 
  AND constraint_type = 'CHECK' 
  AND constraint_name = 'strategic_plans_years_valid';
" 2>/dev/null | tr -d '[:space:]')

if [ -n "$CONSTRAINT_CHECK" ]; then
    echo "⚠️  ISSUE FOUND: Constraint 'strategic_plans_years_valid' still exists!"
    echo "   This prevents creating single-year strategic plans."
    echo "   Fix: Run 'npm run db:reset' to apply all migrations"
else
    echo "✅ Constraint 'strategic_plans_years_valid' has been removed (single-year plans allowed)"
fi
echo ""

# Check if users exist in auth.users
echo "3. Checking auth users..."
USER_COUNT=$(docker exec supabase_db_Stratic_Plan psql -U postgres -d postgres -t -c "
  SELECT COUNT(*) FROM auth.users;
" 2>/dev/null | tr -d '[:space:]')

if [ "$USER_COUNT" = "0" ]; then
    echo "⚠️  No users found in auth.users table"
    echo "   You may need to create test users or reset passwords"
    echo "   Run: npx tsx scripts/reset-specific-user-password.ts <email> <password>"
else
    echo "✅ Found $USER_COUNT user(s) in auth.users"
fi
echo ""

# Check comments table schema
echo "4. Checking comments table schema..."
COMMENTS_COLS=$(docker exec supabase_db_Stratic_Plan psql -U postgres -d postgres -t -c "
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'comments' 
  AND column_name IN ('entity_id', 'entity_type', 'parent_comment_id')
  ORDER BY column_name;
" 2>/dev/null | tr '\n' ',' | sed 's/,$//')

if echo "$COMMENTS_COLS" | grep -q "entity_id" && echo "$COMMENTS_COLS" | grep -q "entity_type" && echo "$COMMENTS_COLS" | grep -q "parent_comment_id"; then
    echo "✅ Comments table has correct schema (entity_id, entity_type, parent_comment_id)"
else
    echo "⚠️  Comments table schema may be incorrect"
    echo "   Expected: entity_id, entity_type, parent_comment_id"
    echo "   Found: $COMMENTS_COLS"
fi
echo ""

# Check RLS policies on critical tables
echo "5. Checking RLS policies..."
RLS_STATUS=$(docker exec supabase_db_Stratic_Plan psql -U postgres -d postgres -t -c "
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('strategic_plans', 'comments', 'users', 'departments')
  ORDER BY tablename;
" 2>/dev/null)

echo "$RLS_STATUS" | while read -r line; do
    table=$(echo "$line" | awk '{print $1}' | tr -d '[:space:]')
    rls=$(echo "$line" | awk '{print $3}' | tr -d '[:space:]')
    
    if [ -n "$table" ]; then
        if [ "$rls" = "t" ]; then
            echo "✅ $table: RLS enabled"
        else
            echo "⚠️  $table: RLS disabled"
        fi
    fi
done
echo ""

# Summary
echo "========================================="
echo "Health Check Complete"
echo "========================================="
echo ""
echo "If issues were found, consider:"
echo "  • Run 'npm run db:reset' to reapply all migrations"
echo "  • Run 'npx tsx scripts/reset-specific-user-password.ts <email> <password>' to reset user passwords"
echo "  • Check BUG_REPORT.md for detailed issue information"
echo ""
