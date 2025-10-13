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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_backups_updated_at
    BEFORE UPDATE ON public.backups
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_updated_at();

-- Add backup settings to municipalities.settings
COMMENT ON TABLE public.backups IS 'Stores backup records and metadata';
COMMENT ON COLUMN public.backups.includes IS 'JSON array of backup content types (database, files, settings, user_data, logs)';
COMMENT ON COLUMN public.backups.file_path IS 'Path to backup file in Supabase Storage';
COMMENT ON COLUMN public.backups.checksum IS 'SHA-256 checksum for integrity verification';