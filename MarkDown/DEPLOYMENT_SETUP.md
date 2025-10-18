# Deployment Setup Guide

## 🚨 CRITICAL: Missing Environment Variables

The deployment is currently failing with 500 errors because essential environment variables are missing. The application cannot connect to Supabase without these.

## Required Environment Variables

You need to set these in Netlify immediately:

### 1. Supabase Configuration
```bash
# Your Supabase project URL (find in Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Your service role key (find in Supabase Dashboard > Settings > API)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Application Configuration
```bash
# The production URL of your app
NEXT_PUBLIC_APP_URL=https://stratplan.netlify.app
```

## How to Set Environment Variables in Netlify

### Option 1: Using Netlify CLI (Recommended)
```bash
# Set Supabase URL
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_supabase_url_here"

# Set Service Role Key  
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your_service_role_key_here"

# Set App URL
netlify env:set NEXT_PUBLIC_APP_URL "https://stratplan.netlify.app"
```

### Option 2: Using Netlify Web Interface
1. Go to: https://app.netlify.com/projects/stratplan/settings/env
2. Click "Add a variable"
3. Add each variable listed above

## Getting Your Supabase Credentials

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings > API**
4. **Copy the URL** from "Project URL" 
5. **Copy the service_role key** from "Project API keys" (NOT the anon key)

⚠️ **SECURITY WARNING**: The service role key should be kept secret and only used on the server side.

## After Setting Environment Variables

1. **Redeploy the site**:
   ```bash
   netlify deploy --prod
   ```

2. **Or trigger a new build** in the Netlify dashboard

## Database Setup

Make sure your Supabase database has:
- [ ] All required tables created
- [ ] 2FA migration run (adds two_factor_* columns)
- [ ] At least one admin user in the users table
- [ ] Municipality record in municipalities table

## Testing After Setup

Run the automated test again:
```bash
node test-deployment.js
```

Expected result: All tests should return 200 status codes instead of 500.

## Common Issues

### Issue: Still getting 500 errors after setting env vars
**Solution**: Make sure to redeploy after setting environment variables

### Issue: "Invalid JWT" errors
**Solution**: Double-check the service role key is correct

### Issue: "Database not found" errors  
**Solution**: Verify the Supabase URL is correct and project exists

### Issue: Auth redirects not working
**Solution**: Ensure NEXT_PUBLIC_APP_URL matches your actual domain

## Quick Fix Script

```bash
# Replace these with your actual values
export SUPABASE_URL="your_supabase_url"
export SERVICE_KEY="your_service_role_key"

# Set all required environment variables
netlify env:set NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "$SERVICE_KEY"  
netlify env:set NEXT_PUBLIC_APP_URL "https://stratplan.netlify.app"

# Redeploy
netlify deploy --prod
```

## Status Check

- [ ] Environment variables set in Netlify
- [ ] Supabase database accessible
- [ ] Site redeployed with new variables
- [ ] Automated tests passing (200 status codes)
- [ ] Ready for manual UAT testing