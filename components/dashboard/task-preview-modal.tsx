"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit, Save, User, Calendar, Clock, Tag, Target, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface Task {
  id: string
  title: string
  description: string
  project_id: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  progress: number
  estimated_hours: number
  deadline: string
  assignees: string[]
  tags: string[]
  dependencies: string[]
  created_at: string
  updated_at: string
}

interface Project {
  id: string
  name: string
  description: string
}

interface User {
  id: string
  name: string
  email: string
  department: string
}

interface TaskPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
}

export function TaskPreviewModal({ isOpen, onClose, task, onTaskUpdate }: TaskPreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Task>>({})
  const [project, setProject] = useState<Project | null>(null)
  const [assignees, setAssignees] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (task && isOpen) {
      setEditData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        estimated_hours: task.estimated_hours,
        deadline: task.deadline,
        tags: task.tags || [],
        assignees: task.assignees || []
      })
      fetchProjectDetails()
      fetchAssigneeDetails()
    }
  }, [task, isOpen])

  const fetchProjectDetails = async () => {
    if (!task?.project_id) return
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description')
        .eq('id', task.project_id)
        .single()
      
      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  const fetchAssigneeDetails = async () => {
    if (!task?.assignees || task.assignees.length === 0) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, department')
        .in('id', task.assignees)
      
      if (error) throw error
      setAssignees(data || [])
    } catch (error) {
      console.error('Error fetching assignees:', error)
    }
  }

  const handleSave = async () => {
    if (!task) return
    
    try {
      setLoading(true)
      await onTaskUpdate(task.id, editData)
      setIsEditing(false)
      toast({
        title: 'Success',
        description: 'Task updated successfully!',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (task) {
      setEditData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        estimated_hours: task.estimated_hours,
        deadline: task.deadline,
        tags: task.tags || [],
        assignees: task.assignees || []
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
  }

  if (!task) return null

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
            className="bg-background border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">
                  {isEditing ? 'Edit Task' : 'Task Details'}
                </h2>
                <p className="text-muted-foreground">
                  {isEditing ? 'Modify task information' : 'View complete task information'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Task Title</Label>
                    {isEditing ? (
                      <Input
                        value={editData.title || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter task title"
                      />
                    ) : (
                      <p className="text-lg font-medium">{task.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    {isEditing ? (
                      <textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter task description"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none"
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">
                        {task.description || 'No description provided'}
                      </p>
                    )}
                  </div>

                  {/* Project */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Project</Label>
                    <div className="flex items-center space-x-2 text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{project?.name || 'Unknown Project'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Status and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Status</Label>
                      {isEditing ? (
                        <select
                          value={editData.status || 'pending'}
                          onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Priority</Label>
                      {isEditing ? (
                        <select
                          value={editData.priority || 'medium'}
                          onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Progress</Label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editData.progress || 0}
                          onChange={(e) => setEditData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                          className="w-full"
                        />
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className="bg-neon-blue h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${editData.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className="bg-neon-blue h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estimated Hours */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Estimated Hours</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editData.estimated_hours || 0}
                        onChange={(e) => setEditData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
                        placeholder="e.g., 8.5"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{task.estimated_hours || 0}h</span>
                      </div>
                    )}
                  </div>

                  {/* Deadline */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Deadline</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editData.deadline || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, deadline: e.target.value }))}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline set'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assignees</Label>
                {assignees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {assignees.map((user) => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-lg border border-blue-300 dark:border-blue-700"
                      >
                        <User className="w-4 h-4" />
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs opacity-75">{user.department}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No assignees</p>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full border border-purple-300 dark:border-purple-700"
                      >
                        <Tag className="w-3 h-3" />
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Dependencies</Label>
                  <div className="flex flex-wrap gap-2">
                    {task.dependencies.map((depId, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs rounded-full border border-orange-300 dark:border-orange-700"
                      >
                        <Target className="w-3 h-3" />
                        Task {depId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(task.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 p-6 border-t">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
