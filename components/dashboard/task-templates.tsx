"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Copy, Edit, Trash2, Save, X, FileText, Clock, User, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TaskTemplate {
  id: string
  name: string
  description: string
  project: string
  duration: string
  priority: 'low' | 'medium' | 'high'
  estimatedHours: number
  tags: string[]
  notes: string
  assignee: string
}

interface TaskTemplatesProps {
  templates: TaskTemplate[]
  onSaveTemplate: (template: Omit<TaskTemplate, 'id'>) => void
  onDeleteTemplate: (id: string) => void
  onUseTemplate: (template: TaskTemplate) => void
  onClose: () => void
}

export function TaskTemplates({ 
  templates, 
  onSaveTemplate, 
  onDeleteTemplate, 
  onUseTemplate, 
  onClose 
}: TaskTemplatesProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<TaskTemplate, 'id'>>({
    name: '',
    description: '',
    project: '',
    duration: '',
    priority: 'medium',
    estimatedHours: 0,
    tags: [],
    notes: '',
    assignee: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.project) {
      onSaveTemplate(formData)
      setFormData({
        name: '',
        description: '',
        project: '',
        duration: '',
        priority: 'medium',
        estimatedHours: 0,
        tags: [],
        notes: '',
        assignee: ''
      })
      setIsCreating(false)
      setEditingId(null)
    }
  }

  const handleEdit = (template: TaskTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      project: template.project,
      duration: template.duration,
      priority: template.priority,
      estimatedHours: template.estimatedHours,
      tags: template.tags,
      notes: template.notes,
      assignee: template.assignee
    })
    setEditingId(template.id)
    setIsCreating(true)
  }

  const handleChange = (field: keyof typeof formData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-background border rounded-lg shadow-xl p-6 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Task Templates</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreating(true)} variant="neon">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Saved Templates</h3>
          {templates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No templates yet. Create your first template to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-muted/50 rounded-lg p-4 border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUseTemplate(template)}
                        title="Use Template"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(template)}
                        title="Edit Template"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteTemplate(template.id)}
                        title="Delete Template"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>{template.project}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{template.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{template.assignee || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{template.estimatedHours}h</span>
                    </div>
                  </div>

                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Template Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {isCreating ? (editingId ? 'Edit Template' : 'Create Template') : 'Template Details'}
          </h3>
          
          {isCreating ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Bug Fix Template"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => handleChange('project', e.target.value)}
                    placeholder="e.g., Frontend Development"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Template description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Est. Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => handleChange('estimatedHours', parseFloat(e.target.value) || 0)}
                    placeholder="8.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Default Assignee</Label>
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => handleChange('assignee', e.target.value)}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    handleChange('tags', tags)
                  }}
                  placeholder="bug, frontend, urgent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Default Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Default notes for this template"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button type="submit" variant="neon">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update Template' : 'Save Template'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingId(null)
                    setFormData({
                      name: '',
                      description: '',
                      project: '',
                      duration: '',
                      priority: 'medium',
                      estimatedHours: 0,
                      tags: [],
                      notes: '',
                      assignee: ''
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "New Template" to create your first template</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
