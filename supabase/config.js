// Supabase configuration for Kennedy Ogetto CMS

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

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
  static async getBlogPosts(limit = null, offset = 0) {
    let query = supabase.rpc('get_blog_posts_with_sources')
    
    if (limit) {
      query = query.range(offset, offset + limit - 1)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }
  
  static async getBlogPost(postId) {
    const { data, error } = await supabase.rpc('get_blog_posts_with_sources')
    if (error) throw error
    
    return data.find(post => post.post_id === postId) || null
  }
  
  static async createBlogPost(postData) {
    const { sources, related_posts, ...blogPost } = postData
    
    // Insert blog post
    const { data: blogData, error: blogError } = await supabase
      .from('blog_posts')
      .insert(blogPost)
      .select()
      .single()
    
    if (blogError) throw blogError
    
    // Insert sources
    if (sources && sources.length > 0) {
      const sourcesData = sources.map(source => ({
        blog_post_id: blogData.id,
        ...source
      }))
      
      const { error: sourcesError } = await supabase
        .from('blog_sources')
        .insert(sourcesData)
      
      if (sourcesError) throw sourcesError
    }
    
    // Insert related posts
    if (related_posts && related_posts.length > 0) {
      const relatedData = related_posts.map(relatedId => ({
        blog_post_id: blogData.id,
        related_post_id: relatedId
      }))
      
      const { error: relatedError } = await supabase
        .from('related_posts')
        .insert(relatedData)
      
      if (relatedError) throw relatedError
    }
    
    return blogData
  }
  
  static async updateBlogPost(postId, postData) {
    const { sources, related_posts, ...blogPost } = postData
    
    // Get the blog post ID
    const existingPost = await this.getBlogPost(postId)
    if (!existingPost) throw new Error('Blog post not found')
    
    // Update blog post
    const { data: blogData, error: blogError } = await supabase
      .from('blog_posts')
      .update(blogPost)
      .eq('id', existingPost.id)
      .select()
      .single()
    
    if (blogError) throw blogError
    
    // Delete existing sources and related posts
    await supabase.from('blog_sources').delete().eq('blog_post_id', existingPost.id)
    await supabase.from('related_posts').delete().eq('blog_post_id', existingPost.id)
    
    // Insert new sources
    if (sources && sources.length > 0) {
      const sourcesData = sources.map(source => ({
        blog_post_id: existingPost.id,
        ...source
      }))
      
      await supabase.from('blog_sources').insert(sourcesData)
    }
    
    // Insert new related posts
    if (related_posts && related_posts.length > 0) {
      const relatedData = related_posts.map(relatedId => ({
        blog_post_id: existingPost.id,
        related_post_id: relatedId
      }))
      
      await supabase.from('related_posts').insert(relatedData)
    }
    
    return blogData
  }
  
  static async deleteBlogPost(postId) {
    const existingPost = await this.getBlogPost(postId)
    if (!existingPost) throw new Error('Blog post not found')
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', existingPost.id)
    
    if (error) throw error
    return true
  }
  
  // Timeline operations
  static async getTimelineEntries(limit = null, offset = 0) {
    let query = supabase.rpc('get_timeline_with_sources')
    
    if (limit) {
      query = query.range(offset, offset + limit - 1)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }
  
  static async getTimelineEntry(entryId) {
    const { data, error } = await supabase
      .from('timeline_entries')
      .select(`
        *,
        timeline_sources (*)
      `)
      .eq('id', entryId)
      .single()
    
    if (error) throw error
    return data
  }
  
  static async createTimelineEntry(entryData) {
    const { sources, ...timelineEntry } = entryData
    
    // Insert timeline entry
    const { data: entryResult, error: entryError } = await supabase
      .from('timeline_entries')
      .insert(timelineEntry)
      .select()
      .single()
    
    if (entryError) throw entryError
    
    // Insert sources
    if (sources && sources.length > 0) {
      const sourcesData = sources.map(source => ({
        timeline_entry_id: entryResult.id,
        ...source
      }))
      
      const { error: sourcesError } = await supabase
        .from('timeline_sources')
        .insert(sourcesData)
      
      if (sourcesError) throw sourcesError
    }
    
    return entryResult
  }
  
  static async updateTimelineEntry(entryId, entryData) {
    const { sources, ...timelineEntry } = entryData
    
    // Update timeline entry
    const { data: entryResult, error: entryError } = await supabase
      .from('timeline_entries')
      .update(timelineEntry)
      .eq('id', entryId)
      .select()
      .single()
    
    if (entryError) throw entryError
    
    // Delete existing sources
    await supabase.from('timeline_sources').delete().eq('timeline_entry_id', entryId)
    
    // Insert new sources
    if (sources && sources.length > 0) {
      const sourcesData = sources.map(source => ({
        timeline_entry_id: entryId,
        ...source
      }))
      
      await supabase.from('timeline_sources').insert(sourcesData)
    }
    
    return entryResult
  }
  
  static async deleteTimelineEntry(entryId) {
    const { error } = await supabase
      .from('timeline_entries')
      .delete()
      .eq('id', entryId)
    
    if (error) throw error
    return true
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
    
    // In a real app, you'd verify the password hash here
    // For now, we'll do a simple check
    if (password === 'admin@12345') {
      // Create a session token (in production, use proper JWT)
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
  static async logScrapedData(scrapingData) {
    const { data, error } = await supabase
      .from('scraping_log')
      .insert(scrapingData)
      .select()
    
    if (error) throw error
    return data
  }
  
  static async getScrapingLog(limit = 50) {
    const { data, error } = await supabase
      .from('scraping_log')
      .select('*')
      .order('scraping_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }
}

export default DatabaseService