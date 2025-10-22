/**
 * Cache Management API Endpoint
 * 
 * Provides cache management operations for administrators
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { RedisCache } from '@/lib/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/cache
 * 
 * Returns cache statistics
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get cache stats
    const stats = await RedisCache.getStats()
    const isConnected = await RedisCache.ping()
    
    return NextResponse.json({
      connected: isConnected,
      stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cache
 * 
 * Clears all cache
 */
export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Clear cache
    const success = await RedisCache.flushAll()
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to clear cache - Redis not connected' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
