"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { TasksService, Task, CreateTaskData } from '@/lib/tasks-service'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { CreateTaskModal } from './create-task-modal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTimers, setActiveTimers] = useState<Record<string, { startTime: number; elapsed: number }>>({})
  
  const { user } = useAuth()
  const { toast } = useToast()

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
          if (updated[taskId]) {
            updated[taskId].elapsed = Date.now() - updated[taskId].startTime
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
      console.log('🔄 Loading tasks from database...')
      console.log('🔍 Current user:', user)
      
      // Use direct Supabase call instead of TasksService
      console.log('🔄 Using direct Supabase query...')
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('🔍 Direct Supabase query result:', { data, error })
      
      if (error) {
        console.error('❌ Supabase query error:', error)
        throw error
      }
      
      console.log('✅ Tasks loaded directly from Supabase:', data)
      console.log('📊 Tasks count:', data?.length || 0)
      
      setTasks(data || [])
    } catch (error: any) {
      console.error('❌ Failed to load tasks:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
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
      console.log('🔄 Creating task from modal:', taskData, 'for user:', user.id)
      
      // Use direct Supabase call with modal data
      console.log('🔄 Using direct Supabase insertion...')
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description || '',
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          progress: 0,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
        
      if (error) {
        console.error('❌ Direct Supabase insertion failed:', error)
        throw error
      }
      
      console.log('✅ Direct Supabase insertion successful:', data)
      
      // Reload tasks from database
      await loadTasks()
      
      // Close modal
      setShowCreateModal(false)
      
      toast({
        title: 'Success',
        description: 'Task created successfully!',
      })
    } catch (error: any) {
      console.error('❌ Failed to create task:', error)
      toast({
        title: 'Error',
        description: `Failed to create task: ${error.message}`,
        variant: 'destructive',
      })
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<CreateTaskData>) => {
    try {
      console.log('🔄 Updating task:', taskId, 'with:', updates)
      
      // Use direct Supabase call instead of TasksService
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Failed to update task:', error)
        throw error
      }
      
      console.log('✅ Task updated successfully:', data)
      
      // Update local state immediately for better UX
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
          : task
      ))
      
      toast({
        title: 'Success',
        description: 'Task updated successfully!',
      })
    } catch (error) {
      console.error('❌ Failed to update task:', error)
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      console.log('🔄 Deleting task:', taskId)
      
      // Use direct Supabase call instead of TasksService
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) {
        console.error('❌ Failed to delete task:', error)
        throw error
      }
      
      console.log('✅ Task deleted successfully')
      
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
    } catch (error) {
      console.error('❌ Failed to delete task:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Timer management functions
  const startTimer = (taskId: string) => {
    console.log('⏱️ Starting timer for task:', taskId)
    setActiveTimers(prev => ({
      ...prev,
      [taskId]: { startTime: Date.now(), elapsed: 0 }
    }))
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
    
    // Check if dropping on a column drop zone by looking at the parent container
    const targetElement = over.id as string
    
    if (targetElement === 'pending' || targetElement === 'pending-column') {
      newStatus = 'pending'
    } else if (targetElement === 'in-progress' || targetElement === 'in-progress-column') {
      newStatus = 'in-progress'
    } else if (targetElement === 'completed' || targetElement === 'completed-column') {
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
        const { error } = await supabase
          .from('tasks')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
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
            ? { ...task, status: newStatus }
            : task
        ))
        
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{tasks.filter(t => t.status === 'pending').length}</p>
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
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tasks.filter(t => t.status === 'in-progress').length}</p>
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
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{tasks.filter(t => t.status === 'completed').length}</p>
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

      {/* Kanban Board - Three Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                Pending
              </h3>
              <span className="bg-gray-500/20 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs">
                {tasks.filter(task => task.status === 'pending').length}
              </span>
            </div>
                         <div 
               id="pending-column"
               className="min-h-[400px] column-light dark:column-dark rounded-lg p-4 space-y-3 drop-zone"
               data-column="pending"
             >
              {tasks.filter(task => task.status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No pending tasks
                </div>
              ) : (
                <SortableContext
                  items={tasks.filter(task => task.status === 'pending').map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                                     {tasks.filter(task => task.status === 'pending').map((task) => (
                     <SortableTaskCard 
                       key={task.id} 
                       task={task} 
                       onUpdate={handleUpdateTask} 
                       onDelete={handleDeleteTask}
                       onStartTimer={startTimer}
                       onStopTimer={stopTimer}
                       activeTimers={activeTimers}
                       formatTime={formatTime}
                     />
                   ))}
                </SortableContext>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                In Progress
              </h3>
              <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs">
                {tasks.filter(task => task.status === 'in-progress').length}
              </span>
            </div>
                         <div 
               id="in-progress-column"
               className="min-h-[400px] column-light dark:column-dark rounded-lg p-4 space-y-3 drop-zone"
               data-column="in-progress"
             >
              {tasks.filter(task => task.status === 'in-progress').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No tasks in progress
                </div>
              ) : (
                <SortableContext
                  items={tasks.filter(task => task.status === 'in-progress').map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                                     {tasks.filter(task => task.status === 'in-progress').map((task) => (
                     <SortableTaskCard 
                       key={task.id} 
                       task={task} 
                       onUpdate={handleUpdateTask} 
                       onDelete={handleDeleteTask}
                       onStartTimer={startTimer}
                       onStopTimer={stopTimer}
                       activeTimers={activeTimers}
                       formatTime={formatTime}
                     />
                   ))}
                </SortableContext>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Completed
              </h3>
              <span className="bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs">
                {tasks.filter(task => task.status === 'completed').length}
              </span>
            </div>
                         <div 
               id="completed-column"
               className="min-h-[400px] column-light dark:column-dark rounded-lg p-4 space-y-3 drop-zone"
               data-column="completed"
             >
              {tasks.filter(task => task.status === 'completed').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No completed tasks
                </div>
              ) : (
                <SortableContext
                  items={tasks.filter(task => task.status === 'completed').map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                                     {tasks.filter(task => task.status === 'completed').map((task) => (
                     <SortableTaskCard 
                       key={task.id} 
                       task={task} 
                       onUpdate={handleUpdateTask} 
                       onDelete={handleDeleteTask}
                       onStartTimer={startTimer}
                       onStopTimer={stopTimer}
                       activeTimers={activeTimers}
                       formatTime={formatTime}
                     />
                   ))}
                </SortableContext>
              )}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  )
}

// Sortable Task Card Component for Kanban View
interface SortableTaskCardProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<CreateTaskData>) => void
  onDelete: (taskId: string) => void
  onStartTimer: (taskId: string) => void
  onStopTimer: (taskId: string) => void
  activeTimers: Record<string, { startTime: number; elapsed: number }>
  formatTime: (ms: number) => string
}

function SortableTaskCard({ 
  task, 
  onUpdate, 
  onDelete, 
  onStartTimer, 
  onStopTimer, 
  activeTimers, 
  formatTime 
}: SortableTaskCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card-light dark:task-card-dark p-4 rounded-lg border cursor-grab active:cursor-grabbing group transition-all hover:shadow-lg"
    >
      <div className="space-y-3">
        {/* Task Title */}
        <h4 className="font-medium text-foreground dark:text-white text-sm leading-tight">{task.title}</h4>
        
        {/* Task Description */}
        {task.description && (
          <p className="text-muted-foreground dark:text-gray-300 text-xs leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}
        
        {/* Timer Display */}
        {isTimerActive && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-medium">⏱️ Timer</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">
                {formatTime(activeTimers[task.id].elapsed)}
              </span>
            </div>
          </div>
        )}
        
        {/* Priority Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            task.priority === 'high' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' :
            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30' :
            'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
          }`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neon-blue rounded-full transition-all"
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground dark:text-gray-400">{task.progress || 0}%</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-2">
                         {/* Start Timer Button */}
             {canStartTimer && (
               <button
                 onClick={async () => {
                   console.log('🚀 Starting task:', task.id)
                   onStartTimer(task.id)
                   await onUpdate(task.id, { status: 'in-progress' })
                 }}
                 className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs font-medium"
               >
                 ▶️ Start
               </button>
             )}
            
            {/* Stop Timer Button */}
            {isTimerActive && (
              <button
                onClick={() => onStopTimer(task.id)}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-xs font-medium"
              >
                ⏹️ Stop
              </button>
            )}
            
            {/* Complete Button */}
            {canComplete && (
              <button
                onClick={() => {
                  onStopTimer(task.id)
                  onUpdate(task.id, { status: 'completed' })
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium"
              >
                ✅ Complete
              </button>
            )}
            
            {/* Reopen Button */}
            {canReopen && (
              <button
                onClick={() => onUpdate(task.id, { status: 'pending' })}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-medium"
              >
                🔄 Reopen
              </button>
            )}
          </div>
          
                     {/* Delete Button */}
           <button
             onClick={async () => {
               if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                 await onDelete(task.id)
               }
             }}
             className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xs font-medium"
           >
             🗑️ Delete
           </button>
        </div>
      </div>
    </div>
  )
}