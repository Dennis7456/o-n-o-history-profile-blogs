import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Tutorial from '../../components/Tutorial'
import TimelineDetailModal from '../../components/TimelineDetailModal'
import { useAuth } from '../../contexts/AuthContext'
import DatabaseService from '../../lib/supabase'
import {
  FileText,
  Clock,
  User,
  Database,
  TrendingUp,
  Eye,
  Edit
} from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalTimeline: 0,
    archivedPosts: 0,
    totalSources: 0,
    lastUpdate: null
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [selectedTimelineEntry, setSelectedTimelineEntry] = useState(null)
  const [showTimelineDetail, setShowTimelineDetail] = useState(false)

  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    loadDashboardData()

    // Check if tutorial should be shown
    const tutorialCompleted = localStorage.getItem('ogetto_tutorial_completed')
    const tutorialSkipped = localStorage.getItem('ogetto_tutorial_skipped')

    if (!tutorialCompleted && !tutorialSkipped) {
      // Show tutorial after a short delay
      setTimeout(() => setShowTutorial(true), 1000)
    }
  }, [isAuthenticated, isAdmin, router])

  const loadDashboardData = async () => {
    try {
      // Load all data with proper error handling
      let posts = []
      let timeline = []
      let scrapingLog = []

      try {
        posts = await DatabaseService.getBlogPosts(null, 0, true) // Include archived
      } catch (error) {
        console.error('Error loading posts:', error)
      }

      try {
        timeline = await DatabaseService.getTimelineEntries()
      } catch (error) {
        console.error('Error loading timeline:', error)
      }

      try {
        scrapingLog = await DatabaseService.getScrapingLog(10)
      } catch (error) {
        console.error('Error loading scraping log:', error)
      }

      // Calculate accurate statistics
      const archivedPosts = posts.filter(post => post.is_archived).length
      const activePosts = posts.length - archivedPosts
      const totalSources = timeline.reduce((count, entry) => count + (entry.sources?.length || 0), 0)

      // Get the most recent update from either posts or timeline
      const allDates = [
        ...posts.map(p => p.updated_at || p.created_at),
        ...timeline.map(t => t.updated_at || t.created_at)
      ].filter(Boolean)

      const lastUpdate = allDates.length > 0
        ? allDates.sort((a, b) => new Date(b) - new Date(a))[0]
        : null

      setStats({
        totalPosts: activePosts,
        totalTimeline: timeline.length,
        archivedPosts: archivedPosts,
        totalSources: totalSources,
        lastUpdate: lastUpdate
      })

      // Create enhanced activity feed with more details
      const recentPosts = posts.slice(0, 5).map(post => ({
        type: 'blog',
        title: post.title,
        date: post.updated_at || post.created_at,
        id: post.post_id,
        category: post.category,
        isArchived: post.is_archived,
        excerpt: post.excerpt
      }))

      const recentTimelineEntries = timeline.slice(0, 5).map(entry => ({
        type: 'timeline',
        title: entry.title,
        date: entry.updated_at || entry.created_at,
        id: entry.id,
        eventType: entry.event_type,
        entryDate: entry.entry_date,
        description: entry.description,
        fullEntry: entry // Store full entry for detail view
      }))

      const combined = [...recentPosts, ...recentTimelineEntries]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)

      setRecentActivity(combined)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage Kennedy Ogetto's content and monitor system activity</p>
          </div>
          <button
            onClick={() => setShowTutorial(true)}
            className="btn-outline"
          >
            Show Tutorial
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Blog Posts</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Timeline Entries</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalTimeline}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Archived Posts</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.archivedPosts}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Sources</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalSources}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/admin/blog/create')}
                  className="btn-primary flex items-center justify-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  New Blog Post
                </button>

                <button
                  onClick={() => router.push('/admin/timeline/new')}
                  className="btn-secondary flex items-center justify-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  New Timeline Entry
                </button>

                <button
                  onClick={() => router.push('/admin/profile')}
                  className="btn-outline flex items-center justify-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>

                <button
                  onClick={() => router.push('/admin/scraping')}
                  className="btn-outline flex items-center justify-center"
                >
                  <Database className="w-4 h-4 mr-2" />
                  View Scraping Log
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Connection</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Posts</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {stats.totalPosts} Published
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Timeline Entries</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {stats.totalTimeline} Events
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Update</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {stats.lastUpdate ? format(new Date(stats.lastUpdate), 'MMM d') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="card-body">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="py-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {activity.type === 'blog' ? (
                            <FileText className="h-5 w-5 text-primary-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-secondary-600" />
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                {activity.title}
                              </p>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${activity.type === 'blog'
                                  ? 'bg-primary-100 text-primary-800'
                                  : 'bg-secondary-100 text-secondary-800'
                                  }`}>
                                  {activity.type === 'blog' ? activity.category : activity.eventType}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {activity.type === 'timeline' && activity.entryDate
                                    ? format(new Date(activity.entryDate), 'MMM d, yyyy')
                                    : format(new Date(activity.date), 'MMM d, yyyy')
                                  }
                                </span>
                                {activity.isArchived && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                    Archived
                                  </span>
                                )}
                              </div>
                              {(activity.excerpt || activity.description) && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                  {activity.excerpt || activity.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            if (activity.type === 'blog') {
                              router.push(`/blog/${activity.id}`)
                            } else if (activity.fullEntry) {
                              setSelectedTimelineEntry(activity.fullEntry)
                              setShowTimelineDetail(true)
                            } else {
                              router.push('/timeline')
                            }
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title={activity.type === 'timeline' ? 'View Details' : 'View Post'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (activity.type === 'blog') {
                              router.push(`/admin/blog/${activity.id}/edit`)
                            } else {
                              router.push(`/admin/timeline/${activity.id}/edit`)
                            }
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Tutorial */}
      <Tutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          setShowTutorial(false)
          // Could show a completion message or redirect
        }}
      />

      {/* Timeline Detail Modal */}
      <TimelineDetailModal
        isOpen={showTimelineDetail}
        onClose={() => {
          setShowTimelineDetail(false)
          setSelectedTimelineEntry(null)
        }}
        timelineEntry={selectedTimelineEntry}
      />
    </Layout>
  )
}