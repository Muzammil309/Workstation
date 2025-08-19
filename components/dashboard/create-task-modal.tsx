"use client"

/**
 * CREATE TASK MODAL
 * 
 * IMPORTANT: Auto-delete is completely OPTIONAL
 * - By default, tasks are PERMANENT and will never be deleted automatically
 * - Users must explicitly check the auto-delete checkbox to enable this feature
 * - This ensures no accidental task deletion
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Task {
  title: string
  description: string
  project: string
  duration: string
  status: 'pending' | 'in-progress' | 'completed'
  deadline: string
  notes: string
  assignee: string
  priority: 'low' | 'medium' | 'high'
  dependencies?: string[]
  estimatedHours?: number
  tags?: string[]
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
    project: '',
    duration: '',
    assignedOn: new Date().toISOString().split('T')[0],
    status: 'pending',
    deadline: '',
    notes: '',
    assignee: '',
    priority: 'medium',
    estimatedHours: 0,
    tags: [],
    dependencies: [],
    autoDelete: {
      enabled: false,
      duration: 24
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.project && formData.deadline) {
      onSubmit(formData)
      setFormData({
        title: '',
        description: '',
        project: '',
        duration: '',
        assignedOn: new Date().toISOString().split('T')[0],
        status: 'pending',
        deadline: '',
        notes: '',
        assignee: '',
        priority: 'medium'
      })
    }
  }

  const handleChange = (field: keyof Task, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => handleChange('project', e.target.value)}
                    placeholder="Enter project name"
                    required
                  />
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
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    value={formData.assignee}
                    onChange={(e) => handleChange('assignee', e.target.value)}
                    placeholder="Enter assignee name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    placeholder="e.g., 4 hours"
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

               {/* Estimated Hours */}
               <div className="space-y-2">
                 <Label htmlFor="estimatedHours">Estimated Hours</Label>
                 <Input
                   id="estimatedHours"
                   type="number"
                   min="0"
                   step="0.5"
                   value={formData.estimatedHours || 0}
                   onChange={(e) => handleChange('estimatedHours', e.target.value)}
                   placeholder="e.g., 8.5"
                   className="bg-transparent border-white/20 text-white placeholder:text-gray-400 focus:border-neon-blue focus:ring-neon-blue/20"
                 />
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
                   className="bg-transparent border-white/20 text-white placeholder:text-gray-400 focus:border-neon-blue focus:ring-neon-blue/20"
                 />
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
                 <p className="text-xs text-gray-400">Hold Ctrl/Cmd to select multiple dependencies</p>
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
