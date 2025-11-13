import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
 * Creates a Supabase client for use in Server Components and Server Actions.
 * 
 * This client:
 * - Uses HTTP-only cookies for session management
 * - Automatically handles session refresh
 * - Respects Row-Level Security (RLS) policies
 * - Works with Next.js App Router
 * 
 * @returns Configured Supabase client instance
 * @throws Error if required environment variables are missing
 * 
 * @example
 * ```ts
 * // In a Server Component
 * export default async function Page() {
 *   const supabase = createServerSupabaseClient()
 *   const { data } = await supabase.from('plans').select('*')
 *   return <PlansList plans={data} />
 * }
 * ```
 * 
 * @example
 * ```ts
 * // In a Server Action
 * 'use server'
 * export async function createPlan(formData: FormData) {
 *   const supabase = createServerSupabaseClient()
 *   const { data, error } = await supabase.from('plans').insert({...})
 *   return { success: !error, data }
 * }
 * ```
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Check your .env.local file.')
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Log cookie errors for debugging
            // This can happen in Server Components or when headers are already sent
            console.warn('Failed to set cookie in server component:', name, error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Log cookie errors for debugging
            console.warn('Failed to remove cookie in server component:', name, error)
          }
        },
      },
    }
  )
}
