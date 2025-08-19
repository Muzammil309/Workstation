"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, Target, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { showNotification } from '@/lib/notifications'

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

interface Task {
  id: string
  title: string
  description: string
  project: string
  deadline: string
  assignee: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
}

const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team synchronization meeting',
    date: '2024-01-20',
    time: '09:00',
    duration: 30,
    type: 'meeting',
    priority: 'medium',
    assignees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    project: 'Website Redesign',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Design Review',
    description: 'Review new UI components',
    date: '2024-01-20',
    time: '14:00',
    duration: 60,
    type: 'meeting',
    priority: 'high',
    assignees: ['John Doe', 'Sarah Wilson'],
    project: 'Website Redesign',
    status: 'pending'
  },
  {
    id: '3',
    title: 'API Integration Deadline',
    description: 'Complete backend API integration',
    date: '2024-01-22',
    time: '17:00',
    duration: 0,
    type: 'deadline',
    priority: 'high',
    assignees: ['Mike Johnson'],
    project: 'Website Redesign',
    status: 'in-progress'
  },
  {
    id: '4',
    title: 'Client Presentation',
    description: 'Present progress to client',
    date: '2024-01-25',
    time: '10:00',
    duration: 90,
    type: 'meeting',
    priority: 'high',
    assignees: ['John Doe', 'Jane Smith'],
    project: 'Website Redesign',
    status: 'pending'
  }
]

// Sample tasks for calendar integration
const sampleTasks: Task[] = [
  {
    id: 'task1',
    title: 'Design User Interface',
    description: 'Create modern UI components for the dashboard',
    project: 'Frontend Development',
    deadline: '2024-01-20',
    assignee: 'John Doe',
    priority: 'high',
    status: 'in-progress'
  },
  {
    id: 'task2',
    title: 'API Integration',
    description: 'Integrate backend APIs with frontend',
    project: 'Backend Development',
    deadline: '2024-01-22',
    assignee: 'Jane Smith',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 'task3',
    title: 'Database Schema Design',
    description: 'Design and implement database structure',
    project: 'Database',
    deadline: '2024-01-18',
    assignee: 'Mike Johnson',
    priority: 'high',
    status: 'completed'
  },
  {
    id: 'task4',
    title: 'User Testing',
    description: 'Conduct user testing sessions',
    project: 'Quality Assurance',
    deadline: '2024-01-24',
    assignee: 'Sarah Wilson',
    priority: 'medium',
    status: 'pending'
  }
]

const eventTypeColors = {
  task: 'bg-blue-500',
  meeting: 'bg-green-500',
  deadline: 'bg-red-500',
  reminder: 'bg-yellow-500'
}

const priorityColors = {
  low: 'border-l-blue-500',
  medium: 'border-l-orange-500',
  high: 'border-l-red-500'
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const filteredEvents = sampleEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || event.type === filterType
    return matchesSearch && matchesType
  })

  const getEventsForDate = (date: string) => {
    const events = filteredEvents.filter(event => event.date === date)
    // Filter tasks by deadline date (format: YYYY-MM-DD)
    const tasks = sampleTasks.filter(task => {
      const taskDeadline = new Date(task.deadline).toISOString().split('T')[0]
      return taskDeadline === date
    })
    return { events, tasks }
  }

  // Get current date in Pakistan timezone
  const getCurrentDatePakistan = () => {
    const now = new Date()
    // More reliable way to get Pakistan timezone date
    const pakistanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Karachi"}))
    // Ensure we get the correct date by creating a new Date object
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

  const formatDatePakistan = (date: Date) => {
    // Format date in Pakistan timezone
    const pakistanDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Karachi"}))
    return pakistanDate.toISOString().split('T')[0]
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

  const getEventCount = (type: string) => {
    return sampleEvents.filter(e => e.type === type).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage your time</p>
        </div>
        <Button onClick={() => {}} variant="neon">
          <Plus className="h-4 w-4 mr-2" />
          New Event
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
            <span className="text-sm font-medium text-muted-foreground">Total Events</span>
          </div>
          <div className="text-2xl font-bold mt-2">{sampleEvents.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Meetings</span>
          </div>
          <div className="text-2xl font-bold mt-2">{getEventCount('meeting')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Deadlines</span>
          </div>
          <div className="text-2xl font-bold mt-2">{getEventCount('deadline')}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Task Deadlines</span>
          </div>
          <div className="text-2xl font-bold mt-2">{sampleTasks.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Tasks</span>
          </div>
          <div className="text-2xl font-bold mt-2">{getEventCount('task')}</div>
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
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Types</option>
          <option value="task">Tasks</option>
          <option value="meeting">Meetings</option>
          <option value="deadline">Deadlines</option>
          <option value="reminder">Reminders</option>
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
            })} | Local: {new Date().toLocaleDateString('en-US', { 
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
            // Fix: Compare the actual day numbers in Pakistan timezone, not formatted strings
            const isToday = day && day.getDate() === todayPakistan.getDate() && 
                           day.getMonth() === todayPakistan.getMonth() && 
                           day.getFullYear() === todayPakistan.getFullYear()
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b ${
                  day ? 'bg-background' : 'bg-muted/20'
                } ${
                  isToday ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-950/20' : ''
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday 
                        ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' 
                        : ''
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {/* Show events first */}
                      {getEventsForDate(formatDate(day)).events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded cursor-pointer ${eventTypeColors[event.type]} text-white truncate`}
                          title={`${event.title} - ${event.time}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {/* Show task deadlines */}
                      {getEventsForDate(formatDate(day)).tasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded cursor-pointer bg-purple-500 text-white truncate border-l-2 ${priorityColors[task.priority]}`}
                          title={`${task.title} - ${task.assignee} (${task.status})`}
                        >
                          📋 {task.title}
                        </div>
                      ))}
                      
                      {/* Show total count if more than 4 items */}
                      {getEventsForDate(formatDate(day)).events.length + getEventsForDate(formatDate(day)).tasks.length > 4 && (
                        <div className="text-xs text-muted-foreground">
                          +{getEventsForDate(formatDate(day)).events.length + getEventsForDate(formatDate(day)).tasks.length - 4} more
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

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upcoming Events</h3>
        <div className="space-y-3">
          {filteredEvents
            .filter(event => new Date(event.date) >= getCurrentDatePakistan())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-card border rounded-lg p-4 border-l-4 ${priorityColors[event.priority]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${eventTypeColors[event.type]}`}>
                        {event.type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </span>
                    </div>
                    <h4 className="font-medium mb-1">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Project: {event.project}</span>
                      <span>Duration: {event.duration}min</span>
                      <span>Assignees: {event.assignees.join(', ')}</span>
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
