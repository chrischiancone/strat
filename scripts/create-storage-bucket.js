#!/usr/bin/env node

/**
 * Script to create a storage bucket using service role key
 * This bypasses RLS policies that prevent bucket creation from client
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
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createStorageBucket() {
  try {
    const bucketName = 'carrollton-backups'
    
    console.log('Checking if bucket exists...')
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }
    
    const existingBucket = buckets?.find(b => b.name === bucketName)
    
    if (existingBucket) {
      console.log('✅ Bucket already exists:', bucketName)
      return
    }
    
    console.log('Creating bucket:', bucketName)
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['application/json', 'application/zip', 'application/x-tar', 'application/gzip']
    })
    
    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`)
    }
    
    console.log('✅ Storage bucket created successfully!')
    console.log(`Bucket name: ${bucketName}`)
    console.log(`File size limit: 50MB`)
    console.log(`Public: false`)
    
  } catch (error) {
    console.error('❌ Error creating storage bucket:', error.message)
    process.exit(1)
  }
}

createStorageBucket()
