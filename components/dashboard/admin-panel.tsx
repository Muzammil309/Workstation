'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'

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

  // Check if current user is admin
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

  useEffect(() => {
    fetchUsers()
  }, [])

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

  const addNewUser = async () => {
    try {
      // First create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true
      })

      if (authError) throw authError

      // Then create profile in public.users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          status: 'active',
          phone: newUser.phone,
          location: newUser.location,
          bio: newUser.bio,
          skills: newUser.skills,
          preferences: {
            theme: 'system',
            notifications: true,
            emailUpdates: false,
            taskUpdates: true,
            projectUpdates: true,
            language: 'en'
          }
        })

      if (profileError) throw profileError

      toast({
        title: "Success",
        description: "New user created successfully",
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
      fetchUsers()
    } catch (error) {
      console.error('Error creating new user:', error)
      toast({
        title: "Error",
        description: "Failed to create new user",
        variant: "destructive"
      })
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
        <h1 className="text-2xl font-bold">Admin Panel - User Management</h1>
        <Button onClick={() => setShowAddUser(true)} className="bg-blue-600 hover:bg-blue-700">
          + Add New User
        </Button>
      </div>

      {/* Add New User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
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
                <Label htmlFor="department">Department</Label>
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
              <Button onClick={addNewUser} className="bg-blue-600 hover:bg-blue-700">
                Create User
              </Button>
              <Button 
                onClick={() => setShowAddUser(false)} 
                variant="outline"
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
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
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
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingUser(null)}
                            size="sm"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setEditingUser(user)}
                          size="sm"
                          variant="outline"
                        >
                          Edit
                        </Button>
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
            <h2 className="text-xl font-bold mb-4">Edit User Profile: {editingUser.name}</h2>
            
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
