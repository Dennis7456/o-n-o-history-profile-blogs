import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import { useAuth } from '../../../contexts/AuthContext'
import { Save, Upload, User, Briefcase, GraduationCap, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    full_name: 'Kennedy Ogeto',
    current_position: 'Legal Adviser to President William Ruto (2023-Present)',
    previous_position: 'Solicitor General of Kenya (2018-2022)',
    law_firm: 'Ogeto, Otachi and Company Advocates (Managing Partner)',
    career_span: '26+ years',
    specialization: 'International and Municipal Law',
    undergraduate: "Bachelor's degree in Law from University of Nairobi",
    graduate: "Master's degree in Law from University of Nairobi",
    professional: 'Diploma in Legal Practice from Kenya School of Law',
    institutions: ['University of Nairobi', 'Kenya School of Law'],
    featured_image_url: '/kennedy-ogeto-profile.png',
    featured_image_alt: 'Kennedy Ogeto - Professional Portrait',
    featured_image_caption: 'Kennedy Ogeto - Professional Portrait'
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
      return
    }
    // In a real app, load profile data from Supabase here
  }, [isAuthenticated, isAdmin, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInstitutionsChange = (e) => {
    const institutions = e.target.value.split(',').map(inst => inst.trim()).filter(inst => inst)
    setProfile(prev => ({
      ...prev,
      institutions
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // In a real app, save to Supabase here
      // await DatabaseService.updateProfile(profile)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Error updating profile')
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
    <Layout title="Profile Settings - Admin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage Kennedy Ogeto's professional profile information</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="career_span" className="block text-sm font-medium text-gray-700 mb-2">
                  Career Span
                </label>
                <input
                  type="text"
                  id="career_span"
                  name="career_span"
                  value={profile.career_span}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 26+ years"
                />
              </div>
            </div>
          </div>

          {/* Professional Positions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Professional Positions
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label htmlFor="current_position" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Position
                </label>
                <input
                  type="text"
                  id="current_position"
                  name="current_position"
                  value={profile.current_position}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="previous_position" className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Position
                </label>
                <input
                  type="text"
                  id="previous_position"
                  name="previous_position"
                  value={profile.previous_position}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="law_firm" className="block text-sm font-medium text-gray-700 mb-2">
                  Law Firm
                </label>
                <input
                  type="text"
                  id="law_firm"
                  name="law_firm"
                  value={profile.law_firm}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label htmlFor="undergraduate" className="block text-sm font-medium text-gray-700 mb-2">
                  Undergraduate Education
                </label>
                <input
                  type="text"
                  id="undergraduate"
                  name="undergraduate"
                  value={profile.undergraduate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="graduate" className="block text-sm font-medium text-gray-700 mb-2">
                  Graduate Education
                </label>
                <input
                  type="text"
                  id="graduate"
                  name="graduate"
                  value={profile.graduate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="professional" className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Qualifications
                </label>
                <input
                  type="text"
                  id="professional"
                  name="professional"
                  value={profile.professional}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="institutions" className="block text-sm font-medium text-gray-700 mb-2">
                  Institutions (comma-separated)
                </label>
                <input
                  type="text"
                  id="institutions"
                  name="institutions"
                  value={profile.institutions.join(', ')}
                  onChange={handleInstitutionsChange}
                  className="form-input"
                  placeholder="University of Nairobi, Kenya School of Law"
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Featured Image
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div>
                <label htmlFor="featured_image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="featured_image_url"
                  name="featured_image_url"
                  value={profile.featured_image_url}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="featured_image_alt" className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  id="featured_image_alt"
                  name="featured_image_alt"
                  value={profile.featured_image_alt}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="featured_image_caption" className="block text-sm font-medium text-gray-700 mb-2">
                  Caption
                </label>
                <textarea
                  id="featured_image_caption"
                  name="featured_image_caption"
                  value={profile.featured_image_caption}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-textarea"
                />
              </div>

              {/* Image Preview */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Profile Image</p>
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src="/kennedy-ogeto-profile.png"
                    alt="Kennedy Ogeto Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Profile image is managed locally. To update, replace the file in the public directory.
                </p>
              </div>
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}