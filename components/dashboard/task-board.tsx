"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { TasksService, CreateTaskData } from '@/lib/tasks-service'
import { useUsers } from '@/hooks/use-users'
import { filterTasksByAssignee, formatAssigneeNames, getAssigneeInitials } from '@/lib/user-utils'

// Define our own Task interface to match the database schema
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
  assignees: string[] // Array of user IDs
  tags: string[]
  dependencies: string[]
  created_by: string
  created_at: string
  updated_at: string
  assigned_on?: string
  actual_time?: string
  notes?: string
}
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useNotificationTriggers } from '@/lib/notification-context'
import { notificationService } from '@/lib/notification-service'
import { CreateTaskModal } from './create-task-modal'
import { TaskPreviewModal } from './task-preview-modal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { List, Grid3X3, Plus, Play, Pause, Check, Trash2, Edit, Eye, X } from 'lucide-react'

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Task>>({})
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'columns' | 'list'>('columns') // New state for view toggle
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [activeTimers, setActiveTimers] = useState<Record<string, { 
    startTime: number; 
    elapsed: number; 
    isPaused: boolean; 
    pausedAt: number; 
    totalPausedTime: number;
  }>>({})
  
  const { user } = useAuth()
  const { toast } = useToast()
  const { users, isLoading: usersLoading, getUsersByIds } = useUsers()
  const { notifyTaskAssigned, notifyTaskCompleted, notifyDeadlineApproaching } = useNotificationTriggers()

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  // Load tasks from database
  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  // Update active timers
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(taskId => {
          if (updated[taskId] && !updated[taskId].isPaused) {
            updated[taskId].elapsed = Date.now() - updated[taskId].startTime - updated[taskId].totalPausedTime
          }
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      
      // Use direct Supabase call instead of TasksService
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      setTasks(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load tasks. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (taskData: any) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create tasks.',
        variant: 'destructive',
      })
      return
    }

    try {
      // Input validation
      if (!taskData.title || typeof taskData.title !== 'string' || taskData.title.trim().length === 0) {
        throw new Error('Task title is required')
      }

      if (taskData.title.length > 255) {
        throw new Error('Task title must be less than 255 characters')
      }

      if (taskData.description && taskData.description.length > 1000) {
        throw new Error('Task description must be less than 1000 characters')
      }

      if (!taskData.project_id) {
        throw new Error('Project selection is required')
      }

      // Validate status
      const validStatuses = ['pending', 'in-progress', 'completed']
      if (taskData.status && !validStatuses.includes(taskData.status)) {
        throw new Error('Invalid task status')
      }

      // Validate priority
      const validPriorities = ['low', 'medium', 'high']
      if (taskData.priority && !validPriorities.includes(taskData.priority)) {
        throw new Error('Invalid task priority')
      }

      // Use direct Supabase call with modal data
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title.trim(),
          description: taskData.description?.trim() || '',
          project_id: taskData.project_id,
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          progress: taskData.progress || 0,
          estimated_hours: taskData.estimatedHours || 0,
          deadline: taskData.deadline || null,
          assignees: taskData.assignees || [],
          tags: taskData.tags || [],
          dependencies: taskData.dependencies || [],
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          assigned_on: taskData.assignedOn || null,
          notes: taskData.notes || null
        })
         .select()
         .single()
        
      if (error) {
        throw error
      }

      // Update project task counts if task is associated with a project
      if (data.project_id) {
        await updateProjectTaskCounts(data.project_id)
      }

      // Trigger notifications for assigned users
      if (data.assignees && data.assignees.length > 0) {
        console.log('🔔 Triggering notifications for assigned users:', data.assignees)
        const assignedUsers = await getUsersByIds(data.assignees)

        for (const assignedUser of assignedUsers) {
          if (assignedUser.id !== user?.id) {
            console.log('📨 Sending notification to user:', assignedUser.id, assignedUser.name)

            // Create notification for the assigned user
            try {
              await notificationService.notifyTaskAssigned(
                assignedUser.id,
                data.title,
                user?.name || user?.email || 'Admin'
              )
              console.log('✅ Notification sent successfully to:', assignedUser.name)
            } catch (error) {
              console.error('❌ Failed to send notification to:', assignedUser.name, error)
            }
          }
        }
      }

      // Check for approaching deadline and trigger notification if needed
      if (data.deadline) {
        const deadlineDate = new Date(data.deadline)
        const now = new Date()
        const hoursUntilDeadline = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))

        if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 0) {
          await notifyDeadlineApproaching(data.title, hoursUntilDeadline)
        }
      }

      // Reload tasks from database
      await loadTasks()

      // Close modal
      setShowCreateModal(false)

      toast({
        title: 'Success',
        description: 'Task created successfully!',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<CreateTaskData>) => {
    try {
      // Input validation
      if (!taskId || typeof taskId !== 'string') {
        throw new Error('Invalid task ID')
      }

      // Validate progress value
      if (updates.progress !== undefined && (updates.progress < 0 || updates.progress > 100)) {
        throw new Error('Progress must be between 0 and 100')
      }

      // Validate status
      if (updates.status && !['pending', 'in-progress', 'completed'].includes(updates.status)) {
        throw new Error('Invalid task status')
      }

      // Validate priority
      if (updates.priority && !['low', 'medium', 'high'].includes(updates.priority)) {
        throw new Error('Invalid task priority')
      }

      // Check if task exists and validate status transitions
      const taskExists = tasks.find(task => task.id === taskId)
      if (!taskExists) {
        throw new Error('Task not found')
      }

      // Validate status transitions
      if (updates.status && taskExists.status !== updates.status) {
        const isValidTransition = validateStatusTransition(taskExists.status, updates.status)
        if (!isValidTransition) {
          throw new Error(`Invalid status transition from ${taskExists.status} to ${updates.status}`)
        }

        // Confirm reopening completed tasks
        if (taskExists.status === 'completed' && updates.status !== 'completed') {
          const confirmed = confirm(
            `Are you sure you want to reopen the completed task "${taskExists.title}"? This will change its status to ${updates.status}.`
          )
          if (!confirmed) {
            return // User cancelled the operation
          }
        }
      }

      // Prepare update data with lifecycle management
      const updateData = { ...updates }

      // Auto-set progress to 100% when completing a task
      if (updates.status === 'completed') {
        updateData.progress = 100
      }

      // Reset progress when moving back to pending from any other status
      if (updates.status === 'pending' && taskExists.status !== 'pending') {
        updateData.progress = 0
      }

      // When reopening completed tasks to in-progress, maintain current progress or set to reasonable value
      if (updates.status === 'in-progress' && taskExists.status === 'completed') {
        // Keep current progress if it's reasonable, otherwise set to 75%
        updateData.progress = (taskExists.progress && taskExists.progress < 100) ? taskExists.progress : 75
      }

      console.log(`🔄 Updating task ${taskId} with:`, updateData)

      // Use direct Supabase call instead of TasksService
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Supabase update error:', error)
        throw error
      }
      
      console.log(`✅ Task updated successfully:`, data)
      
      // Update project task counts if project changed or status changed
      const oldProjectId = taskExists.project_id
      const newProjectId = updateData.project_id || oldProjectId
      const statusChanged = updateData.status && updateData.status !== taskExists.status

      if (statusChanged || (updateData.project_id && updateData.project_id !== oldProjectId)) {
        // Update counts for old project if project changed
        if (oldProjectId && updateData.project_id && oldProjectId !== updateData.project_id) {
          await updateProjectTaskCounts(oldProjectId)
        }
        // Update counts for current project
        if (newProjectId) {
          await updateProjectTaskCounts(newProjectId)
        }
      }

      // Update local state immediately for better UX
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, ...updateData }
          : task
      ))

      toast({
        title: 'Success',
        description: 'Task updated successfully!',
      })
    } catch (error: any) {
      console.error('❌ Error in handleUpdateTask:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Validate status transitions
  const validateStatusTransition = (currentStatus: string, newStatus: string): boolean => {
    const validTransitions: Record<string, string[]> = {
      'pending': ['in-progress', 'completed'],
      'in-progress': ['pending', 'completed'],
      'completed': ['pending', 'in-progress'] // Allow reopening completed tasks to both pending and in-progress
    }

    return validTransitions[currentStatus]?.includes(newStatus) || currentStatus === newStatus
  }

  const handlePreviewTask = (task: Task) => {
    setSelectedTask(task)
    setShowPreviewModal(true)
  }

  // Helper function to update project task counts
  const updateProjectTaskCounts = async (projectId: string) => {
    if (!projectId) return

    try {
      // Get all tasks for this project
      const { data: projectTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId)

      if (tasksError) throw tasksError

      const totalTasks = projectTasks?.length || 0
      const completedTasks = projectTasks?.filter(task => task.status === 'completed').length || 0

      // Update project counts
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          taskscount: totalTasks,
          completedtasks: completedTasks,
          progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        })
        .eq('id', projectId)

      if (updateError) throw updateError

      console.log(`✅ Updated project ${projectId} task counts: ${completedTasks}/${totalTasks}`)
    } catch (error) {
      console.error('❌ Error updating project task counts:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id)
    setEditFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      progress: task.progress,
      assignees: task.assignees
    })
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditFormData({})
    setIsEditLoading(false)
  }

  const handleSaveEdit = async () => {
    if (!editingTaskId || !editFormData) return

    try {
      setIsEditLoading(true)
      await handleUpdateTask(editingTaskId, editFormData)
      setEditingTaskId(null)
      setEditFormData({})
    } catch (error) {
      // Error is already handled in handleUpdateTask
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Input validation
      if (!taskId || typeof taskId !== 'string') {
        throw new Error('Invalid task ID')
      }

      // Check if task exists
      const taskExists = tasks.find(task => task.id === taskId)
      if (!taskExists) {
        throw new Error('Task not found')
      }

      // Store project ID before deletion
      const projectId = taskExists.project_id

      // Use direct Supabase call instead of TasksService
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        throw error
      }

      // Update project task counts if task was associated with a project
      if (projectId) {
        await updateProjectTaskCounts(projectId)
      }

      // Update local state immediately for better UX
      setTasks(prev => prev.filter(task => task.id !== taskId))
      
      // Clear timer if exists
      setActiveTimers(prev => {
        const newTimers = { ...prev }
        delete newTimers[taskId]
        return newTimers
      })
      
      toast({
        title: 'Success',
        description: 'Task deleted successfully!',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete task. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Timer management functions
  const startTimer = (taskId: string) => {
    setActiveTimers(prev => ({
      ...prev,
      [taskId]: { 
        startTime: Date.now(), 
        elapsed: 0, 
        isPaused: false, 
        pausedAt: 0, 
        totalPausedTime: 0 
      }
    }))
  }

  const pauseTimer = (taskId: string) => {
    setActiveTimers(prev => {
      if (prev[taskId] && !prev[taskId].isPaused) {
        return {
          ...prev,
          [taskId]: {
            ...prev[taskId],
            isPaused: true,
            pausedAt: Date.now()
          }
        }
      }
      return prev
    })
  }

  const resumeTimer = (taskId: string) => {
    setActiveTimers(prev => {
      if (prev[taskId] && prev[taskId].isPaused) {
        const pauseDuration = Date.now() - prev[taskId].pausedAt
        return {
          ...prev,
          [taskId]: {
            ...prev[taskId],
            isPaused: false,
            totalPausedTime: prev[taskId].totalPausedTime + pauseDuration
          }
        }
      }
      return prev
    })
  }

  const stopTimer = (taskId: string) => {
    setActiveTimers(prev => {
      const newTimers = { ...prev }
      delete newTimers[taskId]
      return newTimers
    })
  }

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  // Drag & Drop handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    const activeTask = tasks.find(task => task.id === active.id)
    if (!activeTask) return
    
    // Get the target column from the drop zone
    let newStatus = activeTask.status
    
    // Check if dropping on a column drop zone
    const targetElement = over.id as string
    
    if (targetElement === 'pending') {
      newStatus = 'pending'
    } else if (targetElement === 'in-progress') {
      newStatus = 'in-progress'
    } else if (targetElement === 'completed') {
      newStatus = 'completed'
    } else {
      // If dropping on another task, get its status
      const overTask = tasks.find(task => task.id === over.id)
      if (overTask) {
        newStatus = overTask.status
      }
    }
    
    if (newStatus !== activeTask.status) {
      try {
        console.log(`🔄 Moving task "${activeTask.title}" from ${activeTask.status} to ${newStatus}`)
        
        // Update task status in database
        const updateData: any = {
          status: newStatus,
          updated_at: new Date().toISOString()
        }

        // Set progress to 100% when task is completed
        if (newStatus === 'completed') {
          updateData.progress = 100
        }

        const { error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', activeTask.id)
        
        if (error) {
          console.error('❌ Failed to update task status:', error)
          toast({
            title: 'Error',
            description: 'Failed to update task status.',
            variant: 'destructive',
          })
          return
        }
        
        // Update local state
        setTasks(prev => prev.map(task =>
          task.id === activeTask.id
            ? {
                ...task,
                status: newStatus,
                progress: newStatus === 'completed' ? 100 : task.progress
              }
            : task
        ))

        // Trigger notification for task completion
        if (newStatus === 'completed') {
          await notifyTaskCompleted(activeTask.title, user?.name || user?.email || 'Someone')
        }

        toast({
          title: 'Success',
          description: `Task moved to ${newStatus}`,
        })
      } catch (error) {
        console.error('❌ Error updating task status:', error)
        toast({
          title: 'Error',
          description: 'Failed to update task status.',
          variant: 'destructive',
        })
      }
    }
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Task Board</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your tasks with a visual Kanban board
            </p>
          </div>
          <div className="flex gap-2">
            {/* View Toggle Button */}
            <button
              onClick={() => setViewMode(viewMode === 'columns' ? 'list' : 'columns')}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              title={viewMode === 'columns' ? 'Switch to List View' : 'Switch to Column View'}
            >
              {viewMode === 'columns' ? (
                <>
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List View</span>
                </>
              ) : (
                <>
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Column View</span>
                </>
              )}
            </button>
            
            <button
              onClick={loadTasks}
              disabled={isLoading}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-neon-blue text-white px-4 py-2 rounded-lg hover:bg-neon-blue/90 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </button>
          </div>
        </div>
        
        {/* Task Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="glass-card-light dark:glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
              </div>
              <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="glass-card-light dark:glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{filterTasksByAssignee(tasks, selectedMember).filter(t => t.status === 'pending').length}</p>
              </div>
              <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="glass-card-light dark:glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">In Progress</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filterTasksByAssignee(tasks, selectedMember).filter(t => t.status === 'in-progress').length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="glass-card-light dark:glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{filterTasksByAssignee(tasks, selectedMember).filter(t => t.status === 'completed').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

             {/* Create Task Modal */}
       <CreateTaskModal
         isOpen={showCreateModal}
         onClose={() => setShowCreateModal(false)}
         onSubmit={handleCreateTask}
         existingTasks={tasks.map(task => ({
           id: task.id,
           title: task.title,
           status: task.status
         }))}
       />

       {/* Task Preview Modal */}
       <TaskPreviewModal
         isOpen={showPreviewModal}
         onClose={() => {
           setShowPreviewModal(false)
           setSelectedTask(null)
         }}
         task={selectedTask}
         onTaskUpdate={handleUpdateTask}
       />

      {/* Member Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="member-filter" className="text-sm font-medium">
            Filter by Member:
          </label>
          <select
            id="member-filter"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm min-w-[200px]"
            disabled={usersLoading}
          >
            <option value="all">All Members</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Display - Toggle between Columns and List */}
      {(() => {
        // Apply member filtering to tasks
        const filteredTasks = filterTasksByAssignee(tasks, selectedMember)

        return viewMode === 'list' ? (
        // List View - Optimized for admin tracking
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Task List View</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {user?.role === 'admin' ? 'Admin view: Track all team member tasks in detail' : 'List view: All your tasks in one place'}
            </p>
            
            {/* List View Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Task</th>
                    <th className="text-left p-3 font-medium">Assignee</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Priority</th>
                    <th className="text-left p-3 font-medium">Progress</th>
                    <th className="text-left p-3 font-medium">Deadline</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        {editingTaskId === task.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editFormData.title || ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Task title"
                              className="font-medium"
                            />
                            <Textarea
                              value={editFormData.description || ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Task description"
                              className="text-sm resize-none"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-foreground">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                                                                    <td className="p-3">
                          <div className="text-sm">
                            {task.assignees && task.assignees.length > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {formatAssigneeNames(getUsersByIds(task.assignees))}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </div>
                        </td>
                      <td className="p-3">
                        {editingTaskId === task.id ? (
                          <select
                            value={editFormData.status || task.status}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'in-progress' | 'completed' }))}
                            className="px-2 py-1 border border-input rounded-md bg-background text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' :
                            task.status === 'in-progress' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200'
                          }`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {editingTaskId === task.id ? (
                          <select
                            value={editFormData.priority || task.priority}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                            className="px-2 py-1 border border-input rounded-md bg-background text-sm"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' :
                            task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {editingTaskId === task.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editFormData.progress || task.progress}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                              className="w-16 h-2"
                            />
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={editFormData.progress || task.progress}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                              className="w-16 h-8 text-xs"
                            />
                            <span className="text-xs">%</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-neon-blue h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">{task.progress}%</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {editingTaskId === task.id ? (
                          <Input
                            type="date"
                            value={editFormData.deadline ? new Date(editFormData.deadline).toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, deadline: e.target.value }))}
                            className="text-sm"
                          />
                        ) : (
                          <div className="text-sm">
                            {task.deadline ? (
                              <span className={`${
                                new Date(task.deadline) < new Date() && task.status !== 'completed'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-muted-foreground'
                              }`}>
                                {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">No deadline</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          {editingTaskId === task.id ? (
                            <>
                              {/* Save Button */}
                              <button
                                onClick={handleSaveEdit}
                                disabled={isEditLoading}
                                className="p-1 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                                title="Save Changes"
                              >
                                {isEditLoading ? (
                                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>

                              {/* Cancel Button */}
                              <button
                                onClick={handleCancelEdit}
                                disabled={isEditLoading}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                                title="Cancel Edit"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* View Button */}
                              <button
                                onClick={() => {
                                  setSelectedTask(task)
                                  setShowPreviewModal(true)
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditTask(task)}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                title="Edit Task"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {/* Timer Controls */}
                          {task.status === 'in-progress' && activeTimers[task.id] && (
                            <>
                              {activeTimers[task.id].isPaused ? (
                                <button
                                  onClick={() => resumeTimer(task.id)}
                                  className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                  title="Resume Timer"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  onClick={() => pauseTimer(task.id)}
                                  className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                                  title="Pause Timer"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                              
                              <button
                                onClick={() => stopTimer(task.id)}
                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                title="Stop Timer"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </>
                          )}
                          
                          {/* Start Timer Button */}
                          {task.status === 'pending' && !activeTimers[task.id] && (
                            <button
                              onClick={() => startTimer(task.id)}
                              className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                              title="Start Timer"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Complete Button */}
                          {task.status !== 'completed' && (
                            <button
                              onClick={async () => {
                                try {
                                  const timer = activeTimers[task.id]
                                  if (timer) {
                                    stopTimer(task.id)
                                  }
                                  await handleUpdateTask(task.id, { 
                                    status: 'completed',
                                    progress: 100
                                  })
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to complete task. Please try again.',
                                    variant: 'destructive',
                                  })
                                }
                              }}
                              className="p-1 text-green-600 hover:text-green-700 transition-colors"
                              title="Complete Task"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete Button - Admin only */}
                          {user?.role === 'admin' && (
                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                                  await handleDeleteTask(task.id)
                                }
                              }}
                              className="p-1 text-red-600 hover:text-red-700 transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // Column View - Original Kanban Board
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Pending Column */}
          <DroppableColumn
            status="pending"
            title="Pending"
            color="gray"
            taskCount={filteredTasks.filter(task => task.status === 'pending').length}
          >
            {filteredTasks.filter(task => task.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pending tasks
              </div>
            ) : (
              <SortableContext
                items={filteredTasks.filter(task => task.status === 'pending').map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                                 {filteredTasks.filter(task => task.status === 'pending').map((task) => (
                   <SortableTaskCard
                     key={task.id}
                     task={task}
                     onUpdate={handleUpdateTask}
                     onDelete={handleDeleteTask}
                     onPreview={handlePreviewTask}
                     onStartTimer={startTimer}
                     onPauseTimer={pauseTimer}
                     onResumeTimer={resumeTimer}
                     onStopTimer={stopTimer}
                     activeTimers={activeTimers}
                     formatTime={formatTime}
                     toast={toast}
                     allTasks={tasks}
                     getUsersByIds={getUsersByIds}
                   />
                 ))}
              </SortableContext>
            )}
          </DroppableColumn>

          {/* In Progress Column */}
          <DroppableColumn
            status="in-progress"
            title="In Progress"
            color="blue"
            taskCount={filteredTasks.filter(task => task.status === 'in-progress').length}
          >
            {filteredTasks.filter(task => task.status === 'in-progress').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tasks in progress
              </div>
            ) : (
              <SortableContext
                items={filteredTasks.filter(task => task.status === 'in-progress').map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                                 {filteredTasks.filter(task => task.status === 'in-progress').map((task) => (
                   <SortableTaskCard
                     key={task.id}
                     task={task}
                     onUpdate={handleUpdateTask}
                     onDelete={handleDeleteTask}
                     onPreview={handlePreviewTask}
                     onStartTimer={startTimer}
                     onPauseTimer={pauseTimer}
                     onResumeTimer={resumeTimer}
                     onStopTimer={stopTimer}
                     activeTimers={activeTimers}
                     formatTime={formatTime}
                     toast={toast}
                     allTasks={tasks}
                     getUsersByIds={getUsersByIds}
                   />
                 ))}
              </SortableContext>
            )}
          </DroppableColumn>

          {/* Completed Column */}
          <DroppableColumn
            status="completed"
            title="Completed"
            color="green"
            taskCount={filteredTasks.filter(task => task.status === 'completed').length}
          >
            {filteredTasks.filter(task => task.status === 'completed').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No completed tasks
              </div>
            ) : (
              <SortableContext
                items={filteredTasks.filter(task => task.status === 'completed').map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                                 {filteredTasks.filter(task => task.status === 'completed').map((task) => (
                   <SortableTaskCard
                     key={task.id}
                     task={task}
                     onUpdate={handleUpdateTask}
                     onDelete={handleDeleteTask}
                     onPreview={handlePreviewTask}
                     onStartTimer={startTimer}
                     onPauseTimer={pauseTimer}
                     onResumeTimer={resumeTimer}
                     onStopTimer={stopTimer}
                     activeTimers={activeTimers}
                     formatTime={formatTime}
                     toast={toast}
                     allTasks={tasks}
                     getUsersByIds={getUsersByIds}
                   />
                 ))}
              </SortableContext>
            )}
          </DroppableColumn>
        </div>
      </DndContext>
      )
      })()}
    </div>
  )
}

// Droppable Column Component
interface DroppableColumnProps {
  status: string
  title: string
  color: 'gray' | 'blue' | 'green'
  taskCount: number
  children: React.ReactNode
}

function DroppableColumn({ status, title, color, taskCount, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const colorClasses = {
    gray: {
      dot: 'bg-gray-500',
      badge: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
      glow: 'ring-gray-400 bg-gray-50/50 dark:bg-gray-800/50'
    },
    blue: {
      dot: 'bg-blue-500',
      badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      glow: 'ring-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
    },
    green: {
      dot: 'bg-green-500',
      badge: 'bg-green-500/20 text-green-600 dark:text-green-400',
      glow: 'ring-green-400 bg-green-50/50 dark:bg-green-900/20'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <div className={`w-3 h-3 ${colorClasses[color].dot} rounded-full mr-2 transition-all duration-300 ${
            isOver ? 'animate-pulse scale-125' : ''
          }`}></div>
          {title}
        </h3>
        <span className={`${colorClasses[color].badge} px-2 py-1 rounded text-xs transition-all duration-300 ${
          isOver ? 'scale-110 font-bold' : ''
        }`}>
          {taskCount}
        </span>
      </div>
      <div 
        ref={setNodeRef}
        className={`min-h-[400px] column-light dark:column-dark rounded-lg p-4 space-y-3 transition-all duration-300 ease-in-out transform ${
          isOver 
            ? `ring-2 ${colorClasses[color].glow} scale-[1.02] shadow-lg border-2 border-dashed border-current bg-opacity-80` 
            : 'hover:shadow-md'
        }`}
        data-column={status}
      >
        {children}
      </div>
    </div>
  )
}

// Sortable Task Card Component for Kanban View
interface SortableTaskCardProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<CreateTaskData>) => void
  onDelete: (taskId: string) => void
  onPreview: (task: Task) => void
  onStartTimer: (taskId: string) => void
  onPauseTimer: (taskId: string) => void
  onResumeTimer: (taskId: string) => void
  onStopTimer: (taskId: string) => void
  activeTimers: Record<string, {
    startTime: number;
    elapsed: number;
    isPaused: boolean;
    pausedAt: number;
    totalPausedTime: number;
  }>
  formatTime: (ms: number) => string
  toast: any
  allTasks: Task[]
  getUsersByIds: (ids: string[]) => any[]
}

function SortableTaskCard({
  task,
  onUpdate,
  onDelete,
  onPreview,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  activeTimers,
  formatTime,
  toast,
  allTasks,
  getUsersByIds
}: SortableTaskCardProps) {
  const { user } = useAuth()
  const [assignedUser, setAssignedUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])

  // Fetch users for assignment display
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, avatar')
        
        if (error) throw error
        setUsers(data || [])
        
                 // Find assigned users
         if (task.assignees && task.assignees.length > 0) {
           const assigned = data?.find(u => u.id === task.assignees[0]) // Show first assignee for now
           setAssignedUser(assigned)
         }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    
         fetchUsers()
   }, [task.assignees])

  // Calculate time remaining until deadline
  const getTimeRemaining = () => {
    if (!task.deadline) return null

    // Don't show overdue warnings for completed tasks
    if (task.status === 'completed') {
      return { text: 'Completed', isOverdue: false, isCompleted: true }
    }

    const now = new Date()
    const deadline = new Date(task.deadline)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true }
    if (diffDays === 0) return { text: 'Due today', isOverdue: false }
    if (diffDays === 1) return { text: '1 day left', isOverdue: false }
    return { text: `${diffDays} days left`, isOverdue: false }
  }

  const timeRemaining = getTimeRemaining()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isTimerActive = activeTimers[task.id]
  const canStartTimer = task.status === 'pending'
  const canComplete = task.status === 'in-progress'
  const canReopen = task.status === 'completed'

  // Helper function to prevent drag on interactive elements
  const preventDrag = (e: React.PointerEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative p-5 rounded-xl group transition-all duration-300 backdrop-blur-sm cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'shadow-2xl scale-105 rotate-2 border-neon-blue/70 z-50 ring-2 ring-neon-blue/50'
          : 'hover:shadow-xl hover:scale-[1.02] hover:border-neon-blue/50'
      } task-card-light dark:task-card-dark ${
        task.priority === 'high' ? 'priority-high' :
        task.priority === 'medium' ? 'priority-medium' :
        'priority-low'
      }`}
    >
      {/* Drag Handle Visual Indicator */}
      <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="w-4 h-4 text-gray-400 dark:text-gray-500">
          ⋮⋮
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        {/* Task Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base leading-tight flex-1 min-w-0 truncate">{task.title}</h4>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {isTimerActive && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
            <div className="w-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
        
        {/* Task Description */}
        {task.description && (
          <p className="text-subtle text-xs md:text-sm leading-relaxed line-clamp-2 surface-2 p-2 md:p-3 rounded-lg border-subtle border">
            {task.description}
          </p>
        )}
        
        {/* Task Details Section */}
        <div className="space-y-3">
                              {/* Assigned Users */}
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                  {getAssigneeInitials(getUsersByIds(task.assignees))}
                </div>
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {formatAssigneeNames(getUsersByIds(task.assignees))}
                </span>
              </div>
            )}
          
          {/* Time Estimation and Actual Time */}
          <div className="flex items-center justify-between text-sm">
            {task.estimated_hours && (
              <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Est: {task.estimated_hours}h</span>
              </div>
            )}
                         {/* Actual time would be calculated from timer data */}
          </div>
          
          {/* Deadline and Time Remaining */}
          {task.deadline && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
              </div>
              {timeRemaining && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  timeRemaining.isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : timeRemaining.isOverdue
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                }`}>
                  {timeRemaining.text}
                </span>
              )}
            </div>
          )}
          
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM7 7a1 1 0 000 2h6a1 1 0 100-2H7zM7 11a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 text-xs rounded-full border border-purple-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
                <span>Dependencies</span>
              </div>
              <div className="flex flex-wrap gap-1">
                 {task.dependencies.map((depId, index) => {
                   const depTask = allTasks.find(t => t.id === depId)
                   return depTask ? (
                     <span 
                       key={index}
                       className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full border border-orange-300 dark:border-orange-700"
                     >
                       📋 {depTask.title}
                     </span>
                   ) : null
                 })}
               </div>
             </div>
           )}
        </div>
        
        {/* Timer Display */}
        {isTimerActive && (
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/30 rounded-lg px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">Active Timer</span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-mono text-lg font-bold">
                {formatTime(activeTimers[task.id].elapsed)}
              </span>
            </div>
          </div>
        )}
        
        {/* Priority Badge and Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1 ${
              task.priority === 'high' ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700 dark:text-red-400 border border-red-500/40' :
              task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/40' :
              'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400 border border-green-500/40'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                task.priority === 'high' ? 'bg-red-500' :
                task.priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}></div>
              <span>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
            </span>
            
            {/* Status Badge */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'pending' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400' :
              task.status === 'in-progress' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' :
              'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
          </div>
          
                     {/* Progress Bar */}
           <div className="flex items-center space-x-2">
             <div className="w-24 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
               <div 
                 className={`h-full rounded-full transition-all duration-500 ease-out ${
                   task.progress === 100 
                     ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm' 
                     : task.progress >= 75 
                     ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                     : task.progress >= 50 
                     ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                     : 'bg-gradient-to-r from-red-500 to-pink-500'
                 }`}
                 style={{ width: `${task.progress || 0}%` }}
               />
               {task.progress === 100 && (
                 <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
               )}
               {/* Progress indicator dots */}
               {task.progress > 0 && task.progress < 100 && (
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-1 h-1 bg-white/80 rounded-full shadow-sm"></div>
                 </div>
               )}
             </div>
             <span className={`text-xs font-medium min-w-[2.5rem] ${
               task.progress === 100 
                 ? 'text-green-600 dark:text-green-400 font-bold' 
                 : task.progress >= 75 
                 ? 'text-blue-600 dark:text-blue-400'
                 : task.progress >= 50 
                 ? 'text-yellow-600 dark:text-yellow-400'
                 : 'text-red-600 dark:text-red-400'
             }`}>
               {task.progress || 0}%
             </span>
           </div>
        </div>
        
        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700 opacity-100 transition-all duration-300"
          onPointerDown={preventDrag}
        >
          <div className="flex items-center flex-wrap gap-1 sm:gap-2">
            {/* Preview Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPreview(task)
              }}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              title="View Task Details"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </button>

                         {/* Start Timer Button */}
             {canStartTimer && (
               <button
                 onClick={async (e) => {
                   e.stopPropagation()
                   try {
                     console.log(`🚀 Starting task: ${task.id}`)
                     
                     // Start the timer first
                     onStartTimer(task.id)
                     
                     // Update task status to in-progress
                     await onUpdate(task.id, { 
                       status: 'in-progress'
                     })
                     
                     console.log(`✅ Task ${task.id} started successfully`)
                   } catch (error) {
                     console.error('❌ Error starting task:', error)
                     toast({
                       title: 'Error',
                       description: 'Failed to start task. Please try again.',
                       variant: 'destructive',
                     })
                   }
                 }}
                 className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
               >
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                 </svg>
                 <span>Start Task</span>
               </button>
             )}
            
            {/* Timer Control Buttons */}
            {isTimerActive && (
              <div className="flex items-center space-x-2">
                {/* Pause/Resume Button */}
                {!activeTimers[task.id]?.isPaused ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPauseTimer(task.id)
                    }}
                    className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onResumeTimer(task.id)
                    }}
                    className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span>Resume</span>
                  </button>
                )}
                
                {/* Stop Timer Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onStopTimer(task.id)
                  }}
                  className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  <span>Stop</span>
                </button>
              </div>
            )}
            
                         {/* Complete Button */}
             {canComplete && (
               <button
                 onClick={async (e) => {
                   e.stopPropagation()
                   try {
                     console.log(`✅ Completing task: ${task.id}`)
                     
                                           // Stop the timer
                      const timer = activeTimers[task.id]
                      
                      if (timer) {
                        onStopTimer(task.id)
                      }
                     
                     // Update task status to completed with actual time and 100% progress
                     await onUpdate(task.id, { 
                       status: 'completed',
                       progress: 100
                     })
                     
                     console.log(`✅ Task ${task.id} completed successfully`)
                   } catch (error) {
                     console.error('❌ Error completing task:', error)
                     toast({
                       title: 'Error',
                       description: 'Failed to complete task. Please try again.',
                       variant: 'destructive',
                     })
                   }
                 }}
                 className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
               >
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                 </svg>
                 <span>Complete Task</span>
               </button>
             )}
            
                         {/* Progress Update Button */}
             {task.status === 'in-progress' && (
               <button
                 onClick={async (e) => {
                   e.stopPropagation()
                   const newProgress = Math.min(task.progress + 25, 100)
                   await onUpdate(task.id, { progress: newProgress })
                 }}
                 className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
               >
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l2.293 2.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
                 </svg>
                 <span>+25%</span>
               </button>
             )}
             
             {/* Reopen Button */}
             {canReopen && (
               <button
                 onClick={(e) => {
                   e.stopPropagation()
                   onUpdate(task.id, { status: 'pending' })
                 }}
                 className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
               >
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                 </svg>
                 <span>Reopen</span>
               </button>
             )}
          </div>
          
          {/* Delete Button - Admin only */}
          {user?.role === 'admin' && (
            <button
              onClick={async (e) => {
                e.stopPropagation()
                if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                  await onDelete(task.id)
                }
              }}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}