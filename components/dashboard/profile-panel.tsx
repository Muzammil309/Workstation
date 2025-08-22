"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Save, X, Camera, Shield, Key, Bell, Palette, Globe, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/lib/language-context'

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: string
  phone?: string
  location?: string
  bio?: string
  skills?: string[]
  avatar?: string
  preferences?: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    emailUpdates?: boolean
    taskUpdates?: boolean
    projectUpdates?: boolean
    language: string
  }
  created_at: string
  updated_at: string
}

export function ProfilePanel() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { t, language, setLanguage } = useLanguage()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({})
  const [activeTab, setActiveTab] = useState('personal')
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)
  const [twoFAData, setTwoFAData] = useState({
    phone: '',
    verificationCode: '',
    isVerifying: false
  })
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      
      // Set default values for missing fields
      const profileData = {
        ...data,
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        skills: data.skills || [],
        preferences: data.preferences || {
          theme: 'system',
          notifications: true,
          emailUpdates: false,
          taskUpdates: true,
          projectUpdates: true,
          language: 'en'
        }
      }
      
      setProfile(profileData)
      setEditedProfile(profileData)
    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Prepare the data for update, excluding fields that shouldn't be updated
      const updateData = {
        name: editedProfile.name,
        phone: editedProfile.phone,
        location: editedProfile.location,
        bio: editedProfile.bio,
        skills: editedProfile.skills,
        preferences: editedProfile.preferences,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      setIsEditing(false)
      await loadProfile()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile: " + error.message,
        variant: "destructive"
      })
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile || {})
    setIsEditing(false)
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    try {
      setIsChangingPassword(true)
      
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: passwordData.currentPassword
      })

      if (signInError) {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive"
        })
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Password updated successfully",
      })

      // Reset form and close modal
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsPasswordModalOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update password: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handle2FASetup = async () => {
    if (!twoFAData.phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      })
      return
    }

    try {
      setTwoFAData(prev => ({ ...prev, isVerifying: true }))
      
      // In a real implementation, you would integrate with a service like Twilio
      // For now, we'll simulate the SMS verification
      toast({
        title: "Verification Code Sent",
        description: `A 6-digit code has been sent to ${twoFAData.phone}`,
      })
      
      // Simulate receiving a verification code (in real app, user would receive SMS)
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString()
      setTwoFAData(prev => ({ ...prev, verificationCode: mockCode }))
      
      toast({
        title: "Demo Code",
        description: `Your verification code is: ${mockCode}`,
      })
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send verification code: " + error.message,
        variant: "destructive"
      })
    } finally {
      setTwoFAData(prev => ({ ...prev, isVerifying: false }))
    }
  }

  const handle2FAVerification = async () => {
    if (!twoFAData.verificationCode || twoFAData.verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive"
      })
      return
    }

    try {
      // In a real implementation, verify the code with your backend
      // For now, we'll simulate successful verification
      setIs2FAEnabled(true)
      
      toast({
        title: "Success",
        description: "Two-Factor Authentication enabled successfully!",
      })
      
      // Update user preferences to include 2FA status
      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            ...profile?.preferences,
            twoFAEnabled: true,
            twoFAPhone: twoFAData.phone
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error

      // Close modal and reset form
      setIs2FAModalOpen(false)
      setTwoFAData({
        phone: '',
        verificationCode: '',
        isVerifying: false
      })
      
      // Reload profile to get updated preferences
      await loadProfile()
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to verify code: " + error.message,
        variant: "destructive"
      })
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field === 'preferences') {
      setEditedProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...value
        }
      }))
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} variant="neon">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border rounded-lg p-6"
      >
        <div className="flex items-center space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-neon-blue to-neon-pink rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            {isEditing && (
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-muted-foreground">{profile.role}</p>
            <p className="text-muted-foreground">{profile.department}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profile.status}
              </span>
              <span className="text-sm text-muted-foreground">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'personal', label: 'Personal Info', icon: User },
            { id: 'preferences', label: 'Preferences', icon: Settings },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'personal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={editedProfile.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={editedProfile.email || ''}
                    disabled
                    className="mt-1 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={editedProfile.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={editedProfile.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={editedProfile.department || ''}
                    disabled
                    className="mt-1 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Department is managed by admin</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Input
                    value={editedProfile.status || ''}
                    disabled
                    className="mt-1 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Status is managed by admin</p>
                </div>
              </div>
            </div>

            {/* Bio and Skills */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 w-full px-3 py-2 border rounded-md bg-background disabled:bg-muted"
                  rows={4}
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                />
                <p className="text-xs text-muted-foreground mt-1">Share your story and professional background</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Skills</label>
                <Input
                  value={editedProfile.skills?.join(', ') || ''}
                  onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="React, TypeScript, Node.js, Project Management, Leadership"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate skills with commas. Add both technical and soft skills.</p>
              </div>
            </div>

            {/* Skills Preview */}
            {editedProfile.skills && editedProfile.skills.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Skills Preview</label>
                <div className="flex flex-wrap gap-2">
                  {editedProfile.skills.map((skill, index) => {
                    const skillColors = [
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
                      'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
                      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
                      'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    ]
                    const colorIndex = index % skillColors.length
                    return (
                      <span
                        key={index}
                        className={`px-3 py-1 text-sm rounded-full ${skillColors[colorIndex]}`}
                      >
                        {skill}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <select
                  value={editedProfile.preferences?.theme || 'system'}
                  onChange={(e) => handleInputChange('preferences', {
                    theme: e.target.value as 'light' | 'dark' | 'system'
                  })}
                  disabled={!isEditing}
                  className="mt-1 w-full px-3 py-2 border rounded-md bg-background disabled:bg-muted"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">Choose your preferred color scheme</p>
              </div>
              <div>
                <label className="text-sm font-medium">Language</label>
                                 <select
                   value={language}
                   onChange={(e) => {
                     setLanguage(e.target.value)
                     handleInputChange('preferences', {
                       language: e.target.value
                     })
                   }}
                   disabled={!isEditing}
                   className="mt-1 w-full px-3 py-2 border rounded-md bg-background disabled:bg-muted"
                 >
                   <option value="en">English</option>
                   <option value="es">Español</option>
                   <option value="fr">Français</option>
                   <option value="ar">العربية</option>
                   <option value="ur">اردو</option>
                 </select>
                <p className="text-xs text-muted-foreground mt-1">Select your preferred language</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications"
                  className="h-4 w-4 text-primary rounded"
                  checked={editedProfile.preferences?.notifications || false}
                  onChange={(e) => handleInputChange('preferences', {
                    notifications: e.target.checked
                  })}
                  disabled={!isEditing}
                />
                <label htmlFor="notifications" className="text-sm font-medium">Enable Notifications</label>
              </div>
              <p className="text-xs text-muted-foreground">Receive updates about tasks, projects, and team activities</p>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailUpdates"
                  className="h-4 w-4 text-primary rounded"
                  checked={editedProfile.preferences?.emailUpdates || false}
                  onChange={(e) => handleInputChange('preferences', {
                    emailUpdates: e.target.checked
                  })}
                  disabled={!isEditing}
                />
                <label htmlFor="emailUpdates" className="text-sm font-medium">Email Updates</label>
              </div>
              <p className="text-xs text-muted-foreground">Get important updates delivered to your email</p>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="taskUpdates"
                  className="h-4 w-4 text-primary rounded"
                  checked={editedProfile.preferences?.taskUpdates || false}
                  onChange={(e) => handleInputChange('preferences', {
                    taskUpdates: e.target.checked
                  })}
                  disabled={!isEditing}
                />
                <label htmlFor="taskUpdates" className="text-sm font-medium">Task Updates</label>
              </div>
              <p className="text-xs text-muted-foreground">Get notified about task changes and updates</p>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="projectUpdates"
                  className="h-4 w-4 text-primary rounded"
                  checked={editedProfile.preferences?.projectUpdates || false}
                  onChange={(e) => handleInputChange('preferences', {
                    projectUpdates: e.target.checked
                  })}
                  disabled={!isEditing}
                />
                <label htmlFor="projectUpdates" className="text-sm font-medium">Project Updates</label>
              </div>
              <p className="text-xs text-muted-foreground">Receive project status updates and milestones</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-muted/20 rounded-lg p-4">
              <h3 className="font-medium mb-2">Password</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Change your password to keep your account secure
              </p>
              <Button 
                variant="outline"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>

                         <div className="bg-muted/20 rounded-lg p-4">
               <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
               <p className="text-sm text-muted-foreground mb-4">
                 Add an extra layer of security to your account
               </p>
               <div className="flex items-center space-x-3">
                 <Button 
                   variant="outline"
                   onClick={() => setIs2FAModalOpen(true)}
                 >
                   <Shield className="w-4 h-4 mr-2" />
                   {is2FAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                 </Button>
                 {is2FAEnabled && (
                   <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                     <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                     Active
                   </span>
                 )}
               </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={editedProfile.preferences?.notifications || false}
                  onChange={(e) => handleInputChange('preferences', {
                    notifications: e.target.checked
                  })}
                  disabled={!isEditing}
                  className="w-4 h-4 text-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Task Updates</h3>
                  <p className="text-sm text-muted-foreground">Get notified about task changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={editedProfile.preferences?.taskUpdates || false}
                  onChange={(e) => handleInputChange('preferences', {
                    taskUpdates: e.target.checked
                  })}
                  disabled={!isEditing}
                  className="w-4 h-4 text-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Project Updates</h3>
                  <p className="text-sm text-muted-foreground">Receive project status updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={editedProfile.preferences?.projectUpdates || false}
                  onChange={(e) => handleInputChange('preferences', {
                    projectUpdates: e.target.checked
                  })}
                  disabled={!isEditing}
                  className="w-4 h-4 text-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Updates</h3>
                  <p className="text-sm text-muted-foreground">Get important updates delivered to your email</p>
                </div>
                <input
                  type="checkbox"
                  checked={editedProfile.preferences?.emailUpdates || false}
                  onChange={(e) => handleInputChange('preferences', {
                    emailUpdates: e.target.checked
                  })}
                  disabled={!isEditing}
                  className="w-4 h-4 text-primary"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Change Password</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="flex-1"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-Factor Authentication Modal */}
      <AnimatePresence>
        {is2FAModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIs2FAModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    value={twoFAData.phone}
                    onChange={(e) => setTwoFAData({ ...twoFAData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                  <p className="text-xs text-muted-foreground mt-1">We'll send a verification code to this number</p>
                </div>
                
                {twoFAData.verificationCode && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Verification Code</label>
                    <Input
                      type="text"
                      value={twoFAData.verificationCode}
                      onChange={(e) => setTwoFAData({ ...twoFAData, verificationCode: e.target.value })}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter the 6-digit code sent to your phone</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIs2FAModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {!twoFAData.verificationCode ? (
                  <Button 
                    onClick={handle2FASetup}
                    disabled={twoFAData.isVerifying}
                    className="flex-1"
                  >
                    {twoFAData.isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Send Code
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handle2FAVerification}
                    className="flex-1"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify & Enable
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
