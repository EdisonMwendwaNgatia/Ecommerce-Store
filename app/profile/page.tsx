'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Phone, MapPin, Save, Loader2, Camera, Package, Bell, Shield, Calendar, Edit2, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabaseClient'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'

interface UserProfile {
  first_name: string
  last_name: string
  phone: string
  address: string
  county: string
  city: string
  postal_code: string
  date_of_birth: string
  gender: string
  alternative_phone: string
  delivery_instructions: string
  marketing_consent: boolean
  avatar_url: string
}

const KENYAN_COUNTIES = [
  'Nairobi', 'Kiambu', 'Machakos', 'Kajiado', 'Nakuru', 
  'Mombasa', 'Kisumu', 'Eldoret', 'Thika', 'Nyeri', 
  'Meru', 'Kakamega', 'Uasin Gishu', 'Kilifi', 'Kwale', 'Other'
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    county: '',
    city: '',
    postal_code: '',
    date_of_birth: '',
    gender: 'prefer_not_to_say',
    alternative_phone: '',
    delivery_instructions: '',
    marketing_consent: true,
    avatar_url: ''
  })

  const supabase = createClient()

  // Load user profile from database
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          throw error
        }

        if (data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            address: data.address || '',
            county: data.county || '',
            city: data.city || '',
            postal_code: data.postal_code || '',
            date_of_birth: data.date_of_birth || '',
            gender: data.gender || 'prefer_not_to_say',
            alternative_phone: data.alternative_phone || '',
            delivery_instructions: data.delivery_instructions || '',
            marketing_consent: data.marketing_consent !== undefined ? data.marketing_consent : true,
            avatar_url: data.avatar_url || ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, supabase])

  const handleProfileChange = (field: keyof UserProfile, value: string | boolean) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          county: profile.county,
          city: profile.city,
          postal_code: profile.postal_code,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          alternative_phone: profile.alternative_phone,
          delivery_instructions: profile.delivery_instructions,
          marketing_consent: profile.marketing_consent,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSaveMessage('Profile saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveMessage('Error saving profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut()
      window.location.href = '/'
    }
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return false
    const phoneRegex = /^(?:254|\+254|0)?(7[0-9]{8})$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const isFormValid = () => {
    return (
      profile.first_name.trim() !== '' &&
      profile.last_name.trim() !== '' &&
      profile.phone.trim() !== '' &&
      validatePhone(profile.phone) &&
      profile.address.trim() !== '' &&
      profile.county.trim() !== '' &&
      profile.city.trim() !== ''
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to view and edit your profile.</p>
            <a href="/auth/login" className="inline-block">
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium">
                Sign In
              </button>
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {profile.first_name?.[0]}{profile.last_name?.[0] || user.email?.[0].toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-green-500 hover:bg-green-50 transition-colors">
                  <Camera className="h-4 w-4 text-green-600" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : 'Complete Your Profile'
                  }
                </h1>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    {profile.first_name ? 'Verified Account' : 'Setup Required'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'personal'
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  Personal Info
                </button>
                
                <button
                  onClick={() => setActiveTab('delivery')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'delivery'
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                  Delivery Details
                </button>
                
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'preferences'
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  Preferences
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'security'
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  Security
                </button>
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Profile Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Complete</span>
                    <span className={`font-semibold ${
                      isFormValid() ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {isFormValid() ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <Edit2 className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={profile.first_name}
                          onChange={(e) => handleProfileChange('first_name', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Enter first name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={profile.last_name}
                          onChange={(e) => handleProfileChange('last_name', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="07XX XXX XXX"
                          />
                        </div>
                        {profile.phone && !validatePhone(profile.phone) && (
                          <p className="text-xs text-red-600 mt-1">Please enter a valid Kenyan phone number</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alternative Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={profile.alternative_phone}
                            onChange={(e) => handleProfileChange('alternative_phone', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="date"
                            value={profile.date_of_birth}
                            onChange={(e) => handleProfileChange('date_of_birth', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={profile.gender}
                          onChange={(e) => handleProfileChange('gender', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="prefer_not_to_say">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Details Tab */}
              {activeTab === 'delivery' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          County *
                        </label>
                        <select
                          value={profile.county}
                          onChange={(e) => handleProfileChange('county', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select county</option>
                          {KENYAN_COUNTIES.map((county) => (
                            <option key={county} value={county}>
                              {county}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City/Town *
                        </label>
                        <input
                          type="text"
                          value={profile.city}
                          onChange={(e) => handleProfileChange('city', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Enter city/town"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={profile.postal_code}
                        onChange={(e) => handleProfileChange('postal_code', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="00100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Address *
                      </label>
                      <textarea
                        value={profile.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                        placeholder="Building name, street, landmark..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Instructions
                      </label>
                      <textarea
                        value={profile.delivery_instructions}
                        onChange={(e) => handleProfileChange('delivery_instructions', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                        placeholder="Gate code, special directions, best time to deliver..."
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">Help us deliver your products safely</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Communication Preferences</h2>
                    <Bell className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={profile.marketing_consent}
                        onChange={(e) => handleProfileChange('marketing_consent', e.target.checked)}
                        className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="marketing" className="block font-semibold text-gray-900 cursor-pointer">
                          Marketing Communications
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Receive exclusive offers, new product launches, and tips
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <h3 className="font-semibold text-green-900 mb-2">🌟 Why Stay Connected?</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Be first to know about new products</li>
                      <li>• Get exclusive member-only discounts</li>
                      <li>• Receive helpful tips and updates</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-green-300 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">Password</h3>
                          <p className="text-sm text-gray-600 mt-1">Update your password regularly</p>
                        </div>
                        <button className="px-4 py-2 text-green-600 font-medium hover:bg-green-50 rounded-lg transition-colors">
                          Change
                        </button>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-3">Account Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Account Created</span>
                          <span className="text-gray-500">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Last Login</span>
                          <span className="text-gray-500">Recently</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button - Always visible */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                <div>
                  {saveMessage && (
                    <p className={`text-sm font-medium ${
                      saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {saveMessage}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={!isFormValid() || isSaving}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium shadow-sm flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}