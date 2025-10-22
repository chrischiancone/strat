#!/usr/bin/env node

/**
 * Script to create a public 'branding' storage bucket for logos and favicons
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createBrandingBucket() {
  try {
    const bucketName = 'branding'

    console.log('Checking if bucket exists...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) throw new Error(`Failed to list buckets: ${listError.message}`)

    const existing = buckets?.find((b) => b.name === bucketName)
    if (existing) {
      console.log('✅ Bucket already exists:', bucketName)
      if (!existing.public) {
        console.log('Updating bucket to be public...')
        await supabase.storage.updateBucket(bucketName, { public: true })
      }
      return
    }

    console.log('Creating bucket:', bucketName)
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: [
        'image/png',
        'image/jpeg',
        'image/svg+xml',
        'image/x-icon',
        'image/vnd.microsoft.icon',
        'image/webp',
      ],
    })

    if (error) throw new Error(`Failed to create bucket: ${error.message}`)

    console.log('✅ Branding bucket created successfully!')
  } catch (err) {
    console.error('❌ Error creating branding bucket:', err.message)
    process.exit(1)
  }
}

createBrandingBucket()
