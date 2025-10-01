// Supabase configuration for Kennedy Ogetto CMS
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export class DatabaseService {

  // Profile operations
  static async getProfile() {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .single()

    if (error) throw error
    return data
  }

  static async updateProfile(profileData) {
    const { data, error } = await supabase
      .from('profile')
      .update(profileData)
      .eq('id', profileData.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Blog post operations
  static async getBlogPosts(limit = null, offset = 0, includeArchived = false) {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('publication_date', { ascending: false })

    // Only filter by is_archived if the column exists
    // This provides backward compatibility
    try {
      if (!includeArchived) {
        query = query.eq('is_archived', false)
      }
    } catch (error) {
      // Column doesn't exist yet, ignore the filter
      console.log('is_archived column not found, showing all posts')
    }

    if (limit) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    // If error is about missing column, try without the archive filter
    if (error && error.code === '42703') {
      console.log('Retrying without archive filter...')
      let fallbackQuery = supabase
        .from('blog_posts')
        .select('*')
        .order('publication_date', { ascending: false })

      if (limit) {
        fallbackQuery = fallbackQuery.range(offset, offset + limit - 1)
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery
      if (fallbackError) throw fallbackError
      return fallbackData || []
    }

    if (error) throw error
    return data || []
  }

  static async getBlogPost(postId) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('post_id', postId)
      .single()

    if (error) throw error
    return data
  }

  static async createBlogPost(postData) {
    // Generate slug from title
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const blogPost = {
      ...postData,
      post_id: slug,
      slug: slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Only add is_archived if we know the column exists
    try {
      blogPost.is_archived = false
    } catch (error) {
      // Column might not exist, that's okay
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogPost])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateBlogPost(postId, postData) {
    const updatedPost = {
      ...postData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updatedPost)
      .eq('post_id', postId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async archiveBlogPost(postId) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          is_archived: true,
          updated_at: new Date().toISOString()
        })
        .eq('post_id', postId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      if (error.code === '42703') {
        throw new Error('Archive feature not available. Please add the is_archived column to the database.')
      }
      throw error
    }
  }

  static async unarchiveBlogPost(postId) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          is_archived: false,
          updated_at: new Date().toISOString()
        })
        .eq('post_id', postId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      if (error.code === '42703') {
        throw new Error('Archive feature not available. Please add the is_archived column to the database.')
      }
      throw error
    }
  }

  static async deleteBlogPost(postId) {
    const { data, error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('post_id', postId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Timeline operations
  static async getTimelineEntries(limit = null, offset = 0) {
    try {
      // Use simple query for now (timeline_sources table doesn't exist yet)
      let query = supabase
        .from('timeline_entries')
        .select('*')
        .order('entry_date', { ascending: false })

      if (limit) {
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error } = await query
      if (error) throw error

      // Return data without sources for now
      return (data || []).map(entry => ({
        ...entry,
        sources: [] // Empty sources array until timeline_sources table is created
      }))
    } catch (error) {
      console.error('Error in getTimelineEntries:', error)
      return []
    }
  }

  static async getTimelineEntry(entryId) {
    try {
      const { data, error } = await supabase
        .from('timeline_entries')
        .select('*')
        .eq('id', entryId)
        .single()

      if (error) throw error

      return {
        ...data,
        sources: [] // Empty sources until timeline_sources table is created
      }
    } catch (error) {
      console.error('Error in getTimelineEntry:', error)
      throw error
    }
  }

  static async createTimelineEntry(entryData) {
    try {
      // Only include fields that exist in the timeline_entries table
      const validFields = {
        entry_date: entryData.entry_date,
        event_type: entryData.event_type,
        title: entryData.title,
        description: entryData.description,
        significance: entryData.significance,
        legal_context: entryData.legal_context,
        related_cases: entryData.related_cases,
        confidence_level: entryData.confidence_level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Remove undefined fields
      const timelineEntry = Object.fromEntries(
        Object.entries(validFields).filter(([_, value]) => value !== undefined)
      )

      // Create the main timeline entry (only valid fields)
      const { data, error } = await supabase
        .from('timeline_entries')
        .insert([timelineEntry])
        .select()
        .single()

      if (error) throw error

      // TODO: Handle sources creation when timeline_sources table is created
      // For now, we'll just create the main entry
      // if (entryData.sources && Array.isArray(entryData.sources)) {
      //   await this.createTimelineSources(data.id, entryData.sources)
      // }

      return data
    } catch (error) {
      console.error('Error in createTimelineEntry:', error)
      throw error
    }
  }

  static async updateTimelineEntry(entryId, entryData) {
    try {
      // Only include fields that exist in the timeline_entries table
      const validFields = {
        entry_date: entryData.entry_date,
        event_type: entryData.event_type,
        title: entryData.title,
        description: entryData.description,
        significance: entryData.significance,
        legal_context: entryData.legal_context,
        related_cases: entryData.related_cases,
        confidence_level: entryData.confidence_level,
        updated_at: new Date().toISOString()
      }

      // Remove undefined fields
      const updatedEntry = Object.fromEntries(
        Object.entries(validFields).filter(([_, value]) => value !== undefined)
      )

      // Update the main timeline entry (only valid fields)
      const { data, error } = await supabase
        .from('timeline_entries')
        .update(updatedEntry)
        .eq('id', entryId)
        .select()
        .single()

      if (error) throw error

      // TODO: Handle sources update when timeline_sources table is created
      // For now, we'll just update the main entry
      // if (entryData.sources && Array.isArray(entryData.sources)) {
      //   await this.updateTimelineSources(entryId, entryData.sources)
      // }

      return data
    } catch (error) {
      console.error('Error in updateTimelineEntry:', error)
      throw error
    }
  }

  static async deleteTimelineEntry(entryId) {
    try {
      const { data, error } = await supabase
        .from('timeline_entries')
        .delete()
        .eq('id', entryId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error in deleteTimelineEntry:', error)
      throw error
    }
  }

  static async getTimelineEntry(entryId) {
    try {
      // Try to get entry with sources first
      const { data, error } = await supabase
        .from('timeline_entries')
        .select(`
          *,
          timeline_sources (
            url,
            title,
            publication,
            source_date,
            source_type
          )
        `)
        .eq('id', entryId)
        .single()

      if (error) {
        // If timeline_sources relationship doesn't exist, get entry without sources
        if (error.code === 'PGRST200') {
          const { data: entryData, error: entryError } = await supabase
            .from('timeline_entries')
            .select('*')
            .eq('id', entryId)
            .single()

          if (entryError) throw entryError
          
          return {
            ...entryData,
            sources: []
          }
        }
        throw error
      }

      return {
        ...data,
        sources: data.timeline_sources || []
      }
    } catch (error) {
      console.error('Error in getTimelineEntry:', error)
      throw error
    }
  }

  // Authentication
  static async signIn(username, password) {
    // Custom authentication since we're using username/password
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !user) {
      throw new Error('Invalid credentials')
    }

    // Simple password check for demo (in production, use proper password hashing)
    if (password === 'admin@12345') {
      // Create a session token
      const sessionData = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ogetto_session', JSON.stringify(sessionData))
      }

      return sessionData
    } else {
      throw new Error('Invalid credentials')
    }
  }

  static async signOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ogetto_session')
    }
    return true
  }

  static async getCurrentUser() {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('ogetto_session')
      if (session) {
        const sessionData = JSON.parse(session)
        if (new Date(sessionData.expires) > new Date()) {
          return sessionData.user
        } else {
          localStorage.removeItem('ogetto_session')
        }
      }
    }
    return null
  }

  // Scraping log operations
  static async getScrapingLog(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('scraping_log')
        .select('*')
        .order('scraping_date', { ascending: false })
        .limit(limit)

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST205') {
          console.log('scraping_log table not found, returning empty array')
          return []
        }
        throw error
      }
      return data || []
    } catch (error) {
      console.log('Error accessing scraping_log table:', error.message)
      return []
    }
  }
}

export default DatabaseService