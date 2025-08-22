'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { Trash2, Edit, Save, X, UserPlus, Shield, User, AlertTriangle } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  department: string
  status: 'active' | 'inactive'
  phone?: string
  location?: string
  bio?: string
  skills?: string[]
  created_at: string
}

interface NewUser {
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  department: string
  phone: string
  location: string
  bio: string
  skills: string[]
}

export default function AdminPanel() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: 'Development',
    phone: '',
    location: '',
    bio: '',
    skills: []
  })
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    // Only fetch users if user is admin
    if (user && user.role === 'admin') {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ))
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
    }
  }

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: `User status updated to ${newStatus}`,
      })

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ))
    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      })
    }
  }

  const saveUserProfile = async (updatedUser: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.name,
          department: updatedUser.department,
          phone: updatedUser.phone,
          location: updatedUser.location,
          bio: updatedUser.bio,
          skills: updatedUser.skills
        })
        .eq('id', updatedUser.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "User profile updated successfully",
      })

      // Update local state
      setUsers(users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      ))
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user profile:', error)
      toast({
        title: "Error",
        description: "Failed to update user profile",
        variant: "destructive"
      })
    }
  }

  const deleteUser = async (userId: string, userEmail: string) => {
    // Prevent deletion of main admin
    if (userEmail === 'admin@changemechanics.pk') {
      toast({
        title: "Error",
        description: "Cannot delete the main admin user",
        variant: "destructive"
      })
      return
    }

    if (!confirm(`Are you sure you want to delete ${userEmail}? This action cannot be undone.`)) {
      return
    }

    try {
      // First delete from auth.users if possible
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId)
        if (authError) {
          console.warn('Could not delete from auth.users:', authError)
          // Continue with profile deletion even if auth deletion fails
        }
      } catch (authError) {
        console.warn('Auth deletion failed, continuing with profile deletion:', authError)
      }

      // Then delete profile from public.users
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      // Update local state
      setUsers(users.filter(u => u.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  const addNewUser = async () => {
    try {
      setCreatingUser(true)
      
      // Validate required fields
      if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
        toast({
          title: "Validation Error",
          description: "Name, email, and password are required",
          variant: "destructive"
        })
        return
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', newUser.email)
        .single()

      if (existingUser) {
        toast({
          title: "Error",
          description: "User with this email already exists",
          variant: "destructive"
        })
        return
      }

      // Create user via secure API route (server-side with service role)
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      toast({
        title: "Success",
        description: `New ${newUser.role} user "${newUser.name}" created successfully! They can now log in with their email and password.`,
      })

      // Reset form and refresh users
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'user',
        department: 'Development',
        phone: '',
        location: '',
        bio: '',
        skills: []
      })
      setShowAddUser(false)
      await fetchUsers()

    } catch (error: any) {
      console.error('Error creating new user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create new user",
        variant: "destructive"
      })
    } finally {
      setCreatingUser(false)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !newUser.skills.includes(skillInput.trim())) {
      setNewUser({
        ...newUser,
        skills: [...newUser.skills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setNewUser({
      ...newUser,
      skills: newUser.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const departments = ['Development', 'Design', 'Marketing', 'Management', 'Sales', 'Support']

  // Check if current user is admin - moved after hooks
  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Access Denied</h2>
          <p className="text-red-600">You need admin privileges to access this panel.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel - User Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage users, roles, and permissions with secure authentication.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddUser(true)} 
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          + Add New User
        </Button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">Secure User Creation</h3>
            <p className="text-sm text-blue-700 mt-1">
              Users are created with proper Supabase authentication. They can immediately log in with their email and password.
              All passwords are securely hashed and stored by Supabase Auth.
            </p>
          </div>
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New User</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAddUser(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'user'})}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newUser.location}
                  onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={newUser.bio}
                  onChange={(e) => setNewUser({...newUser, bio: e.target.value})}
                  placeholder="Enter user bio"
                  rows={3}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} type="button" className="bg-green-600 hover:bg-green-700">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newUser.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={addNewUser} 
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                disabled={creatingUser}
              >
                {creatingUser ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create User
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setShowAddUser(false)} 
                variant="outline"
                disabled={creatingUser}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {user.name}
                          {user.role === 'admin' && <Shield className="w-4 h-4 text-purple-500" />}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as 'admin' | 'user')}
                      className="px-2 py-1 text-sm border rounded-md bg-background"
                      disabled={user.email === 'admin@changemechanics.pk'} // Protect main admin
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === user.id ? (
                      <select
                        value={editingUser.department}
                        onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                        className="px-2 py-1 text-sm border rounded-md bg-background"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user.department}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.status}
                      onChange={(e) => updateUserStatus(user.id, e.target.value as 'active' | 'inactive')}
                      className="px-2 py-1 text-sm border rounded-md bg-background"
                      disabled={user.email === 'admin@changemechanics.pk'} // Protect main admin
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {editingUser?.id === user.id ? (
                        <>
                          <Button
                            onClick={() => saveUserProfile(editingUser)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setEditingUser(null)}
                            size="sm"
                            variant="outline"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => setEditingUser(user)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.email !== 'admin@changemechanics.pk' && (
                            <Button
                              onClick={() => deleteUser(user.id, user.email)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Profile Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit User Profile: {editingUser.name}</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setEditingUser(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingUser.location || ''}
                  onChange={(e) => setEditingUser({...editingUser, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={editingUser.bio || ''}
                  onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})}
                  placeholder="Enter user bio"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={() => saveUserProfile(editingUser)} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                onClick={() => setEditingUser(null)} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
