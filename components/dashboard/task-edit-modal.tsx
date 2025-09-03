"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Users, Tag, Link, Trash2, Plus, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee_id?: string
  assignee?: string
  assignees?: string[]
  project_id?: string
  deadline?: string
  assigned_on?: string
  actual_time?: string
  estimated_hours?: number
  progress: number
  tags?: string[]
  dependencies?: string[]
  auto_delete?: any
  created_by?: string
  created_at: string
  updated_at?: string
  notes?: string
}

interface User {
  id: string
  name: string
  email: string
}

interface TaskEditModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: string, updates: Partial<Task>) => void
  users: User[]
  allTasks: Task[]
}

export function TaskEditModal({ task, isOpen, onClose, onSave, users, allTasks }: TaskEditModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Task>>({})
  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee_id,
        assignees: task.assignees || [],
        deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
        estimated_hours: task.estimated_hours || 0,
        progress: task.progress || 0,
        tags: task.tags || [],
        dependencies: task.dependencies || [],
        notes: task.notes || ''
      })
    }
  }, [task])

  const handleSave = async () => {
    if (!task || !formData.title?.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const updates = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        updated_at: new Date().toISOString()
      }

      await onSave(task.id, updates)
      onClose()
      
      toast({
        title: "Success",
        description: "Task updated successfully"
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const toggleAssignee = (userId: string) => {
    setFormData(prev => {
      const currentAssignees = prev.assignees || []
      const isAssigned = currentAssignees.includes(userId)
      
      return {
        ...prev,
        assignees: isAssigned 
          ? currentAssignees.filter(id => id !== userId)
          : [...currentAssignees, userId],
        assignee_id: isAssigned ? undefined : userId // Set primary assignee
      }
    })
  }

  const toggleDependency = (taskId: string) => {
    setFormData(prev => {
      const currentDeps = prev.dependencies || []
      const hasDep = currentDeps.includes(taskId)
      
      return {
        ...prev,
        dependencies: hasDep 
          ? currentDeps.filter(id => id !== taskId)
          : [...currentDeps, taskId]
      }
    })
  }

  if (!task) return null

  const availableTasks = allTasks.filter(t => t.id !== task.id && t.status !== 'completed')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimated_hours || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>

          {/* Right Column - Assignments & Dependencies */}
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assignees
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.assignees?.includes(user.id) || false}
                      onCheckedChange={() => toggleAssignee(user.id)}
                    />
                    <span className="text-sm">{user.name}</span>
                    {formData.assignee_id === user.id && (
                      <Badge variant="secondary" className="text-xs">Primary</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" size="sm" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Dependencies
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableTasks.map(depTask => (
                  <div key={depTask.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.dependencies?.includes(depTask.id) || false}
                      onCheckedChange={() => toggleDependency(depTask.id)}
                    />
                    <span className="text-sm truncate">{depTask.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
