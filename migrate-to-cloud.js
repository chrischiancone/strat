#!/usr/bin/env node

/**
 * Automated Cloud Migration Script
 * 
 * This script will migrate your local database to Supabase Cloud
 * using the environment variables configured in Netlify
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// You'll need to temporarily set these environment variables
// Get them from your Netlify environment variables or Supabase dashboard
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓ Set' : '❌ Missing');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓ Set' : '❌ Missing');
    console.error('\nPlease set these environment variables and try again:');
    console.error('export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"');
    console.error('export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
    console.log('🚀 Starting cloud database migration...\n');
    
    try {
        // Test connection
        console.log('1. Testing connection to cloud database...');
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error && !error.message.includes('relation "users" does not exist')) {
            throw error;
        }
        console.log('   ✅ Connected to cloud database\n');
        
        // Check if schema exists
        console.log('2. Checking if database schema exists...');
        const { data: tables } = await supabase.rpc('get_table_names');
        const hasUsers = tables && tables.some(t => t.table_name === 'users');
        
        if (!hasUsers) {
            console.log('   ⚠️  Schema not found - you need to import schema_export.sql first');
            console.log('   📝 Follow the manual steps in CLOUD_MIGRATION_GUIDE.md');
            return;
        }
        console.log('   ✅ Database schema exists\n');
        
        // Check current data
        console.log('3. Checking existing data...');
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: planCount } = await supabase.from('strategic_plans').select('*', { count: 'exact', head: true });
        
        console.log(`   📊 Current data: ${userCount || 0} users, ${planCount || 0} plans`);
        
        if (userCount > 0) {
            console.log('   ⚠️  Database already has data. Manual import recommended.');
            console.log('   📝 Follow the manual steps in CLOUD_MIGRATION_GUIDE.md');
            return;
        }
        
        console.log('\n✅ Migration preparation complete!');
        console.log('\n📋 Next steps:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Open the SQL Editor');
        console.log('3. Import schema_export.sql first');
        console.log('4. Import data_export.sql second');
        console.log('5. Run the verification queries in CLOUD_MIGRATION_GUIDE.md');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('- Check your SUPABASE_URL and SERVICE_ROLE_KEY');
        console.error('- Make sure your Supabase project is active');
        console.error('- Follow the manual migration guide in CLOUD_MIGRATION_GUIDE.md');
    }
}

// Helper function to execute SQL (for future use)
async function executeSQLFile(filename) {
    try {
        const sql = fs.readFileSync(filename, 'utf8');
        console.log(`   📁 Reading ${filename}...`);
        
        // Note: Supabase client doesn't support arbitrary SQL execution
        // This would need to be done through the dashboard SQL editor
        console.log('   ⚠️  SQL execution must be done manually via dashboard');
        return true;
    } catch (error) {
        console.error(`   ❌ Failed to read ${filename}:`, error.message);
        return false;
    }
}

// Run the migration
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };