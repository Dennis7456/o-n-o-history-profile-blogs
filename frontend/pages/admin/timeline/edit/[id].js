import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../../components/Layout'
import { useAuth } from '../../../../contexts/AuthContext'
import DatabaseService from '../../../../lib/supabase'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditTimelineEntry() {
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [relatedCaseInput, setRelatedCaseInput] = useState('')

  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    if (id) {
      loadEntry()
    }
  }, [isAuthenticated, isAdmin, router, id])

  const loadEntry = async () => {
    try {
      setLoading(true)
      const entryData = await DatabaseService.getTimelineEntry(id)
      setEntry(entryData)
    } catch (error) {
      toast.error('Error loading timeline entry')
      console.error('Error:', error)
      router.push('/admin/timeline')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEntry(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRelatedCasesChange = (e) => {
    const cases = e.target.value.split(',').map(case_ => case_.trim()).filter(case_ => case_)
    setEntry(prev => ({
      ...prev,
      related_cases: cases
    }))
  }

  const handleAddRelatedCase = () => {
    if (relatedCaseInput.trim() && !entry.related_cases.includes(relatedCaseInput.trim())) {
      setEntry(prev => ({
        ...prev,
        related_cases: [...(prev.related_cases || []), relatedCaseInput.trim()]
      }))
      setRelatedCaseInput('')
    }
  }

  const handleRemoveRelatedCase = (caseToRemove) => {
    setEntry(prev => ({
      ...prev,
      related_cases: (prev.related_cases || []).filter(case_ => case_ !== caseToRemove)
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await DatabaseService.updateTimelineEntry(id, entry)
      toast.success('Timeline entry updated successfully!')
      router.push('/admin/timeline')
    } catch (error) {
      toast.error('Error updating timeline entry')
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this timeline entry? This action cannot be undone.')) {
      setDeleting(true)
      try {
        await DatabaseService.deleteTimelineEntry(id)
        toast.success('Timeline entry deleted successfully!')
        router.push('/admin/timeline')
      } catch (error) {
        toast.error('Error deleting timeline entry')
        console.error('Error:', error)
      } finally {
        setDeleting(false)
      }
    }
  }

  const eventTypes = [
    'Government Appointment',
    'Legal Case',
    'Court Appearance',
    'Legal Judgment',
    'Legal Submission',
    'Public Statement',
    'Recognition/Award',
    'Educational Milestone',
    'Legal Event',
    'Legal Clarification'
  ]

  const confidenceLevels = ['High', 'Medium', 'Low']

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
      <Layout title="Edit Timeline Entry - Admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </Layout>
    )
  }

  if (!entry) {
    return (
      <Layout title="Entry Not Found - Admin">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Timeline Entry Not Found</h1>
            <p className="text-gray-600 mb-8">The timeline entry you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/admin/timeline')}
              className="btn-primary"
            >
              Back to Timeline
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`Edit: ${entry.title} - Admin`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Timeline
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Timeline Entry</h1>
            <p className="text-gray-600 mt-2">Update the timeline entry information</p>
          </div>
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
                  value={entry.title || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    id="event_type"
                    name="event_type"
                    value={entry.event_type || ''}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="entry_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="entry_date"
                    name="entry_date"
                    value={entry.entry_date || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confidence_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Level
                </label>
                <select
                  id="confidence_level"
                  name="confidence_level"
                  value={entry.confidence_level || 'High'}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {confidenceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={entry.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                  required
                  placeholder="Detailed description of the event or milestone..."
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label htmlFor="significance" className="block text-sm font-medium text-gray-700 mb-2">
                  Significance
                </label>
                <textarea
                  id="significance"
                  name="significance"
                  value={entry.significance || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-textarea"
                  placeholder="Why is this event significant in Kennedy Ogeto's career?"
                />
              </div>

              <div>
                <label htmlFor="legal_context" className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Context
                </label>
                <textarea
                  id="legal_context"
                  name="legal_context"
                  value={entry.legal_context || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-textarea"
                  placeholder="Legal background, implications, or context..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Cases
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(entry.related_cases || []).map((case_, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {case_}
                      <button
                        type="button"
                        onClick={() => handleRemoveRelatedCase(case_)}
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
                    value={relatedCaseInput}
                    onChange={(e) => setRelatedCaseInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRelatedCase())}
                    className="form-input flex-1"
                    placeholder="Add a related case..."
                  />
                  <button
                    type="button"
                    onClick={handleAddRelatedCase}
                    className="btn-outline"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: {entry.related_cases ? entry.related_cases.join(', ') : 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Entry ID:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">{entry.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Event Type:</span>
                  <span className="ml-2 text-gray-900">{entry.event_type}</span>
                </div>
                {entry.created_at && (
                  <div>
                    <span className="font-medium text-gray-600">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {entry.updated_at && (
                  <div>
                    <span className="font-medium text-gray-600">Last Updated:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(entry.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/admin/timeline')}
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