import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import TimelineDetailModal from '../../../components/TimelineDetailModal'
import { useAuth } from '../../../contexts/AuthContext'
import DatabaseService from '../../../lib/supabase'
import { Plus, Edit, Eye, Search, Filter, Calendar, Tag, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminTimeline() {
  const [timeline, setTimeline] = useState([])
  const [filteredTimeline, setFilteredTimeline] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('All')
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    loadTimeline()
  }, [isAuthenticated, isAdmin, router])

  const loadTimeline = async () => {
    try {
      setLoading(true)
      const timelineData = await DatabaseService.getTimelineEntries()
      setTimeline(timelineData)
      setFilteredTimeline(timelineData)
    } catch (error) {
      toast.error('Error loading timeline entries')
      console.error('Error:', error)
      setTimeline([])
      setFilteredTimeline([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = timeline

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.event_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by event type
    if (selectedEventType !== 'All') {
      filtered = filtered.filter(entry => entry.event_type === selectedEventType)
    }

    setFilteredTimeline(filtered)
  }, [searchTerm, selectedEventType, timeline])

  const eventTypes = [
    'All',
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

  const getEventTypeColor = (eventType) => {
    const colors = {
      'Government Appointment': 'bg-blue-100 text-blue-800',
      'Legal Case': 'bg-green-100 text-green-800',
      'Court Appearance': 'bg-purple-100 text-purple-800',
      'Legal Judgment': 'bg-red-100 text-red-800',
      'Legal Submission': 'bg-yellow-100 text-yellow-800',
      'Public Statement': 'bg-indigo-100 text-indigo-800',
      'Recognition/Award': 'bg-pink-100 text-pink-800',
      'Educational Milestone': 'bg-teal-100 text-teal-800',
      'Legal Event': 'bg-orange-100 text-orange-800',
      'Legal Clarification': 'bg-gray-100 text-gray-800'
    }
    return colors[eventType] || 'bg-gray-100 text-gray-800'
  }

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry)
    setShowDetailModal(true)
  }

  const handleDelete = async (entryId, entryTitle) => {
    if (window.confirm(`Are you sure you want to permanently delete "${entryTitle}"? This action cannot be undone.`)) {
      try {
        await DatabaseService.deleteTimelineEntry(entryId)
        toast.success('Timeline entry deleted successfully!')
        loadTimeline() // Reload timeline
      } catch (error) {
        toast.error('Error deleting timeline entry')
        console.error('Error:', error)
      }
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
    <Layout title="Timeline Management - Admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timeline Management</h1>
            <p className="text-gray-600 mt-2">Manage Kennedy Ogeto's career timeline and milestones</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/admin/timeline/create" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Timeline Entry
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search timeline entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="form-select"
            >
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">{timeline.length}</div>
            <div className="text-gray-600">Total Entries</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">
              {new Set(timeline.map(e => e.event_type)).size}
            </div>
            <div className="text-gray-600">Event Types</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">
              {timeline.filter(e => e.significance === 'High').length}
            </div>
            <div className="text-gray-600">High Significance</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">
              {timeline.reduce((total, entry) => total + (entry.sources?.length || 0), 0)}
            </div>
            <div className="text-gray-600">Total Sources</div>
          </div>
        </div>

        {/* Timeline List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredTimeline.map((entry) => (
                <li key={entry.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-gray-900 truncate">
                            {entry.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(entry.event_type)}`}>
                              <Tag className="w-3 h-3 mr-1" />
                              {entry.event_type}
                            </span>
                            {entry.significance && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                entry.significance === 'High' ? 'bg-red-100 text-red-800' :
                                entry.significance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {entry.significance}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>
                            {format(new Date(entry.entry_date), 'MMMM d, yyyy')}
                          </span>
                          {entry.confidence_level && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Confidence: {entry.confidence_level}</span>
                            </>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {entry.description}
                        </p>
                        {entry.related_cases && entry.related_cases.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              Related cases: {entry.related_cases.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(entry)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/timeline/edit/${entry.id}`}
                        className="text-primary-600 hover:text-primary-700"
                        title="Edit Entry"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(entry.id, entry.title)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {filteredTimeline.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {timeline.length === 0 
                    ? 'No timeline entries found. Create your first entry!' 
                    : 'No entries found matching your criteria.'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline Detail Modal */}
      <TimelineDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedEntry(null)
        }}
        timelineEntry={selectedEntry}
      />
    </Layout>
  )
}