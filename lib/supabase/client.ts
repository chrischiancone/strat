import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Validates and normalizes the Supabase URL from environment variables.
 * Automatically adds 'https://' protocol if missing.
 * 
 * @returns Normalized Supabase URL
 * @throws Error if NEXT_PUBLIC_SUPABASE_URL is not set
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Check your .env.local file.')
  }
  
  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  
  return url
}

/**
 * Creates a Supabase client for use in Client Components.
 * 
 * This client:
 * - Uses browser storage for session management
 * - Automatically handles session refresh
 * - Respects Row-Level Security (RLS) policies
 * - Works with React hooks and client-side code
 * 
 * @returns Configured Supabase client instance
 * @throws Error if required environment variables are missing
 * 
 * @example
 * ```ts
 * 'use client'
 * import { createBrowserSupabaseClient } from '@/lib/supabase/client'
 * 
 * export function MyComponent() {
 *   const supabase = createBrowserSupabaseClient()
 *   const [data, setData] = useState()
 *   
 *   useEffect(() => {
 *     supabase.from('plans').select('*').then(({ data }) => setData(data))
 *   }, [])
 *   
 *   return <div>{data && <div>Render your data here</div>}</div>
 * }
 * ```
 */
export function createBrowserSupabaseClient() {
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Check your .env.local file.')
  }
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}

// Alias for backward compatibility
export const createClient = createBrowserSupabaseClient
