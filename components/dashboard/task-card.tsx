"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Clock, User, Tag, Calendar, FileText, Trash2, Edit, Play, Pause, Square, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { showNotification } from '@/lib/notifications'

interface Task {
  id: string
  title: string
  description: string
  project: string
  duration: string
  assignedOn: string
  status: 'pending' | 'in-progress' | 'completed'
  deadline: string
  actualTime?: string
  notes?: string
  assignee: string
  priority: 'low' | 'medium' | 'high'
  estimatedHours?: number
  tags?: string[]
  dependencies?: string[]
  progress?: number // 0-100
  autoDelete?: {
    enabled: boolean
    duration: number // in hours
    createdAt?: string
  }
}

interface TaskCardProps {
  task: Task
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
}

export function TaskCard({ task, onDelete, onUpdate }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)



  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  const startTimer = () => {
    setIsTimerRunning(true)
    setStartTime(new Date())
    
    // Show notification when timer starts
    showNotification("Timer Started", `Timer started for "${task.title}"`)
    
    // Update task status to in-progress when timer starts
    if (task.status === 'pending') {
      onUpdate(task.id, { status: 'in-progress' })
    }
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    const totalTime = elapsedTime
    setElapsedTime(0)
    setStartTime(null)
    
    // Update task with actual time taken
    const hours = Math.floor(totalTime / 3600)
    const minutes = Math.floor((totalTime % 3600) / 60)
    const seconds = totalTime % 60
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    
    onUpdate(task.id, { actualTime: timeString })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStatusChange = (newStatus: Task['status']) => {
    onUpdate(task.id, { status: newStatus })
    setShowMenu(false)
    
    // Show notification for status change
    showNotification("Task Status Updated", `"${task.title}" is now ${newStatus}`)
    
    // Stop timer if task is completed
    if (newStatus === 'completed' && isTimerRunning) {
      stopTimer()
    }
  }

  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-sm line-clamp-2 mb-1">{task.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
        </div>
        
        <div className="relative ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
          
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-8 w-48 bg-popover border rounded-md shadow-lg z-10"
            >
              <div className="p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange('pending')
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                >
                  Mark as Pending
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange('in-progress')
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                >
                  Mark as In Progress
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange('completed')
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                >
                  Mark as Completed
                </button>
                <div className="border-t my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(task.id)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm flex items-center"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Timer Section */}
      <div className="mb-3 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Timer</span>
          </div>
          <span className="text-sm font-mono font-medium">
            {formatTime(elapsedTime)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isTimerRunning ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                startTimer()
              }}
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  pauseTimer()
                }}
              >
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  stopTimer()
                }}
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

             {/* Progress Bar */}
       {task.progress !== undefined && (
         <div className="mb-3">
           <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
             <span>Progress</span>
             <span>{task.progress}%</span>
           </div>
           <div className="w-full bg-muted rounded-full h-2">
             <div 
               className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full transition-all duration-300"
               style={{ width: `${task.progress}%` }}
             />
           </div>
         </div>
       )}

       {/* Tags */}
       <div className="flex flex-wrap gap-2 mb-3">
         <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
           {task.priority} priority
         </span>
         <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}>
           {task.status}
         </span>
         <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
           {task.project}
         </span>

         {/* Custom Tags */}
         {task.tags?.map(tag => (
           <span key={tag} className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
             {tag}
           </span>
         ))}
         
         {/* Auto-Delete Indicator */}
         {task.autoDelete?.enabled && (
           <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 flex items-center space-x-1">
             <Timer className="h-3 w-3" />
             <span>
               Auto-delete in {(() => {
                 if (!task.autoDelete?.createdAt) return task.autoDelete.duration;
                 const now = Date.now();
                 const createdAt = new Date(task.autoDelete.createdAt).getTime();
                 const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
                 const remainingHours = Math.max(0, Math.ceil(task.autoDelete.duration - hoursSinceCreation));
                 return remainingHours;
               })()}h
             </span>
           </span>
         )}
       </div>

      {/* Basic Info */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3" />
          <span>{task.assignee}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-3 w-3" />
          <span>{task.duration}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-3 w-3" />
          <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
            Due: {format(new Date(task.deadline), 'MMM dd')}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t"
        >
          <div className="space-y-3">
            {task.notes && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Notes</span>
                </div>
                <p className="text-xs text-muted-foreground">{task.notes}</p>
              </div>
            )}
            
            {task.actualTime && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Actual Time</span>
                </div>
                <p className="text-xs text-muted-foreground">{task.actualTime}</p>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Assigned: {format(new Date(task.assignedOn), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
