-- Enable storage policies for backups bucket
-- This migration ensures the bucket exists (id = 'carrollton-backups') and
-- allows authenticated users to upload and read objects in that bucket.

-- 1) Ensure the bucket exists (tolerant across schema versions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'carrollton-backups'
  ) THEN
    BEGIN
      -- Newer schema variant (with name, file_size_limit, allowed_mime_types)
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'carrollton-backups',
        'carrollton-backups',
        FALSE,
        52428800, -- 50MB
        ARRAY['application/json','application/zip','application/x-tar','application/gzip']
      );
    EXCEPTION WHEN undefined_column THEN
      -- Older schema variant (without name/allowed_mime_types)
      BEGIN
        INSERT INTO storage.buckets (id, public)
        VALUES ('carrollton-backups', FALSE)
        ON CONFLICT (id) DO NOTHING;
      END;
    END;
  END IF;
END $$;

-- 2) Policies for carrollton-backups
DO $$
BEGIN
  -- Clean up any existing policies with the same names
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow authenticated uploads to carrollton-backups') THEN
    DROP POLICY "allow authenticated uploads to carrollton-backups" ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow authenticated read carrollton-backups') THEN
    DROP POLICY "allow authenticated read carrollton-backups" ON storage.objects;
  END IF;
END $$;

-- Allow authenticated users to upload only to this bucket
CREATE POLICY "allow authenticated uploads to carrollton-backups"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'carrollton-backups'
);

-- Allow authenticated users to read from this bucket
CREATE POLICY "allow authenticated read carrollton-backups"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'carrollton-backups'
);
