"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, Target, Plus, ChevronLeft, ChevronRight, Filter, CalendarDays, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

interface Task {
  id: string
  title: string
  description: string
  deadline: string
  assignee: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
  estimated_hours?: number
  progress?: number
  tags?: string[]
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  type: 'task' | 'meeting' | 'deadline' | 'reminder'
  priority: 'low' | 'medium' | 'high'
  assignees: string[]
  project: string
  status: 'pending' | 'in-progress' | 'completed'
}

const priorityColors = {
  low: 'border-l-blue-500',
  medium: 'border-l-orange-500',
  high: 'border-l-red-500'
}

const statusColors = {
  pending: 'bg-yellow-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500'
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all')
  const [assignees, setAssignees] = useState<string[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

  // Load tasks from Supabase
  useEffect(() => {
    loadTasks()
    loadAssignees()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('deadline', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAssignees = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('status', 'active')

      if (error) throw error
      const names = data?.map(user => user.name) || []
      setAssignees(names)
    } catch (error) {
      console.error('Error loading assignees:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || filterType === 'task'
    const matchesAssignee = selectedAssignee === 'all' || task.assignee === selectedAssignee
    return matchesSearch && matchesType && matchesAssignee
  })

  const getTasksForDate = (date: string) => {
    return filteredTasks.filter(task => {
      const taskDeadline = new Date(task.deadline).toISOString().split('T')[0]
      return taskDeadline === date
    })
  }

  // Get current date in Pakistan timezone
  const getCurrentDatePakistan = () => {
    const now = new Date()
    const pakistanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Karachi"}))
    const pakistanDate = new Date(pakistanTime.getFullYear(), pakistanTime.getMonth(), pakistanTime.getDate())
    return pakistanDate
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getTaskCount = (type: string) => {
    if (type === 'all') return tasks.length
    if (type === 'overdue') {
      const today = new Date()
      return tasks.filter(task => new Date(task.deadline) < today && task.status !== 'completed').length
    }
    if (type === 'due-today') {
      const today = new Date().toISOString().split('T')[0]
      return tasks.filter(task => task.deadline === today).length
    }
    if (type === 'due-this-week') {
      const today = new Date()
      const endOfWeek = new Date(today)
      endOfWeek.setDate(today.getDate() + 7)
      return tasks.filter(task => {
        const deadline = new Date(task.deadline)
        return deadline >= today && deadline <= endOfWeek
      }).length
    }
    return 0
  }

  const getOverdueTasks = () => {
    const today = new Date()
    return tasks.filter(task => 
      new Date(task.deadline) < today && task.status !== 'completed'
    ).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }

  const getUpcomingDeadlines = () => {
    const today = new Date()
    const endOfMonth = new Date(today)
    endOfMonth.setMonth(today.getMonth() + 1)
    
    return tasks.filter(task => {
      const deadline = new Date(task.deadline)
      return deadline >= today && deadline <= endOfMonth && task.status !== 'completed'
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Track task deadlines and manage your schedule</p>
        </div>
        <Button onClick={() => {}} variant="neon">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total Tasks</span>
          </div>
          <div className="text-2xl font-bold mt-2">{getTaskCount('all')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Overdue</span>
          </div>
          <div className="text-2xl font-bold mt-2 text-red-600">{getTaskCount('overdue')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Due Today</span>
          </div>
          <div className="text-2xl font-bold mt-2 text-orange-600">{getTaskCount('due-today')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">This Week</span>
          </div>
          <div className="text-2xl font-bold mt-2 text-blue-600">{getTaskCount('due-this-week')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Team Members</span>
          </div>
          <div className="text-2xl font-bold mt-2">{assignees.length}</div>
        </motion.div>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={selectedAssignee}
          onChange={(e) => setSelectedAssignee(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Assignees</option>
          {assignees.map(assignee => (
            <option key={assignee} value={assignee}>{assignee}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Types</option>
          <option value="task">Tasks Only</option>
        </select>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center font-medium text-sm">
              {day}
            </div>
          ))}
        </div>
        
        {/* Today Indicator */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border-b px-4 py-2 text-center">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Today (Pakistan Time): {getCurrentDatePakistan().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })}
          </span>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {getMonthDays().map((day, index) => {
            const todayPakistan = getCurrentDatePakistan()
            const isToday = day && day.getDate() === todayPakistan.getDate() && 
                           day.getMonth() === todayPakistan.getMonth() && 
                           day.getFullYear() === todayPakistan.getFullYear()
            
            // Only highlight as overdue if there are actual overdue tasks on this date
            const tasksForDate = day ? getTasksForDate(formatDate(day)) : []
            const hasOverdueTasks = tasksForDate.some(task => {
              const taskDate = new Date(task.deadline)
              return taskDate < todayPakistan && task.status !== 'completed'
            })
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b ${
                  day ? 'bg-background' : 'bg-muted/20'
                } ${
                  isToday ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-950/20' : ''
                } ${
                  hasOverdueTasks ? 'bg-red-50 dark:bg-red-950/20' : ''
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday 
                        ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' 
                        : hasOverdueTasks
                        ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                        : ''
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {/* Show task deadlines */}
                      {tasksForDate.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded cursor-pointer text-white truncate border-l-2 ${priorityColors[task.priority]} ${
                            task.status === 'completed' ? 'opacity-60' : ''
                          }`}
                          title={`${task.title} - ${task.assignee} (${task.status})`}
                        >
                          📋 {task.title}
                        </div>
                      ))}
                      
                      {/* Show total count if more than 3 tasks */}
                      {tasksForDate.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{tasksForDate.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {getOverdueTasks().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Overdue Tasks</h3>
          </div>
          <div className="space-y-2">
            {getOverdueTasks().slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{task.title}</span>
                <span className="text-red-600">Due: {new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            ))}
            {getOverdueTasks().length > 5 && (
              <div className="text-sm text-red-600">
                +{getOverdueTasks().length - 5} more overdue tasks
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Upcoming Deadlines */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
        <div className="space-y-3">
          {getUpcomingDeadlines()
            .slice(0, 5)
            .map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-card border rounded-lg p-4 border-l-4 ${priorityColors[task.priority]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium mb-1">{task.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Assignee: {task.assignee}</span>
                      {task.estimated_hours && <span>Est: {task.estimated_hours}h</span>}
                      {task.progress !== undefined && <span>Progress: {task.progress}%</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  )
}
