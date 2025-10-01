import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../../components/Layout'
import { useAuth } from '../../../../contexts/AuthContext'
import DatabaseService from '../../../../lib/supabase'
import { Save, ArrowLeft, Archive, RotateCcw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditBlogPost() {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    if (id) {
      loadPost()
    }
  }, [isAuthenticated, isAdmin, router, id])

  const loadPost = async () => {
    try {
      setLoading(true)
      const postData = await DatabaseService.getBlogPost(id)
      setPost(postData)
    } catch (error) {
      toast.error('Error loading blog post')
      console.error('Error:', error)
      router.push('/admin/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPost(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setPost(prev => ({
      ...prev,
      tags: tags
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await DatabaseService.updateBlogPost(id, post)
      toast.success('Blog post updated successfully!')
      router.push('/admin/blog')
    } catch (error) {
      toast.error('Error updating blog post')
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleArchiveToggle = async () => {
    setArchiving(true)
    try {
      if (post.is_archived) {
        await DatabaseService.unarchiveBlogPost(id)
        toast.success('Post restored successfully!')
      } else {
        await DatabaseService.archiveBlogPost(id)
        toast.success('Post archived successfully!')
      }
      loadPost() // Reload to get updated status
    } catch (error) {
      toast.error(error.message || 'Error updating post status')
      console.error('Error:', error)
    } finally {
      setArchiving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this blog post? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      await DatabaseService.deleteBlogPost(id)
      toast.success('Blog post deleted successfully!')
      router.push('/admin/blog')
    } catch (error) {
      toast.error('Error deleting blog post')
      console.error('Error:', error)
    } finally {
      setDeleting(false)
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

  if (loading) {
    return (
      <Layout title="Edit Blog Post - Admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout title="Post Not Found - Admin">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/admin/blog')}
              className="btn-primary"
            >
              Back to Blog Posts
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const categories = [
    'Election Law',
    'International Criminal Law',
    'International Criminal Court',
    'Constitutional Law',
    'International Investment Law',
    'Government Appointments',
    'Government Legal Affairs',
    'General Legal'
  ]

  const significanceLevels = ['High', 'Medium', 'Low']

  return (
    <Layout title={`Edit: ${post.title} - Admin`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog Posts
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
            <p className="text-gray-600 mt-2">Update the blog post information</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleArchiveToggle}
              disabled={archiving}
              className={`btn-outline ${post.is_archived ? 'text-green-600 border-green-600 hover:bg-green-50' : 'text-orange-600 border-orange-600 hover:bg-orange-50'}`}
            >
              {archiving ? (
                <div className="loading-spinner w-4 h-4 mr-2"></div>
              ) : post.is_archived ? (
                <RotateCcw className="w-4 h-4 mr-2" />
              ) : (
                <Archive className="w-4 h-4 mr-2" />
              )}
              {post.is_archived ? 'Restore' : 'Archive'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
            >
              {deleting ? (
                <div className="loading-spinner w-4 h-4 mr-2"></div>
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {post.is_archived && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <Archive className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">This post is archived</h3>
                <p className="text-sm text-orange-700">It's hidden from the public website but can be restored anytime.</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={post.title || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={post.category || ''}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Date *
                  </label>
                  <input
                    type="date"
                    id="publication_date"
                    name="publication_date"
                    value={post.publication_date || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={post.tags ? post.tags.join(', ') : ''}
                  onChange={handleTagsChange}
                  className="form-input"
                  placeholder="Tag1, Tag2, Tag3..."
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={post.excerpt || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-textarea"
                  placeholder="Brief summary of the post..."
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Content</h2>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-2">
                  Introduction
                </label>
                <textarea
                  id="introduction"
                  name="introduction"
                  value={post.introduction || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                />
              </div>

              <div>
                <label htmlFor="main_content" className="block text-sm font-medium text-gray-700 mb-2">
                  Main Content *
                </label>
                <textarea
                  id="main_content"
                  name="main_content"
                  value={post.main_content || ''}
                  onChange={handleInputChange}
                  rows={10}
                  className="form-textarea"
                  required
                />
              </div>

              <div>
                <label htmlFor="conclusion" className="block text-sm font-medium text-gray-700 mb-2">
                  Conclusion
                </label>
                <textarea
                  id="conclusion"
                  name="conclusion"
                  value={post.conclusion || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* Legal Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Legal Details</h2>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="case_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Case Type
                  </label>
                  <input
                    type="text"
                    id="case_type"
                    name="case_type"
                    value={post.case_type || ''}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="significance" className="block text-sm font-medium text-gray-700 mb-2">
                    Significance
                  </label>
                  <select
                    id="significance"
                    name="significance"
                    value={post.significance || 'Medium'}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {significanceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-2">
                  Outcome
                </label>
                <textarea
                  id="outcome"
                  name="outcome"
                  value={post.outcome || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div>
                <label htmlFor="legal_implications" className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Implications
                </label>
                <textarea
                  id="legal_implications"
                  name="legal_implications"
                  value={post.legal_implications || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin/blog')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}