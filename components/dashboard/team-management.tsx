"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, MoreVertical, Edit, Trash2, Eye, Mail, Phone, MapPin, Calendar, X, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar: string
  status: 'active' | 'inactive' | 'away'
  joinDate: string
  phone: string
  location: string
  skills: string[]
  projects: string[]
  performance: number
}

const sampleTeam: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    avatar: 'JD',
    status: 'active',
    joinDate: '2022-03-15',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    projects: ['Website Redesign', 'Mobile App'],
    performance: 95
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'Product Manager',
    department: 'Product',
    avatar: 'JS',
    status: 'active',
    joinDate: '2021-08-20',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    skills: ['Product Strategy', 'User Research', 'Agile', 'Analytics'],
    projects: ['Website Redesign', 'Database Migration'],
    performance: 92
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'Backend Developer',
    department: 'Engineering',
    avatar: 'MJ',
    status: 'away',
    joinDate: '2023-01-10',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    projects: ['Database Migration', 'API Development'],
    performance: 88
  }
]

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  away: 'bg-yellow-500'
}

export function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>(sampleTeam)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    customDepartment: '',
    phone: '',
    location: '',
    skills: '',
    status: 'active' as 'active' | 'inactive' | 'away'
  })
  const { toast } = useToast()

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

  const getAveragePerformance = () => {
    const total = team.reduce((sum, m) => sum + m.performance, 0)
    return Math.round(total / team.length)
  }

  const handleAddMember = () => {
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

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      department: finalDepartment,
      avatar: newMember.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      status: newMember.status,
      joinDate: new Date().toISOString().split('T')[0],
      phone: newMember.phone,
      location: newMember.location,
      skills: newMember.skills ? newMember.skills.split(',').map(s => s.trim()) : [],
      projects: [],
      performance: Math.floor(Math.random() * 30) + 70
    }

    setTeam([...team, member])
    setNewMember({
      name: '',
      email: '',
      role: '',
      department: '',
      customDepartment: '',
      phone: '',
      location: '',
      skills: '',
      status: 'active'
    })
    setIsCreateModalOpen(false)
    
    toast({
      title: "Success",
      description: `${member.name} has been added to the team`,
    })
  }

  const resetForm = () => {
    setNewMember({
      name: '',
      email: '',
      role: '',
      department: '',
      customDepartment: '',
      phone: '',
      location: '',
      skills: '',
      status: 'active'
    })
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
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total Members</span>
          </div>
          <div className="text-2xl font-bold mt-2">{team.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-muted-foreground">Active Members</span>
          </div>
          <div className="text-2xl font-bold mt-2">{getActiveMembers()}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-muted-foreground">Engineering</span>
          </div>
          <div className="text-2xl font-bold mt-2">{getDepartmentCount('Engineering')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full" />
            <span className="text-sm font-medium text-muted-foreground">Avg Performance</span>
          </div>
          <div className="text-2xl font-bold mt-2">{getAveragePerformance()}%</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Product">Product</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
          <option value="Customer Support">Customer Support</option>
          <option value="Legal">Legal</option>
          <option value="Research & Development">Research & Development</option>
          <option value="Quality Assurance">Quality Assurance</option>
          <option value="DevOps">DevOps</option>
          <option value="Data Science">Data Science</option>
          <option value="Business Development">Business Development</option>
          <option value="Project Management">Project Management</option>
          <option value="Training">Training</option>
          <option value="Security">Security</option>
          <option value="Infrastructure">Infrastructure</option>
        </select>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTeam.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border rounded-lg p-6 hover:shadow-lg transition-all duration-200"
          >
            {/* Member Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Status and Department */}
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[member.status]}`}>
                {member.status}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {member.department}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{member.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{member.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{member.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined {new Date(member.joinDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {member.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-1 bg-muted rounded text-xs">
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && (
                  <span className="px-2 py-1 bg-muted rounded text-xs">
                    +{member.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Performance */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Performance</span>
                <span>{member.performance}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${member.performance}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Add New Team Member</h2>
                  <p className="text-muted-foreground">Fill in the details to add a new team member</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    placeholder="Enter full name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role *</label>
                  <Input
                    placeholder="Enter job role"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Department *</label>
                  <div className="flex gap-2">
                    <select
                      value={newMember.department}
                      onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Legal">Legal</option>
                      <option value="Research & Development">Research & Development</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Business Development">Business Development</option>
                      <option value="Project Management">Project Management</option>
                      <option value="Training">Training</option>
                      <option value="Security">Security</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="custom">+ Add Custom Department</option>
                    </select>
                    {newMember.department === 'custom' && (
                      <Input
                        placeholder="Enter custom department"
                        value={newMember.customDepartment || ''}
                        onChange={(e) => setNewMember({ ...newMember, customDepartment: e.target.value })}
                        className="flex-1"
                      />
                    )}
                  </div>
                  {newMember.department === 'custom' && (
                    <p className="text-xs text-muted-foreground">Type your custom department name</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    placeholder="Enter phone number"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="Enter location"
                    value={newMember.location}
                    onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Skills</label>
                  <Input
                    placeholder="Enter skills (comma-separated)"
                    value={newMember.skills}
                    onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple skills with commas</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={newMember.status}
                    onChange={(e) => setNewMember({ ...newMember, status: e.target.value as 'active' | 'inactive' | 'away' })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="away">Away</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsCreateModalOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
