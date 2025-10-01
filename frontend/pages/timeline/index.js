import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { Calendar, ExternalLink, MapPin, Award, Scale, Users } from 'lucide-react'
import { format } from 'date-fns'
import DatabaseService from '../../lib/supabase'

export default function Timeline() {
  const [timeline, setTimeline] = useState([])
  const [selectedEventType, setSelectedEventType] = useState('All')
  const [filteredTimeline, setFilteredTimeline] = useState([])
  const [loading, setLoading] = useState(true)

  // Sample timeline data for fallback
  const sampleTimeline = [
  {
    id: '1',
    entry_date: '2025-09-04',
    event_type: 'Government Appointment',
    title: 'Appointed to Panel of Experts on Compensation of Victims of Protest',
    description: 'Kennedy Ogeto was sworn in as a member of the Panel of Experts on the Compensation of Victims of Protest, bringing his extensive legal expertise to address victims\' rights and compensation matters.',
    significance: 'High - Important human rights and victims\' compensation role',
    legal_context: 'Advancement of victims\' rights and compensation frameworks in Kenya',
    sources: [
      {
        url: 'https://www.youtube.com/watch?v=LocZPStDmb0',
        title: 'Kennedy Ogeto Sworn in as a member of Panel of Experts on the Compensation of Victims of Protest',
        publication: 'YouTube - Kenya Digital News',
        type: 'Video Recording'
      }
    ]
  },
  {
    id: '2',
    entry_date: '2023-03-01',
    event_type: 'Government Appointment',
    title: 'Appointed as Legal Adviser to President William Ruto',
    description: 'Kennedy Ogeto was appointed as Legal Adviser to President William Ruto, bringing his extensive experience from his role as Solicitor General and international legal practice.',
    significance: 'High - Senior government appointment',
    legal_context: 'Provides legal counsel to the President on matters of national importance',
    sources: [
      {
        url: 'https://www.businessdailyafrica.com/bd/lifestyle/profiles/-former-solicitor-general-appointed-ruto-s-legal-adviser--4173726',
        title: 'Former Solicitor General appointed Ruto\'s legal adviser',
        publication: 'Business Daily Africa',
        type: 'News Article'
      }
    ]
  },
  {
    id: '3',
    entry_date: '2021-06-11',
    event_type: 'Legal Clarification',
    title: 'Clarified NMS Legality as Solicitor General',
    description: 'Solicitor General Kennedy Ogeto addressed public concerns about the National Management System (NMS) legality, clarifying that the court had declared it constitutional.',
    significance: 'Medium - Important constitutional clarification',
    legal_context: 'Affirmed validity of NMS and addressed public misinformation',
    sources: [
      {
        url: 'https://www.youtube.com/watch?v=ED5jntqRoh0',
        title: 'Solicitor General Kennedy Ogeto Clarifies NMS Legality',
        publication: 'YouTube',
        type: 'Video Recording'
      }
    ]
  },
  {
    id: '4',
    entry_date: '2020-07-01',
    event_type: 'Legal Case',
    title: 'Successfully Defended Kenya in $370M WalAm Energy ICSID Case',
    description: 'Kennedy Ogeto led Kenya\'s successful defense against a $370 million claim by WalAm Energy Inc. at the International Centre for Settlement of Investment Disputes.',
    significance: 'High - Major international arbitration victory',
    legal_context: 'Demonstrated expertise in international investment law and saved Kenya from massive financial liability',
    sources: []
  },
  {
    id: '5',
    entry_date: '2018-03-14',
    event_type: 'Government Appointment',
    title: 'Appointed as Solicitor General of Kenya',
    description: 'The National Assembly of Kenya approved President Uhuru Kenyatta\'s nominee, Kennedy Ogeto, as the new Solicitor General, marking a significant milestone in Kenya\'s legal landscape.',
    significance: 'High - Senior government legal position',
    legal_context: 'Enhanced government legal coordination and reduced litigation costs',
    sources: [
      {
        url: 'https://www.the-star.co.ke/news/2018-03-14-mps-approve-ken-ogetto-as-new-solicitor-general/',
        title: 'MPs approve Ken Ogeto as new Solicitor General',
        publication: 'The Star Kenya',
        type: 'News Article'
      }
    ]
  },
  {
    id: '6',
    entry_date: '2017-11-16',
    event_type: 'Court Appearance',
    title: 'Supreme Court Submission on Election Offences',
    description: 'Kennedy Ogeto appeared before the Supreme Court as Uhuru Kenyatta\'s lawyer, making comprehensive submissions on election offences allegations in the 2017 presidential election petition.',
    significance: 'High - Landmark presidential election petition',
    legal_context: 'Affirmed high standard of proof and protection of voters\' Article 38 rights',
    sources: [
      {
        url: 'https://www.youtube.com/watch?v=P2ZBaoywRtI',
        title: 'Uhuru\'s lawyer, Ken Ogeto\'s submission on election offences',
        publication: 'YouTube',
        type: 'Video Recording'
      }
    ]
  },
  {
    id: '7',
    entry_date: '2005-01-01',
    event_type: 'Legal Case',
    title: 'Co-Led Defense at UN Special Court for Sierra Leone',
    description: 'Kennedy Ogeto co-led the defense for a former Revolutionary United Front commander at the United Nations Special Court for Sierra Leone, handling complex cases related to the country\'s civil war.',
    significance: 'High - Advanced international criminal law expertise',
    legal_context: 'Demonstrated expertise in war crimes and crimes against humanity cases',
    sources: []
  },
  {
    id: '8',
    entry_date: '2000-01-01',
    event_type: 'Legal Case',
    title: 'Lead Defense Counsel at UNICTR',
    description: 'Kennedy Ogeto\'s international legal career began as lead defense counsel at the United Nations International Criminal Tribunal for Rwanda, representing individuals accused of crimes related to the 1994 genocide.',
    significance: 'High - Foundation of international legal career',
    legal_context: 'Demonstrated expertise in international criminal law and genocide cases',
    sources: []
  }
]

  useEffect(() => {
    loadTimelineData()
  }, [])

  useEffect(() => {
    if (selectedEventType === 'All') {
      setFilteredTimeline(timeline)
    } else {
      setFilteredTimeline(timeline.filter(entry => entry.event_type === selectedEventType))
    }
  }, [selectedEventType, timeline])

  const loadTimelineData = async () => {
    try {
      setLoading(true)
      const timelineData = await DatabaseService.getTimelineEntries()
      setTimeline(timelineData)
      setFilteredTimeline(timelineData)
    } catch (error) {
      console.error('Error loading timeline:', error)
      // Fallback to sample data if database fails
      setTimeline(sampleTimeline)
      setFilteredTimeline(sampleTimeline)
    } finally {
      setLoading(false)
    }
  }

  const eventTypes = ['All', 'Government Appointment', 'Legal Case', 'Court Appearance', 'Legal Clarification']

  const handleFilterChange = (eventType) => {
    setSelectedEventType(eventType)
    if (eventType === 'All') {
      setFilteredTimeline(timeline)
    } else {
      setFilteredTimeline(timeline.filter(entry => entry.event_type === eventType))
    }
  }

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'Government Appointment':
        return <Users className="w-5 h-5 text-blue-600" />
      case 'Legal Case':
        return <Scale className="w-5 h-5 text-green-600" />
      case 'Court Appearance':
        return <Award className="w-5 h-5 text-purple-600" />
      case 'Legal Clarification':
        return <MapPin className="w-5 h-5 text-orange-600" />
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />
    }
  }

  const getSignificanceLevel = (significance) => {
    if (significance.includes('High')) return 'High'
    if (significance.includes('Medium')) return 'Medium'
    return 'Low'
  }

  const getSignificanceColor = (significance) => {
    const level = getSignificanceLevel(significance)
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Layout title="Career Timeline - Kennedy Ogetto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Career Timeline</h1>
          <p className="text-gray-600 text-lg">
            A chronological journey through Kennedy Ogeto's distinguished legal career, 
            from international tribunals to senior government positions.
          </p>
        </div>

        {/* Event Type Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((eventType) => (
              <button
                key={eventType}
                onClick={() => handleFilterChange(eventType)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedEventType === eventType
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {eventType}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">{timeline.length}</div>
            <div className="text-gray-600">Total Events</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">
              {timeline.filter(e => e.event_type === 'Government Appointment').length}
            </div>
            <div className="text-gray-600">Appointments</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">
              {timeline.filter(e => e.event_type === 'Legal Case').length}
            </div>
            <div className="text-gray-600">Legal Cases</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-primary-600">25+</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-8">
              {filteredTimeline.map((entry, index) => (
              <div key={entry.id} className="relative flex items-start">
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-16 h-16 bg-white border-4 border-primary-200 rounded-full flex items-center justify-center shadow-sm">
                  {getEventIcon(entry.event_type)}
                </div>

                {/* Content */}
                <div className="ml-6 flex-1">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <time className="text-lg font-semibold text-primary-600">
                            {format(new Date(entry.entry_date), 'MMMM d, yyyy')}
                          </time>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {entry.event_type}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {entry.title}
                        </h3>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSignificanceColor(entry.significance)}`}>
                        {getSignificanceLevel(entry.significance)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-4">
                      {entry.description}
                    </p>

                    {/* Legal Context */}
                    {entry.legal_context && (
                      <div className="bg-gray-50 rounded-md p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Legal Context</h4>
                        <p className="text-sm text-gray-700">{entry.legal_context}</p>
                      </div>
                    )}

                    {/* Sources */}
                    {entry.sources && entry.sources.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Sources</h4>
                        <div className="space-y-2">
                          {entry.sources.map((source, sourceIndex) => (
                            <a
                              key={sourceIndex}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                            >
                              <ExternalLink className="w-3 h-3 mr-2" />
                              {source.title} - {source.publication}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>
        )}

        {filteredTimeline.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found for the selected type.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}