import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import { useAuth } from '../../../contexts/AuthContext'
import DatabaseService from '../../../lib/supabase'
import { Save, ArrowLeft, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateTimelineEntry() {
  const [entry, setEntry] = useState({
    title: '',
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
    event_type: 'Legal Event',
    significance: '',
    legal_context: '',
    related_cases: [],
    confidence_level: 'High'
  })
  
  const [sources, setSources] = useState([{
    url: '',
    title: '',
    publication: '',
    source_date: '',
    source_type: 'News Article'
  }])
  
  const [saving, setSaving] = useState(false)
  const [relatedCaseInput, setRelatedCaseInput] = useState('')

  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

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
  const sourceTypes = ['News Article', 'Court Document', 'Legal Brief', 'Press Release', 'Official Statement']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEntry(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddRelatedCase = () => {
    if (relatedCaseInput.trim() && !entry.related_cases.includes(relatedCaseInput.trim())) {
      setEntry(prev => ({
        ...prev,
        related_cases: [...prev.related_cases, relatedCaseInput.trim()]
      }))
      setRelatedCaseInput('')
    }
  }

  const handleRemoveRelatedCase = (caseToRemove) => {
    setEntry(prev => ({
      ...prev,
      related_cases: prev.related_cases.filter(case_ => case_ !== caseToRemove)
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
      source_type: 'News Article'
    }])
  }

  const removeSource = (index) => {
    setSources(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const createdEntry = await DatabaseService.createTimelineEntry(entry)
      
      // Note: Sources functionality will be available when timeline_sources table is created
      // For now, we'll just create the timeline entry
      
      toast.success('Timeline entry created successfully!')
      router.push('/admin/timeline')
      
    } catch (error) {
      toast.error('Error creating timeline entry')
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
    <Layout title="Create Timeline Entry - Admin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Timeline
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Timeline Entry</h1>
          <p className="text-gray-600 mt-2">Add a new milestone or event to Kennedy Ogeto's career timeline</p>
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
                  value={entry.title}
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
                    value={entry.event_type}
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
                    value={entry.entry_date}
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
                  value={entry.confidence_level}
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
                  value={entry.description}
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
                  value={entry.significance}
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
                  value={entry.legal_context}
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
                  {entry.related_cases.map((case_, index) => (
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
                  Create Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}