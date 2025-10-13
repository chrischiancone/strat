-- Storage policies for carrollton-backups (fix attempt without altering table)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow authenticated uploads to carrollton-backups') THEN
    DROP POLICY "allow authenticated uploads to carrollton-backups" ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow authenticated read carrollton-backups') THEN
    DROP POLICY "allow authenticated read carrollton-backups" ON storage.objects;
  END IF;
END $$;

CREATE POLICY "allow authenticated uploads to carrollton-backups"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'carrollton-backups'
);

CREATE POLICY "allow authenticated read carrollton-backups"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'carrollton-backups'
);
