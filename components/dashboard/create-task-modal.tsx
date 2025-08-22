"use client"

/**
 * CREATE TASK MODAL
 * 
 * IMPORTANT: Auto-delete is completely OPTIONAL
 * - By default, tasks are PERMANENT and will never be deleted automatically
 * - Users must explicitly check the auto-delete checkbox to enable this feature
 * - This ensures no accidental task deletion
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

interface Project {
  id: string
  name: string
  description: string
  status: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface Task {
  title: string
  description: string
  project_id: string
  estimatedHours: number
  status: 'pending' | 'in-progress' | 'completed'
  deadline: string
  notes: string
  assignees: string[]
  priority: 'low' | 'medium' | 'high'
  dependencies?: string[]
  tags?: string[]
  progress: number
}

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id' | 'assignedOn'> & { assignedOn?: string; autoDelete?: { enabled: boolean; duration: number } }) => void
  existingTasks?: Array<{ id: string; title: string; status: string }>
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, existingTasks = [] }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'assignedOn'> & { assignedOn?: string; autoDelete?: { enabled: boolean; duration: number } }>({
    title: '',
    description: '',
    project_id: '',
    estimatedHours: 0,
    assignedOn: new Date().toISOString().split('T')[0],
    status: 'pending',
    deadline: '',
    notes: '',
    assignees: [],
    priority: 'medium',
    progress: 0,
    tags: [],
    dependencies: [],
    autoDelete: {
      enabled: false,
      duration: 24
    }
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)

  // Fetch projects and users on modal open
  useEffect(() => {
    if (isOpen) {
      fetchProjects()
      fetchUsers()
    }
  }, [isOpen])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, status')
        .order('name', { ascending: true })
      
      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, department')
        .eq('status', 'active')
        .order('name', { ascending: true })
      
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.project_id && formData.deadline) {
      onSubmit(formData)
      setFormData({
        title: '',
        description: '',
        project_id: '',
        estimatedHours: 0,
        assignedOn: new Date().toISOString().split('T')[0],
        status: 'pending',
        deadline: '',
        notes: '',
        assignees: [],
        priority: 'medium',
        progress: 0,
        tags: [],
        dependencies: [],
        autoDelete: {
          enabled: false,
          duration: 24
        }
      })
    }
  }

  const handleChange = (field: keyof Task, value: string | number | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectProject = (project: Project) => {
    setFormData(prev => ({ ...prev, project_id: project.id }))
    setShowProjectDropdown(false)
  }

  const selectAssignee = (user: User) => {
    setFormData(prev => {
      const isAlreadySelected = prev.assignees.includes(user.id)
      if (isAlreadySelected) {
        // Remove if already selected
        return { ...prev, assignees: prev.assignees.filter(id => id !== user.id) }
      } else {
        // Add if not selected
        return { ...prev, assignees: [...prev.assignees, user.id] }
      }
    })
  }

  const removeAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(id => id !== userId)
    }))
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project ? project.name : 'Select a project'
  }

  const getAssigneeNames = (assigneeIds: string[]) => {
    if (assigneeIds.length === 0) return 'Select assignees'
    if (assigneeIds.length === 1) {
      const user = users.find(u => u.id === assigneeIds[0])
      return user ? user.name : 'Unknown user'
    }
    return `${assigneeIds.length} members selected`
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.project-dropdown') && !target.closest('.assignee-dropdown')) {
        setShowProjectDropdown(false)
        setShowAssigneeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-background border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Create New Task</h2>
                <p className="text-muted-foreground">Add a new task to your project</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <div className="relative project-dropdown">
                    <button
                      type="button"
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-sm text-left hover:bg-accent transition-colors"
                    >
                      <span className={formData.project_id ? 'text-foreground' : 'text-muted-foreground'}>
                        {getProjectName(formData.project_id)}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    
                    {showProjectDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
                        {projects.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No projects available
                          </div>
                        ) : (
                          projects.map((project) => (
                            <button
                              key={project.id}
                              type="button"
                              onClick={() => selectProject(project)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                            >
                              <div className="font-medium">{project.name}</div>
                              {project.description && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {project.description}
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter task description"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="space-y-2">
                   <Label htmlFor="assignees">Assignees</Label>
                   <div className="relative assignee-dropdown">
                     <button
                       type="button"
                       onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                       className="w-full flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-sm text-left hover:bg-accent transition-colors"
                     >
                       <span className={formData.assignees.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                         {getAssigneeNames(formData.assignees)}
                       </span>
                       <ChevronDown className="w-4 h-4 text-muted-foreground" />
                     </button>
                     
                     {/* Selected Assignees Display */}
                     {formData.assignees.length > 0 && (
                       <div className="mt-2 flex flex-wrap gap-2">
                         {formData.assignees.map((assigneeId) => {
                           const user = users.find(u => u.id === assigneeId)
                           return user ? (
                             <span
                               key={assigneeId}
                               className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full border border-blue-300 dark:border-blue-700"
                             >
                               {user.name}
                               <button
                                 type="button"
                                 onClick={() => removeAssignee(assigneeId)}
                                 className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                               >
                                 ×
                               </button>
                             </span>
                           ) : null
                         })}
                       </div>
                     )}
                     
                     {showAssigneeDropdown && (
                       <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
                         {users.length === 0 ? (
                           <div className="px-3 py-2 text-sm text-muted-foreground">
                             No users available
                           </div>
                         ) : (
                           users.map((user) => {
                             const isSelected = formData.assignees.includes(user.id)
                             return (
                               <button
                                 key={user.id}
                                 type="button"
                                 onClick={() => selectAssignee(user)}
                                 className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                                   isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                                 }`}
                               >
                                 <div className="flex items-center justify-between">
                                   <div>
                                     <div className="font-medium">{user.name}</div>
                                     <div className="text-xs text-muted-foreground">
                                       {user.department} • {user.role}
                                     </div>
                                   </div>
                                   {isSelected && (
                                     <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                       <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                       </svg>
                                     </div>
                                   )}
                                 </div>
                               </button>
                             )
                           })
                         )}
                       </div>
                     )}
                   </div>
                 </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => handleChange('estimatedHours', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 8.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

                             <div className="space-y-2">
                 <Label htmlFor="notes">Notes</Label>
                 <textarea
                   id="notes"
                   value={formData.notes}
                   onChange={(e) => handleChange('notes', e.target.value)}
                   placeholder="Additional notes or comments"
                   className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none"
                   rows={3}
                 />
               </div>

               {/* Progress */}
               <div className="space-y-2">
                 <Label htmlFor="progress">Initial Progress (%)</Label>
                 <Input
                   id="progress"
                   type="number"
                   min="0"
                   max="100"
                   step="5"
                   value={formData.progress}
                   onChange={(e) => handleChange('progress', parseInt(e.target.value) || 0)}
                   placeholder="0"
                 />
                 <div className="w-full bg-gray-200 rounded-full h-2">
                   <div 
                     className="bg-neon-blue h-2 rounded-full transition-all duration-300" 
                     style={{ width: `${formData.progress}%` }}
                   ></div>
                 </div>
               </div>

               {/* Tags */}
               <div className="space-y-2">
                 <Label htmlFor="tags">Tags (comma-separated)</Label>
                 <Input
                   id="tags"
                   value={formData.tags?.join(', ') || ''}
                   onChange={(e) => {
                     const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                     setFormData(prev => ({ ...prev, tags }))
                   }}
                   placeholder="e.g., frontend, urgent, design"
                 />
                 {formData.tags && formData.tags.length > 0 && (
                   <div className="flex flex-wrap gap-2 mt-2">
                     {formData.tags.map((tag, index) => (
                       <span 
                         key={index}
                         className="px-2 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded-full border border-neon-blue/30"
                       >
                         #{tag}
                       </span>
                     ))}
                   </div>
                 )}
               </div>

               {/* Dependencies */}
               <div className="space-y-2">
                 <Label htmlFor="dependencies">Dependencies</Label>
                 <select
                   multiple
                   value={formData.dependencies || []}
                   onChange={(e) => {
                     const selected = Array.from(e.target.selectedOptions, option => option.value)
                     setFormData(prev => ({ ...prev, dependencies: selected }))
                   }}
                   className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[100px]"
                 >
                   {existingTasks
                     .filter(task => task.status !== 'completed')
                     .map(task => (
                       <option key={task.id} value={task.id}>
                         {task.title} ({task.status})
                       </option>
                     ))}
                 </select>
                 <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple dependencies</p>
                 {formData.dependencies && formData.dependencies.length > 0 && (
                   <div className="flex flex-wrap gap-2 mt-2">
                     {formData.dependencies.map((depId) => {
                       const depTask = existingTasks.find(t => t.id === depId)
                       return depTask ? (
                         <span 
                           key={depId}
                           className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full border border-orange-300 dark:border-orange-700"
                         >
                           📋 {depTask.title}
                         </span>
                       ) : null
                     })}
                   </div>
                 )}
               </div>

              {/* Auto-Delete Settings */}
              <div className="space-y-3 p-4 border border-dashed border-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoDelete"
                    checked={formData.autoDelete?.enabled}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      autoDelete: { 
                        ...formData.autoDelete!, 
                        enabled: e.target.checked 
                      } 
                    })}
                    className="w-4 h-4 text-neon-blue bg-transparent border-white/20 rounded focus:ring-neon-blue/20"
                  />
                  <Label htmlFor="autoDelete" className="text-sm font-medium">
                    Automatically delete task after specified duration
                  </Label>
                </div>
                
                {formData.autoDelete?.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="autoDeleteDuration">Duration (hours)</Label>
                      <Input
                        id="autoDeleteDuration"
                        type="number"
                        min="1"
                        max="720" // 30 days
                        value={formData.autoDelete?.duration || 24}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          autoDelete: { 
                            ...formData.autoDelete!, 
                            duration: parseInt(e.target.value) || 24 
                          } 
                        })}
                        className="bg-transparent border-white/20 text-white placeholder:text-gray-400 focus:border-neon-blue focus:ring-neon-blue/20"
                      />
                    </div>
                    <div className="flex items-end">
                      <span className="text-xs text-gray-400">
                        Task will be deleted after {formData.autoDelete?.duration || 24} hours
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="neon">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
