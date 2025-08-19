"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderOpen, Users, Calendar, Target, TrendingUp, MoreVertical, Edit, Trash2, Eye, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on-hold' | 'completed'
  progress: number
  startDate: string
  endDate: string
  teamMembers: string[]
  budget: string
  priority: 'low' | 'medium' | 'high'
  tasksCount: number
  completedTasks: number
}

const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design',
    status: 'active',
    progress: 65,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    budget: '$15,000',
    priority: 'high',
    tasksCount: 24,
    completedTasks: 16
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'iOS and Android app for customer engagement',
    status: 'planning',
    progress: 15,
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    teamMembers: ['Sarah Wilson', 'Alex Brown'],
    budget: '$25,000',
    priority: 'medium',
    tasksCount: 18,
    completedTasks: 3
  },
  {
    id: '3',
    name: 'Database Migration',
    description: 'Migrate from legacy system to cloud database',
    status: 'completed',
    progress: 100,
    startDate: '2023-11-01',
    endDate: '2024-01-15',
    teamMembers: ['Mike Johnson', 'Lisa Chen'],
    budget: '$8,000',
    priority: 'high',
    tasksCount: 12,
    completedTasks: 12
  }
]

const statusColors = {
  planning: 'bg-blue-500',
  active: 'bg-green-500',
  'on-hold': 'bg-yellow-500',
  completed: 'bg-purple-500'
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-orange-500',
  high: 'bg-red-500'
}

export function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>(sampleProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as 'planning' | 'active' | 'on-hold' | 'completed',
    startDate: '',
    endDate: '',
    teamMembers: '',
    budget: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const { toast } = useToast()

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusCount = (status: string) => {
    return projects.filter(p => p.status === status).length
  }

  const totalBudget = projects.reduce((sum, p) => {
    const budget = parseInt(p.budget.replace(/[$,]/g, ''))
    return sum + budget
  }, 0)

  const handleAddProject = () => {
    if (!newProject.name || !newProject.description || !newProject.startDate || !newProject.endDate || !newProject.budget) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      progress: 0,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      teamMembers: newProject.teamMembers ? newProject.teamMembers.split(',').map(m => m.trim()) : [],
      budget: newProject.budget,
      priority: newProject.priority,
      tasksCount: 0,
      completedTasks: 0
    }

    setProjects([...projects, project])
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      teamMembers: '',
      budget: '',
      priority: 'medium'
    })
    setIsCreateModalOpen(false)
    
    toast({
      title: "Success",
      description: `Project "${project.name}" has been created successfully`,
    })
  }

  const resetForm = () => {
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      teamMembers: '',
      budget: '',
      priority: 'medium'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and organize your projects</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} variant="neon">
          <Plus className="h-4 w-4 mr-2" />
          New Project
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
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total Projects</span>
          </div>
          <div className="text-2xl font-bold mt-2">{projects.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Active Projects</span>
          </div>
          <div className="text-2xl font-bold mt-2">{getStatusCount('active')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total Budget</span>
          </div>
          <div className="text-2xl font-bold mt-2">${totalBudget.toLocaleString()}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Team Members</span>
          </div>
          <div className="text-2xl font-bold mt-2">
            {new Set(projects.flatMap(p => p.teamMembers)).size}
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border rounded-lg p-6 hover:shadow-lg transition-all duration-200"
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Status and Priority */}
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[project.status]}`}>
                {project.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${priorityColors[project.priority]}`}>
                {project.priority}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{project.startDate} - {project.endDate}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{project.teamMembers.length} team members</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span>{project.completedTasks}/{project.tasksCount} tasks completed</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Budget: {project.budget}</span>
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

      {/* Create Project Modal */}
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
                  <h2 className="text-2xl font-bold">Create New Project</h2>
                  <p className="text-muted-foreground">Fill in the details to create a new project</p>
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
                  <label className="text-sm font-medium">Project Name *</label>
                  <Input
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value as 'planning' | 'active' | 'on-hold' | 'completed' })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date *</label>
                  <Input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date *</label>
                  <Input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget *</label>
                  <Input
                    placeholder="e.g., $15,000"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    placeholder="Enter project description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Team Members</label>
                  <Input
                    placeholder="Enter team members (comma-separated)"
                    value={newProject.teamMembers}
                    onChange={(e) => setNewProject({ ...newProject, teamMembers: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple team members with commas</p>
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
                  onClick={handleAddProject}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
