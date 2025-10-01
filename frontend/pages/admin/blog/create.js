import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import { useAuth } from '../../../contexts/AuthContext'
import DatabaseService from '../../../lib/supabase'
import { Save, ArrowLeft, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateBlogPost() {
  const [post, setPost] = useState({
    title: '',
    category: 'General Legal',
    tags: [],
    excerpt: '',
    introduction: '',
    main_content: '',
    conclusion: '',
    case_type: '',
    outcome: '',
    significance: 'Medium',
    legal_implications: '',
    twitter_summary: '',
    linkedin_summary: '',
    publication_date: new Date().toISOString().split('T')[0]
  })
  
  const [sources, setSources] = useState([{
    url: '',
    title: '',
    publication: '',
    source_date: '',
    source_type: 'News Article',
    case_number: ''
  }])
  
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

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
  const sourceTypes = ['News Article', 'Court Document', 'Legal Brief', 'Press Release', 'Official Statement']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPost(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSourceChange = (index, field, value) => {
    setSources(prev => prev.map((source, i) => 
      i === index ? { ...source, [field]: value } : source
    ))
  }

  const addSource = () => {
    setSources(prev => [...prev, {
      url: '',
      title: '',
      publication: '',
      source_date: '',
      source_type: 'News Article',
      case_number: ''
    }])
  }

  const removeSource = (index) => {
    setSources(prev => prev.filter((_, i) => i !== index))
  }

  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200
    const wordCount = (content.match(/\w+/g) || []).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} min read`
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Calculate reading time and word count
      const fullContent = `${post.introduction} ${post.main_content} ${post.conclusion}`
      const wordCount = (fullContent.match(/\w+/g) || []).length
      const readingTime = calculateReadingTime(fullContent)

      // Create the blog post
      const postData = {
        ...post,
        reading_time: readingTime,
        word_count: wordCount,
        author: 'Research Team'
      }

      const createdPost = await DatabaseService.createBlogPost(postData)
      
      // Add sources if any
      if (sources.some(source => source.url.trim())) {
        // Note: You'll need to implement source creation in DatabaseService
        console.log('Sources to add:', sources.filter(source => source.url.trim()))
      }

      toast.success('Blog post created successfully!')
      router.push('/admin/blog')
    } catch (error) {
      toast.error('Error creating blog post')
      console.error('Error:', error)
    } finally {
      setSaving(false)
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
    <Layout title="Create Blog Post - Admin">
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
            <p className="text-gray-600 mt-2">Add a new legal case or article</p>
          </div>
        </div>

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
                  value={post.title}
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
                    value={post.category}
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
                    value={post.publication_date}
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
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="form-input flex-1"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-outline"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={post.excerpt}
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
                  value={post.introduction}
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
                  value={post.main_content}
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
                  value={post.conclusion}
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
                    value={post.case_type}
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
                    value={post.significance}
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
                  value={post.outcome}
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
                  value={post.legal_implications}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* Sources */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Sources</h2>
              <button
                type="button"
                onClick={addSource}
                className="btn-outline btn-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </button>
            </div>
            <div className="card-body space-y-6">
              {sources.map((source, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Source {index + 1}</h3>
                    {sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL
                      </label>
                      <input
                        type="url"
                        value={source.url}
                        onChange={(e) => handleSourceChange(index, 'url', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={source.title}
                        onChange={(e) => handleSourceChange(index, 'title', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Publication
                      </label>
                      <input
                        type="text"
                        value={source.publication}
                        onChange={(e) => handleSourceChange(index, 'publication', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source Date
                      </label>
                      <input
                        type="date"
                        value={source.source_date}
                        onChange={(e) => handleSourceChange(index, 'source_date', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source Type
                      </label>
                      <select
                        value={source.source_type}
                        onChange={(e) => handleSourceChange(index, 'source_type', e.target.value)}
                        className="form-select"
                      >
                        {sourceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}