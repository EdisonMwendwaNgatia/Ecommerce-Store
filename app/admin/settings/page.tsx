'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, Store, Mail, Shield, Palette, CreditCard, Truck, X, Key, Eye, EyeOff } from 'lucide-react'

interface StoreSettings {
  id: string
  store_name: string
  store_description: string
  store_email: string
  store_phone: string
  store_address: string
  currency: string
  tax_rate: number
  shipping_enabled: boolean
  free_shipping_threshold: number
  maintenance_mode: boolean
  allow_registrations: boolean
  theme_colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  payment_methods: {
    stripe: boolean
    paypal: boolean
    cod: boolean
  }
  shipping_methods: Array<{
    name: string
    description: string
    price: number
    enabled: boolean
  }>
}

interface ThemeColor {
  name: string
  value: string
  var: string
  key: keyof StoreSettings['theme_colors']
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    id: '00000000-0000-0000-0000-000000000000',
    store_name: 'TVee Store',
    store_description: 'Your favorite electronics store',
    store_email: 'admin@tvee-store.com',
    store_phone: '+1 (555) 123-4567',
    store_address: '123 Electronics St, Tech City, TC 12345',
    currency: 'USD',
    tax_rate: 8.5,
    shipping_enabled: true,
    free_shipping_threshold: 50,
    maintenance_mode: false,
    allow_registrations: true,
    theme_colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#e817c9',
      background: '#ffffff'
    },
    payment_methods: {
      stripe: false,
      paypal: false,
      cod: true
    },
    shipping_methods: [
      { name: 'Standard Shipping', description: '5-7 business days', price: 4.99, enabled: true },
      { name: 'Express Shipping', description: '2-3 business days', price: 9.99, enabled: true },
      { name: 'Overnight Shipping', description: 'Next business day', price: 19.99, enabled: false }
    ]
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  
  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordResetStatus, setPasswordResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [passwordResetMessage, setPasswordResetMessage] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const supabase = createClient()

  const themeColors: ThemeColor[] = [
    { name: 'Primary', value: settings.theme_colors.primary, var: '--primary', key: 'primary' },
    { name: 'Secondary', value: settings.theme_colors.secondary, var: '--secondary', key: 'secondary' },
    { name: 'Accent', value: settings.theme_colors.accent, var: '--accent', key: 'accent' },
    { name: 'Background', value: settings.theme_colors.background, var: '--background', key: 'background' },
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      console.log('Loading settings from database...')
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single()

      if (error) {
        console.error('Supabase error loading settings:', error)
        throw error
      }

      if (data) {
        console.log('Settings loaded successfully:', data)
        setSettings(data)
        // Apply theme colors on load
        applyThemeColors(data.theme_colors)
      } else {
        console.log('No settings found in database, using defaults')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const applyThemeColors = (colors: StoreSettings['theme_colors']) => {
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key}`
      document.documentElement.style.setProperty(cssVar, value)
    })
  }

  const handleInputChange = (field: keyof StoreSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleThemeColorChange = (key: keyof StoreSettings['theme_colors'], value: string) => {
    setSettings(prev => ({
      ...prev,
      theme_colors: {
        ...prev.theme_colors,
        [key]: value
      }
    }))
    // Apply immediately for preview
    document.documentElement.style.setProperty(`--${key}`, value)
  }

  const handlePaymentMethodChange = (method: keyof StoreSettings['payment_methods'], enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      payment_methods: {
        ...prev.payment_methods,
        [method]: enabled
      }
    }))
  }

  const handleShippingMethodChange = (index: number, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      shipping_methods: prev.shipping_methods.map((method, i) => 
        i === index ? { ...method, [field]: value } : method
      )
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setSaveStatus('idle')
    setErrorMessage('')

    try {
      console.log('Saving settings to database:', settings)

      // First, check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('You must be logged in to save settings')
      }

      // Prepare the data for upsert
      const settingsToSave = {
        ...settings,
        updated_at: new Date().toISOString()
      }

      console.log('Data being sent to Supabase:', settingsToSave)

      const { data, error } = await supabase
        .from('store_settings')
        .upsert(settingsToSave)
        .select()

      if (error) {
        console.error('Supabase upsert error:', error)
        
        if (error.code === '42501') {
          throw new Error('Permission denied: You do not have admin privileges to modify settings')
        } else {
          throw new Error(error.message || `Database error: ${error.code}`)
        }
      }

      console.log('Settings saved successfully:', data)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setErrorMessage(error.message || 'Unknown error occurred while saving settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteAdmin = async () => {
    if (!inviteEmail) return

    try {
      // Generate a unique token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Create invitation
      const { error } = await supabase
        .from('admin_invites')
        .insert({
          email: inviteEmail,
          token: token,
          invited_by: user?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })

      if (error) throw error

      // In a real app, you would send an email with the invitation link
      alert(`Invitation sent to ${inviteEmail}. In a real app, this would send an email.`)
      
      setInviteEmail('')
      setShowInviteForm(false)
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Error sending invitation. Please try again.')
    }
  }

  const handlePasswordReset = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordResetMessage('Please fill in all password fields')
      setPasswordResetStatus('error')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordResetMessage('New passwords do not match')
      setPasswordResetStatus('error')
      return
    }

    if (newPassword.length < 6) {
      setPasswordResetMessage('Password must be at least 6 characters long')
      setPasswordResetStatus('error')
      return
    }

    setPasswordResetStatus('loading')
    setPasswordResetMessage('')

    try {
      // First verify current password by signing in again
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.email) {
        throw new Error('User not found')
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update password')
      }

      setPasswordResetStatus('success')
      setPasswordResetMessage('Password updated successfully!')
      
      // Reset form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      setTimeout(() => {
        setPasswordResetStatus('idle')
        setPasswordResetMessage('')
        setShowPasswordReset(false)
      }, 3000)

    } catch (error: any) {
      console.error('Error resetting password:', error)
      setPasswordResetStatus('error')
      setPasswordResetMessage(error.message || 'Failed to update password')
    }
  }

  const handleForgotPassword = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.email) {
      setPasswordResetMessage('No email address found for your account')
      setPasswordResetStatus('error')
      return
    }

    setPasswordResetStatus('loading')
    setPasswordResetMessage('Sending reset email...')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw new Error(error.message)
      }

      setPasswordResetStatus('success')
      setPasswordResetMessage('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      console.error('Error sending reset email:', error)
      setPasswordResetStatus('error')
      setPasswordResetMessage(error.message || 'Failed to send reset email')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your store configuration and preferences</p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {saveStatus === 'success' && (
        <Alert>
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage || 'Error saving settings. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your store that appears to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Store Name *</Label>
                  <Input
                    id="store_name"
                    value={settings.store_name}
                    onChange={(e) => handleInputChange('store_name', e.target.value)}
                    placeholder="Your Store Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_email">Store Email *</Label>
                  <Input
                    id="store_email"
                    type="email"
                    value={settings.store_email}
                    onChange={(e) => handleInputChange('store_email', e.target.value)}
                    placeholder="store@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_description">Store Description</Label>
                <Textarea
                  id="store_description"
                  value={settings.store_description}
                  onChange={(e) => handleInputChange('store_description', e.target.value)}
                  placeholder="Brief description of your store"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_phone">Phone Number</Label>
                  <Input
                    id="store_phone"
                    value={settings.store_phone}
                    onChange={(e) => handleInputChange('store_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="KES">KES (Ksh)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_address">Store Address</Label>
                <Textarea
                  id="store_address"
                  value={settings.store_address}
                  onChange={(e) => handleInputChange('store_address', e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment methods and tax settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Tax Configuration</h4>
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={settings.tax_rate}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Payment Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base">Stripe Payments</Label>
                      <p className="text-sm text-gray-500">Credit card payments via Stripe</p>
                    </div>
                    <Switch
                      checked={settings.payment_methods.stripe}
                      onCheckedChange={(checked) => handlePaymentMethodChange('stripe', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base">PayPal</Label>
                      <p className="text-sm text-gray-500">Pay with PayPal account</p>
                    </div>
                    <Switch
                      checked={settings.payment_methods.paypal}
                      onCheckedChange={(checked) => handlePaymentMethodChange('paypal', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base">Cash on Delivery</Label>
                      <p className="text-sm text-gray-500">Pay when order is delivered</p>
                    </div>
                    <Switch
                      checked={settings.payment_methods.cod}
                      onCheckedChange={(checked) => handlePaymentMethodChange('cod', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>
                Configure shipping options and rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="shipping_enabled" className="text-base">Enable Shipping</Label>
                  <p className="text-sm text-gray-500">Allow customers to select shipping options</p>
                </div>
                <Switch
                  id="shipping_enabled"
                  checked={settings.shipping_enabled}
                  onCheckedChange={(checked) => handleInputChange('shipping_enabled', checked)}
                />
              </div>

              {settings.shipping_enabled && (
                <>
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="free_shipping_threshold">Free Shipping Threshold ($)</Label>
                    <Input
                      id="free_shipping_threshold"
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.free_shipping_threshold}
                      onChange={(e) => handleInputChange('free_shipping_threshold', parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-sm text-gray-500">
                      Free shipping will be applied to orders above this amount
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Shipping Methods</h4>
                    {settings.shipping_methods.map((method, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base">{method.name}</Label>
                          <Switch
                            checked={method.enabled}
                            onCheckedChange={(checked) => handleShippingMethodChange(index, 'enabled', checked)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Description</Label>
                            <Input
                              value={method.description}
                              onChange={(e) => handleShippingMethodChange(index, 'description', e.target.value)}
                              placeholder="Delivery timeframe"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm">Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={method.price}
                              onChange={(e) => handleShippingMethodChange(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Store Appearance</CardTitle>
              <CardDescription>
                Customize how your store looks to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Theme Colors</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {themeColors.map((color, index) => (
                    <div key={color.name} className="space-y-2">
                      <Label className="text-sm">{color.name}</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: color.value }}
                        />
                        <Input 
                          value={color.value} 
                          className="w-24 text-sm"
                          onChange={(e) => handleThemeColorChange(color.key, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security & Access</CardTitle>
                <CardDescription>
                  Manage store access and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance_mode" className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Temporarily disable the store for maintenance
                    </p>
                  </div>
                  <Switch
                    id="maintenance_mode"
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_registrations" className="text-base">Allow User Registrations</Label>
                    <p className="text-sm text-gray-500">
                      Allow new customers to create accounts
                    </p>
                  </div>
                  <Switch
                    id="allow_registrations"
                    checked={settings.allow_registrations}
                    onCheckedChange={(checked) => handleInputChange('allow_registrations', checked)}
                  />
                </div>

                {/* Password Reset Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Password Management</h4>
                  
                  {passwordResetStatus === 'success' && (
                    <Alert>
                      <AlertDescription>{passwordResetMessage}</AlertDescription>
                    </Alert>
                  )}

                  {passwordResetStatus === 'error' && (
                    <Alert variant="destructive">
                      <AlertDescription>{passwordResetMessage}</AlertDescription>
                    </Alert>
                  )}

                  {!showPasswordReset ? (
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center gap-2"
                        onClick={() => setShowPasswordReset(true)}
                      >
                        <Key className="h-4 w-4" />
                        Change Password
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full text-sm"
                        onClick={handleForgotPassword}
                        disabled={passwordResetStatus === 'loading'}
                      >
                        Forgot Password? Send reset email
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">Change Password</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowPasswordReset(false)
                            setCurrentPassword('')
                            setNewPassword('')
                            setConfirmPassword('')
                            setPasswordResetStatus('idle')
                            setPasswordResetMessage('')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Button 
                          onClick={handlePasswordReset}
                          disabled={passwordResetStatus === 'loading'}
                          className="w-full"
                        >
                          {passwordResetStatus === 'loading' ? 'Updating Password...' : 'Update Password'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Admin Users</h4>
                  <div className="border rounded-lg">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div>
                        <p className="font-medium">admin@tvee-store.com</p>
                        <p className="text-sm text-gray-500">Super Administrator</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Edit
                      </Button>
                    </div>
                    
                    {showInviteForm ? (
                      <div className="p-4 border-b space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Invite New Admin</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowInviteForm(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                          <Button onClick={handleInviteAdmin}>
                            Send Invite
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowInviteForm(true)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Invite New Admin
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Danger Zone</h4>
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-red-800">Reset Store Data</h5>
                          <p className="text-sm text-red-600">
                            Permanently delete all products, orders, and customer data
                          </p>
                        </div>
                        <Button variant="destructive" disabled>
                          Reset Store
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}