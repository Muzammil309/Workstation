"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, MoreVertical, Edit, Trash2, Eye, Mail, Phone, MapPin, Calendar, X, UserPlus, Save, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  department: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  skills?: string[] // Added skills field
}

const departments = [
  'Development',
  'Design', 
  'Marketing',
  'Sales',
  'Support',
  'Management',
  'Operations',
  'Research',
  'Quality Assurance',
  'DevOps',
  'custom'
]

export function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin',
    department: '',
    customDepartment: '',
    status: 'active' as 'active' | 'inactive',
    skills: [] as string[]
  })
  
  const { toast } = useToast()
  const { user } = useAuth()

  // Load team members from Supabase
  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')
      
      if (error) throw error
      setTeam(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load team members: " + error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTeam = team.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment
    return matchesSearch && matchesDepartment
  })

  const getDepartmentCount = (dept: string) => {
    return team.filter(m => m.department === dept).length
  }

  const getActiveMembers = () => {
    return team.filter(m => m.status === 'active').length
  }

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.role || !newMember.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Handle custom department
    let finalDepartment = newMember.department
    if (newMember.department === 'custom' && newMember.customDepartment) {
      finalDepartment = newMember.customDepartment
    } else if (newMember.department === 'custom' && !newMember.customDepartment) {
      toast({
        title: "Validation Error",
        description: "Please enter a custom department name",
        variant: "destructive"
      })
      return
    }

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newMember.email,
        password: 'changemechanics123', // Default password
        email_confirm: true
      })

      if (authError) throw authError

      if (authData.user) {
        // Add user details to users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: newMember.email,
            name: newMember.name,
            role: newMember.role,
            department: finalDepartment,
            status: newMember.status,
            skills: newMember.skills,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) throw insertError

        toast({
          title: "Success",
          description: `${newMember.name} has been added to the team. Default password: changemechanics123`,
        })

        // Reload team members
        await loadTeamMembers()
        
        // Reset form and close modal
        resetForm()
        setIsCreateModalOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add team member: " + error.message,
        variant: "destructive"
      })
    }
  }

  const handleEditMember = async () => {
    if (!editingMember) return

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editingMember.name,
          role: editingMember.role,
          department: editingMember.department,
          status: editingMember.status,
          skills: editingMember.skills,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMember.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `${editingMember.name}'s profile has been updated`,
      })

      // Reload team members
      await loadTeamMembers()
      
      // Close edit modal
      setIsEditModalOpen(false)
      setEditingMember(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update team member: " + error.message,
        variant: "destructive"
      })
    }
  }

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      toast({
        title: "Success",
        description: `${memberName} has been removed from the team`,
      })

      // Reload team members
      await loadTeamMembers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove team member: " + error.message,
        variant: "destructive"
      })
    }
  }

  const openEditModal = (member: TeamMember) => {
    setEditingMember({ ...member })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setNewMember({
      name: '',
      email: '',
      role: 'user',
      department: '',
      customDepartment: '',
      status: 'active',
      skills: []
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and their roles</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} variant="neon">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card-light dark:glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Members</p>
              <p className="text-2xl font-bold">{team.length}</p>
            </div>
            <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-neon-blue" />
            </div>
          </div>
        </div>
        
        <div className="glass-card-light dark:glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Members</p>
              <p className="text-2xl font-bold text-green-600">{getActiveMembers()}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="glass-card-light dark:glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Admins</p>
              <p className="text-2xl font-bold text-purple-600">{team.filter(m => m.role === 'admin').length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="glass-card-light dark:glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Departments</p>
              <p className="text-2xl font-bold text-blue-600">{new Set(team.map(m => m.department)).size}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Departments</option>
          {departments.filter(dept => dept !== 'custom').map(dept => (
            <option key={dept} value={dept}>{dept} ({getDepartmentCount(dept)})</option>
          ))}
        </select>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeam.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-light dark:glass-card p-6 rounded-lg border hover:shadow-lg transition-all duration-200"
          >
            {/* Member Avatar and Basic Info */}
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-neon-blue to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <h3 className="font-semibold text-xl mb-1">{member.name}</h3>
              <p className="text-muted-foreground text-sm mb-2">{member.email}</p>
            </div>

            {/* Member Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.role === 'admin' 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Department:</span>
                <span className="text-sm font-medium">{member.department}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
              </div>

              {/* Skills Section */}
              <div className="mt-3">
                <span className="text-sm text-muted-foreground block mb-2">Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {(member.skills || []).length > 0 ? (
                    (member.skills || []).map((skill, index) => {
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
                          className={`px-2 py-1 text-xs rounded-full ${skillColors[colorIndex]}`}
                        >
                          {skill}
                        </span>
                      )
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No skills listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => openEditModal(member)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              {member.role !== 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteMember(member.id, member.name)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Member Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Add Team Member</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="email@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Role *</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value as 'user' | 'admin' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Department *</label>
                  <select
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Select department</option>
                    {departments.filter(dept => dept !== 'custom').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                {newMember.department === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Custom Department *</label>
                    <Input
                      value={newMember.customDepartment}
                      onChange={(e) => setNewMember({ ...newMember, customDepartment: e.target.value })}
                      placeholder="Enter department name"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={newMember.status}
                    onChange={(e) => setNewMember({ ...newMember, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Skills</label>
                  <Input
                    value={(newMember.skills || []).join(', ')}
                    onChange={(e) => setNewMember({ 
                      ...newMember, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    placeholder="React, TypeScript, Node.js (separate with commas)"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate skills with commas</p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember} className="flex-1">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Member Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Team Member</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <Input
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={editingMember.email}
                    disabled
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Role *</label>
                  <select
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as 'user' | 'admin' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Department *</label>
                  <select
                    value={editingMember.department}
                    onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    {departments.filter(dept => dept !== 'custom').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Skills</label>
                  <Input
                    value={(editingMember.skills || []).join(', ')}
                    onChange={(e) => setEditingMember({ 
                      ...editingMember, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    })}
                    placeholder="React, TypeScript, Node.js (separate with commas)"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate skills with commas</p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleEditMember} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
