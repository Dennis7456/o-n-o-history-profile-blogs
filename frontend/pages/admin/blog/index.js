import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  Plus, 
  Edit, 
  Archive, 
  RotateCcw,
  Eye, 
  Search,
  Filter,
  Calendar,
  Tag,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

import DatabaseService from '../../../lib/supabase'

export default function AdminBlogIndex() {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    loadBlogPosts()
  }, [isAuthenticated, isAdmin, router])

  const loadBlogPosts = async () => {
    try {
      setLoading(true)
      const blogPosts = await DatabaseService.getBlogPosts()
      setPosts(blogPosts)
      setFilteredPosts(blogPosts)
    } catch (error) {
      console.error('Error loading blog posts:', error)
      setPosts([])
      setFilteredPosts([])
    } finally {
      setLoading(false)
    }
  }

// Sample blog posts for fallback
const samplePosts = [
  {
    id: '1',
    post_id: 'ogetto-solicitor-general-appointment-2018',
    title: 'Kennedy Ogeto Appointed as Kenya\'s New Solicitor General',
    slug: 'kennedy-ogetto-appointed-solicitor-general-kenya',
    publication_date: '2018-03-14',
    category: 'Government Appointments',
    tags: ['Kenya', 'Solicitor General', 'Government', 'Legal', 'Uhuru Kenyatta'],
    excerpt: 'The National Assembly of Kenya has approved President Uhuru Kenyatta\'s nominee, Kennedy Ogeto, as the new Solicitor General.',
    reading_time: '4 minutes',
    word_count: 487,
    significance: 'High',
    updated_at: '2024-12-19'
  },
  {
    id: '2',
    post_id: 'ogetto-nms-legality-clarification-2021',
    title: '11 June 2021 – Solicitor General Kennedy Ogeto Clarifies NMS Legality',
    slug: 'kennedy-ogetto-nms-legality-clarification',
    publication_date: '2021-06-11',
    category: 'Constitutional Law',
    tags: ['NMS', 'National Management System', 'Constitutional Law', 'Government Institutions', 'Kenya'],
    excerpt: 'Solicitor General Kennedy Ogeto addressed public concerns about the National Management System (NMS) legality.',
    reading_time: '3 minutes',
    word_count: 180,
    significance: 'Medium',
    updated_at: '2024-12-19'
  },
  {
    id: '3',
    post_id: 'ogetto-compensation-panel-appointment-2025',
    title: '4 September 2025 – Kennedy Ogeto Appointed to Panel of Experts on Compensation of Victims of Protest',
    slug: 'kennedy-ogetto-compensation-panel-appointment',
    publication_date: '2025-09-04',
    category: 'Government Appointments',
    tags: ['Government Appointment', 'Compensation Panel', 'Victims Rights', 'Kenya', 'Human Rights'],
    excerpt: 'Kennedy Ogeto was sworn in as a member of the Panel of Experts on the Compensation of Victims of Protest.',
    reading_time: '4 minutes',
    word_count: 320,
    significance: 'High',
    updated_at: '2025-10-01'
  }
]



  useEffect(() => {
    let filtered = posts

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    setFilteredPosts(filtered)
  }, [searchTerm, selectedCategory, posts])

  const categories = ['All', 'Government Appointments', 'Constitutional Law', 'Election Law', 'International Criminal Law', 'International Investment Law']

  const handleArchive = async (postId) => {
    if (window.confirm('Are you sure you want to archive this blog post? It will be hidden from the public.')) {
      try {
        await DatabaseService.archiveBlogPost(postId)
        loadBlogPosts() // Reload posts
        alert('Blog post archived successfully!')
      } catch (error) {
        if (error.message.includes('Archive feature not available')) {
          alert('Archive feature not available. Please add the is_archived column to the database. See MANUAL_ARCHIVE_SETUP.md for instructions.')
        } else {
          alert('Error archiving blog post')
        }
        console.error('Error:', error)
      }
    }
  }

  const handleUnarchive = async (postId) => {
    try {
      await DatabaseService.unarchiveBlogPost(postId)
      loadBlogPosts() // Reload posts
      alert('Blog post restored successfully!')
    } catch (error) {
      if (error.message.includes('Archive feature not available')) {
        alert('Archive feature not available. Please add the is_archived column to the database. See MANUAL_ARCHIVE_SETUP.md for instructions.')
      } else {
        alert('Error restoring blog post')
      }
      console.error('Error:', error)
    }
  }

  const handleDelete = async (postId, postTitle) => {
    if (window.confirm(`Are you sure you want to permanently delete "${postTitle}"? This action cannot be undone.`)) {
      try {
        await DatabaseService.deleteBlogPost(postId)
        loadBlogPosts() // Reload posts
        alert('Blog post deleted successfully!')
      } catch (error) {
        alert('Error deleting blog post')
        console.error('Error:', error)
      }
    }
  }

  const getSignificanceColor = (significance) => {
    switch (significance) {
      case 'High':
        return 'bg-red-100 text-red-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Manage Blog Posts - Admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Blog Posts</h1>
            <p className="text-gray-600 mt-2">Create, edit, and manage Kennedy Ogeto's legal case documentation</p>
          </div>
          <Link href="/admin/blog/create" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Blog Post
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="form-select pl-10"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">{posts.length}</div>
            <div className="text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">
              {posts.filter(p => p.significance === 'High').length}
            </div>
            <div className="text-gray-600">High Significance</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">
              {new Set(posts.map(p => p.category)).size}
            </div>
            <div className="text-gray-600">Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">
              {posts.reduce((total, post) => total + post.word_count, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Words</div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Significance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="loading-spinner w-6 h-6 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {post.reading_time} • {post.word_count} words
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(post.publication_date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Updated: {format(new Date(post.updated_at), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSignificanceColor(post.significance)}`}>
                          {post.significance}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="text-gray-400 hover:text-gray-600"
                            title="View Post"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/blog/edit/${post.post_id}`}
                            className="text-primary-600 hover:text-primary-700"
                            title="Edit Post"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {post.hasOwnProperty('is_archived') ? (
                            post.is_archived ? (
                              <button
                                onClick={() => handleUnarchive(post.post_id)}
                                className="text-green-600 hover:text-green-700"
                                title="Restore Post"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleArchive(post.post_id)}
                                className="text-orange-600 hover:text-orange-700"
                                title="Archive Post"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => handleArchive(post.post_id)}
                              className="text-orange-600 hover:text-orange-700"
                              title="Archive Post (Setup Required)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(post.post_id, post.title)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No blog posts found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}