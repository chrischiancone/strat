const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createBackupsTable() {
  try {
    console.log('Creating backups table...')
    
    const sql = `
-- Create backups table
CREATE TABLE IF NOT EXISTS public.backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('full', 'incremental', 'differential')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed')),
    size BIGINT DEFAULT 0,
    duration INTEGER DEFAULT 0, -- in seconds
    file_count INTEGER DEFAULT 0,
    file_path TEXT,
    checksum TEXT,
    includes JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_backups_municipality_id ON public.backups(municipality_id);
CREATE INDEX IF NOT EXISTS idx_backups_status ON public.backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON public.backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_type ON public.backups(type);

-- Enable RLS
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view backups from their municipality" ON public.backups;
  DROP POLICY IF EXISTS "Admins can insert backups" ON public.backups;
  DROP POLICY IF EXISTS "Admins can update backups" ON public.backups;
  DROP POLICY IF EXISTS "Admins can delete backups" ON public.backups;
  
  -- Create new policies
  CREATE POLICY "Users can view backups from their municipality" ON public.backups
      FOR SELECT USING (
          municipality_id IN (
              SELECT municipality_id FROM users WHERE id = auth.uid()
          )
      );

  CREATE POLICY "Admins can insert backups" ON public.backups
      FOR INSERT WITH CHECK (
          municipality_id IN (
              SELECT municipality_id FROM users 
              WHERE id = auth.uid() 
              AND role IN ('admin', 'manager')
          )
      );

  CREATE POLICY "Admins can update backups" ON public.backups
      FOR UPDATE USING (
          municipality_id IN (
              SELECT municipality_id FROM users 
              WHERE id = auth.uid() 
              AND role IN ('admin', 'manager')
          )
      );

  CREATE POLICY "Admins can delete backups" ON public.backups
      FOR DELETE USING (
          municipality_id IN (
              SELECT municipality_id FROM users 
              WHERE id = auth.uid() 
              AND role IN ('admin', 'manager')
          )
      );
END $$;

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS set_backups_updated_at ON public.backups;
CREATE TRIGGER set_backups_updated_at
    BEFORE UPDATE ON public.backups
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_updated_at();

-- Add comments
COMMENT ON TABLE public.backups IS 'Stores backup records and metadata';
COMMENT ON COLUMN public.backups.includes IS 'JSON array of backup content types (database, files, settings, user_data, logs)';
COMMENT ON COLUMN public.backups.file_path IS 'Path to backup file in Supabase Storage';
COMMENT ON COLUMN public.backups.checksum IS 'SHA-256 checksum for integrity verification';
    `
    
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      // Try direct SQL execution if RPC doesn't work
      console.log('RPC failed, trying direct execution...')
      
      // Split SQL into individual statements and execute them
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)
      
      for (const statement of statements) {
        const cleanStatement = statement.trim()
        if (cleanStatement.length === 0) continue
        
        try {
          const { error: stmtError } = await supabase
            .from('_temp') // This will fail but allow us to execute raw SQL
            .select('1')
            .limit(0)
          
          // Since we can't execute raw SQL directly, let's try a different approach
          console.log('Attempting to create table using Supabase SQL...')
          
          // We'll need to create the table using the Supabase dashboard or CLI
          throw new Error('Please run this SQL manually in your Supabase dashboard:\n\n' + sql)
          
        } catch (err) {
          if (cleanStatement.includes('CREATE TABLE')) {
            console.error('Failed to create backups table. Please run the following SQL in your Supabase dashboard:')
            console.log('\n' + sql + '\n')
            return
          }
        }
      }
    }
    
    console.log('✅ Backups table created successfully!')
    
    // Verify the table was created
    const { data, error: verifyError } = await supabase
      .from('backups')
      .select('id')
      .limit(1)
    
    if (verifyError) {
      console.error('❌ Table verification failed:', verifyError.message)
      console.log('\nPlease run the following SQL manually in your Supabase dashboard:')
      console.log('\n' + sql + '\n')
    } else {
      console.log('✅ Table verification successful!')
    }
    
  } catch (error) {
    console.error('❌ Error creating backups table:', error.message)
    console.log('\nPlease run the migration manually in your Supabase dashboard.')
    console.log('You can find the SQL in: supabase/migrations/20240113000000_create_backups_table.sql')
  }
}

createBackupsTable()