import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { Calendar, Clock, Tag, ExternalLink, ArrowLeft, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import DatabaseService from '../../lib/supabase'

// Sample blog posts data (same as in blog index)
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
    content: {
      introduction: 'In a landmark decision on March 14, 2018, the National Assembly of Kenya gave its approval to President Uhuru Kenyatta\'s nominee, Kennedy Ogeto, to serve as the new Solicitor General of Kenya. This appointment represents a crucial moment in Kenya\'s legal governance, bringing aboard a seasoned legal professional with nearly three decades of experience.',
      main_content: 'During his comprehensive vetting process before the National Assembly, Kennedy Ogeto outlined a clear vision for his tenure as Solicitor General. He emphasized his unwavering commitment to reducing litigation against the government, a move that promises to save taxpayers\' funds and streamline government operations. Ogeto\'s approach focuses on proactive legal management rather than reactive litigation.\n\nOne of his key proposals involves ensuring that the Attorney General\'s office is involved in the drafting of all government bills. This strategic approach aims to guarantee the constitutionality of proposed legislation from the outset, thereby avoiding unnecessary legal challenges and court battles that could prove costly to the taxpayer.\n\nFurthermore, Ogeto proposed significant amendments to existing laws that would hold top government agency heads accountable for failing to provide necessary information to the Attorney General on legal matters. This accountability measure is designed to improve coordination between various government agencies and the central legal office.',
      conclusion: 'The approval of Kennedy Ogeto as Solicitor General represents a significant step forward for Kenya\'s legal governance. His commitment to reducing government litigation, ensuring constitutional compliance in legislation, and improving inter-agency coordination promises to bring efficiency and accountability to the country\'s legal processes.'
    },
    sources: [
      {
        url: 'https://www.the-star.co.ke/news/2018-03-14-mps-approve-ken-ogetto-as-new-solicitor-general/',
        title: 'MPs approve Ken Ogeto as new Solicitor General',
        publication: 'The Star Kenya',
        date: '2018-03-14',
        type: 'News Article'
      }
    ],
    legal_implications: 'Enhanced government legal coordination and reduced litigation costs'
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
    content: {
      introduction: 'On 11 June 2021, Solicitor General Kennedy Ogeto issued a public statement clarifying the legal status of the National Management System (NMS) after reports suggested a court had declared it unconstitutional.',
      main_content: 'Ogeto termed the allegations untrue and cited the Employment and Labour Relations Court\'s final judgment of September 2020 by Justice Hellen Wasilwa, which held that NMS was legally created and constitutional. The clarification corrected misinformation that could undermine confidence in the institution and clarified the binding legal position.',
      conclusion: 'The clarification underscored Ogeto\'s role in public legal communication and maintaining confidence in lawfully established government institutions.'
    },
    sources: [
      {
        url: 'https://www.youtube.com/watch?v=ED5jntqRoh0',
        title: 'Solicitor General Kennedy Ogeto Clarifies NMS Legality',
        publication: 'YouTube',
        date: '2021-06-11',
        type: 'Video Recording'
      }
    ],
    legal_implications: 'Affirmed validity of NMS and addressed public misinformation'
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
    content: {
      introduction: 'On 4 September 2025, Kennedy Ogeto was sworn in as a member of the Panel of Experts on the Compensation of Victims of Protest, marking another significant appointment in his distinguished legal career.',
      main_content: 'This appointment recognizes Ogeto\'s extensive experience in legal matters and his expertise in handling complex cases involving human rights and constitutional issues. The Panel of Experts is tasked with evaluating and recommending compensation for victims of protest-related incidents, requiring deep understanding of both legal principles and human rights frameworks.\n\nOgeto\'s background as former Solicitor General and current legal adviser to President Ruto, combined with his international legal experience at UNICTR and other international tribunals, makes him well-suited for this role. The panel\'s work involves assessing claims, determining appropriate compensation levels, and ensuring that victims\' rights are protected within Kenya\'s legal framework.',
      conclusion: 'This appointment further demonstrates Ogeto\'s continued commitment to public service and his role in Kenya\'s legal and human rights landscape. His expertise will be valuable in ensuring fair and just compensation for protest victims.'
    },
    sources: [
      {
        url: 'https://www.youtube.com/watch?v=LocZPStDmb0',
        title: 'Kennedy Ogeto Sworn in as a member of Panel of Experts on the Compensation of Victims of Protest',
        publication: 'YouTube - Kenya Digital News',
        date: '2025-09-04',
        type: 'Video Recording'
      }
    ],
    legal_implications: 'Advancement of victims\' rights and compensation frameworks in Kenya'
  }
]

export default function BlogPost() {
  const router = useRouter()
  const { slug } = router.query
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      loadPost()
    }
  }, [slug])

  const loadPost = async () => {
    try {
      // Try to find post by slug in database
      const posts = await DatabaseService.getBlogPosts()
      const foundPost = posts.find(p => p.slug === slug)
      
      if (foundPost) {
        // Convert database format to expected format
        const formattedPost = {
          ...foundPost,
          content: {
            introduction: foundPost.introduction || '',
            main_content: foundPost.main_content || '',
            conclusion: foundPost.conclusion || ''
          },
          sources: foundPost.sources || [],
          legal_implications: foundPost.legal_implications
        }
        setPost(formattedPost)
      } else {
        // Fallback to sample posts
        const samplePost = samplePosts.find(p => p.slug === slug)
        setPost(samplePost)
      }
    } catch (error) {
      console.error('Error loading post:', error)
      // Fallback to sample posts
      const samplePost = samplePosts.find(p => p.slug === slug)
      setPost(samplePost)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
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

  if (!post) {
    return (
      <Layout title="Post Not Found">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={post.title}>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/blog" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Cases
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              {post.category}
            </span>
            <button
              onClick={handleShare}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </button>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {format(new Date(post.publication_date), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {post.reading_time}
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2">📄</span>
              {post.word_count} words
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              post.significance === 'High' ? 'bg-red-100 text-red-800' :
              post.significance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {post.significance} Significance
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="text-lg text-gray-700 mb-8 leading-relaxed">
            {post.content.introduction}
          </div>

          {/* Main Content */}
          <div className="text-gray-700 mb-8 leading-relaxed whitespace-pre-line">
            {post.content.main_content}
          </div>

          {/* Conclusion */}
          {post.content.conclusion && (
            <div className="text-gray-700 mb-8 leading-relaxed">
              {post.content.conclusion}
            </div>
          )}
        </div>

        {/* Legal Implications */}
        {post.legal_implications && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Legal Implications</h3>
            <p className="text-blue-800">{post.legal_implications}</p>
          </div>
        )}

        {/* Sources */}
        {post.sources && post.sources.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources</h3>
            <div className="space-y-3">
              {post.sources.map((source, index) => (
                <div key={index} className="flex items-start">
                  <ExternalLink className="w-4 h-4 mt-1 mr-3 text-gray-400 flex-shrink-0" />
                  <div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {source.title}
                    </a>
                    <p className="text-sm text-gray-600">
                      {source.publication} • {source.type} • {format(new Date(source.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center">
            <Link href="/blog" className="btn-outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Cases
            </Link>
            <Link href="/timeline" className="btn-primary">
              View Timeline
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </div>
        </div>
      </article>
    </Layout>
  )
}