import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import DatabaseService from '../lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, 
  Award, 
  BookOpen, 
  Scale, 
  Users,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'

export default function Home() {
  const [profile, setProfile] = useState(null)
  const [recentPosts, setRecentPosts] = useState([])
  const [recentTimeline, setRecentTimeline] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load profile data
      let profileData = null
      try {
        profileData = await DatabaseService.getProfile()
      } catch (error) {
        console.log('Profile not found:', error)
        profileData = null
      }
      
      // Load blog posts
      let postsData = []
      try {
        postsData = await DatabaseService.getBlogPosts(3)
      } catch (error) {
        console.log('Blog posts not found:', error)
        postsData = []
      }
      
      // Load timeline data
      let timelineData = []
      try {
        timelineData = await DatabaseService.getTimelineEntries(5)
      } catch (error) {
        console.log('Timeline not found:', error)
        timelineData = []
      }
      
      setProfile(profileData)
      setRecentPosts(postsData)
      setRecentTimeline(timelineData)
    } catch (error) {
      console.error('Error loading data:', error)
      setProfile(null)
      setRecentPosts([])
      setRecentTimeline([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                {profile?.full_name || 'Kennedy Ogeto'}
              </h1>
              <p className="text-xl mb-4 text-primary-100">
                {profile?.current_position || 'Legal Adviser to President William Ruto'}
              </p>
              <p className="text-lg mb-8 text-primary-200">
                {profile?.specialization || 'International and Municipal Law'} • {profile?.career_span || '26+ years of experience'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/blog" className="btn bg-white text-primary-600 hover:bg-gray-100">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Legal Cases
                </Link>
                <Link href="/timeline" className="btn border-white text-white hover:bg-white hover:text-primary-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Career Timeline
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-80 h-96 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="/kennedy-ogeto-profile.png"
                  alt={profile?.full_name || 'Kennedy Ogeto'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{recentPosts.length}</div>
              <div className="text-gray-600">Published Cases</div>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{recentTimeline.length}</div>
              <div className="text-gray-600">Career Milestones</div>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{profile?.career_span || '26+ years'}</div>
              <div className="text-gray-600">Experience</div>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{profile?.specialization ? profile.specialization.split(',').length : 2}</div>
              <div className="text-gray-600">Specializations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Legal Cases</h2>
              <p className="text-gray-600">Latest developments in Kennedy Ogeto's legal career</p>
            </div>
            <Link href="/blog" className="btn-outline">
              View All Cases
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <article key={post.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {post.category}
                    </span>
                    <time className="text-sm text-gray-500">
                      {format(new Date(post.publication_date), 'MMM d, yyyy')}
                    </time>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {post.reading_time}
                    </span>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Career Timeline Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Career Timeline</h2>
              <p className="text-gray-600">Key milestones in a distinguished legal career</p>
            </div>
            <Link href="/timeline" className="btn-outline">
              View Full Timeline
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="space-y-8">
            {recentTimeline.slice(0, 3).map((entry, index) => (
              <div key={entry.id} className="flex">
                <div className="flex-shrink-0 w-24 text-right">
                  <time className="text-sm font-medium text-gray-900">
                    {format(new Date(entry.entry_date), 'yyyy')}
                  </time>
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-primary-600 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {entry.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {entry.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {entry.event_type}
                        </span>
                        {entry.sources && entry.sources.length > 0 && (
                          <span className="ml-3 flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {entry.sources.length} source{entry.sources.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Background */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Professional Background</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Position</h3>
                  <p className="text-gray-600">{profile?.current_position}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Previous Position</h3>
                  <p className="text-gray-600">{profile?.previous_position}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Law Firm</h3>
                  <p className="text-gray-600">{profile?.law_firm}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialization</h3>
                  <p className="text-gray-600">{profile?.specialization}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Education</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Undergraduate</h3>
                  <p className="text-gray-600">{profile?.undergraduate}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Graduate</h3>
                  <p className="text-gray-600">{profile?.graduate}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional</h3>
                  <p className="text-gray-600">{profile?.professional}</p>
                </div>
                
                {profile?.institutions && profile.institutions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Institutions</h3>
                    <ul className="text-gray-600 space-y-1">
                      {profile.institutions.map((institution, index) => (
                        <li key={index}>• {institution}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}