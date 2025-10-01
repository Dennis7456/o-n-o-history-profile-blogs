import { useState, useEffect } from 'react'
import { X, Calendar, Tag, Scale, FileText, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

export default function TimelineDetailModal({ isOpen, onClose, timelineEntry }) {
  const [sources, setSources] = useState([])

  useEffect(() => {
    if (timelineEntry && timelineEntry.sources) {
      setSources(timelineEntry.sources)
    }
  }, [timelineEntry])

  if (!isOpen || !timelineEntry) return null

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

  const getConfidenceColor = (level) => {
    const colors = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-full">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Timeline Entry Details</h2>
                <p className="text-sm text-gray-500">
                  {format(new Date(timelineEntry.entry_date), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Title and Metadata */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {timelineEntry.title}
              </h1>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(timelineEntry.event_type)}`}>
                  <Tag className="w-4 h-4 mr-1" />
                  {timelineEntry.event_type}
                </span>
                
                {timelineEntry.confidence_level && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(timelineEntry.confidence_level)}`}>
                    Confidence: {timelineEntry.confidence_level}
                  </span>
                )}
                
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(timelineEntry.entry_date), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Description
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {timelineEntry.description}
                </p>
              </div>
            </div>

            {/* Significance */}
            {timelineEntry.significance && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Significance
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {timelineEntry.significance}
                  </p>
                </div>
              </div>
            )}

            {/* Legal Context */}
            {timelineEntry.legal_context && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Scale className="w-5 h-5 mr-2" />
                  Legal Context
                </h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {timelineEntry.legal_context}
                  </p>
                </div>
              </div>
            )}

            {/* Related Cases */}
            {timelineEntry.related_cases && timelineEntry.related_cases.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Cases</h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {timelineEntry.related_cases.map((caseItem, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{caseItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Sources */}
            {sources && sources.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Sources ({sources.length})
                </h3>
                <div className="space-y-3">
                  {sources.map((source, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {source.title}
                          </h4>
                          {source.publication && (
                            <p className="text-sm text-gray-600 mb-2">
                              {source.publication}
                              {source.date && ` • ${format(new Date(source.date), 'MMM d, yyyy')}`}
                            </p>
                          )}
                          {source.type && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 text-gray-700">
                              {source.type}
                            </span>
                          )}
                        </div>
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 text-primary-600 hover:text-primary-700 flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Entry ID:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">{timelineEntry.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Event Type:</span>
                  <span className="ml-2 text-gray-900">{timelineEntry.event_type}</span>
                </div>
                {timelineEntry.created_at && (
                  <div>
                    <span className="font-medium text-gray-600">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {format(new Date(timelineEntry.created_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                )}
                {timelineEntry.updated_at && (
                  <div>
                    <span className="font-medium text-gray-600">Updated:</span>
                    <span className="ml-2 text-gray-900">
                      {format(new Date(timelineEntry.updated_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="btn-outline mr-3"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Navigate to edit page if it exists
                window.open(`/admin/timeline/${timelineEntry.id}/edit`, '_blank')
              }}
              className="btn-primary"
            >
              Edit Entry
            </button>
          </div>
        </div>
      </div>
    </>
  )
}