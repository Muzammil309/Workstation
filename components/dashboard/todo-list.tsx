"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, AlertCircle, Calendar, User, Plus, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { formatAssigneeNames } from '@/lib/user-utils'
import { ErrorBoundary, DashboardErrorFallback, useErrorHandler } from '@/components/error-boundary'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  deadline?: string
  progress: number
  assignees?: string[]
  project_id?: string
  created_at: string
  updated_at: string
}

interface Project {
  id: string
  name: string
  color: string
}

function TodoListContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { handleError } = useErrorHandler()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access your to-do list.</p>
      </div>
    )
  }

  useEffect(() => {
    const initializeTodoList = async () => {
      if (user) {
        try {
          await Promise.all([loadUserTasks(), loadProjects()])
        } catch (error) {
          console.error('Failed to initialize todo list:', error)
          handleError(error as Error)
        }
      }
    }

    initializeTodoList()
  }, [user, handleError])

  const loadUserTasks = async () => {
    try {
      setIsLoading(true)

      if (!user?.id) {
        throw new Error('User ID is required to load tasks')
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .contains('assignees', [user.id])
        .order('created_at', { ascending: false })

      if (error) throw error

      // Ensure data is an array
      const tasksData = Array.isArray(data) ? data : []
      setTasks(tasksData)
    } catch (error: any) {
      console.error('Error loading user tasks:', error)
      toast({
        title: "Error",
        description: "Failed to load your tasks",
        variant: "destructive"
      })
      // Set empty array on error to prevent undefined issues
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, color')

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      console.error('Error loading projects:', error)
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : newStatus === 'in-progress' ? 50 : 0
        })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, progress: newStatus === 'completed' ? 100 : newStatus === 'in-progress' ? 50 : 0 }
          : task
      ))

      toast({
        title: "Success",
        description: `Task marked as ${newStatus.replace('-', ' ')}`,
      })
    } catch (error: any) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      })
    }
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const getProjectColor = (projectId?: string) => {
    if (!projectId) return 'gray'
    const project = projects.find(p => p.id === projectId)
    return project?.color || 'gray'
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
      case 'low': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
      case 'in-progress': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200'
      case 'pending': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-200'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-200'
    }
  }

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    return new Date(deadline) < new Date() && tasks.find(t => t.deadline === deadline)?.status !== 'completed'
  }

  const taskStats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    overdue: filteredTasks.filter(t => isOverdue(t.deadline)).length
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emphasis">My To-do List</h1>
          <p className="text-subtle mt-1">Personal tasks assigned to you</p>
        </div>
        
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <CheckSquare className="w-3 h-3 mr-1" />
            {taskStats.total} Total
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-sky-50 text-sky-700 dark:bg-sky-900/30">
            <Clock className="w-3 h-3 mr-1" />
            {taskStats.inProgress} In Progress
          </Badge>
          {taskStats.overdue > 0 && (
            <Badge variant="outline" className="px-3 py-1 bg-rose-50 text-rose-700 dark:bg-rose-900/30">
              <AlertCircle className="w-3 h-3 mr-1" />
              {taskStats.overdue} Overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="surface-3">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="surface-3">
            <CardContent className="p-8 text-center">
              <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-emphasis mb-2">No tasks found</h3>
              <p className="text-subtle">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your filters to see more tasks.'
                  : 'You have no tasks assigned to you yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`surface-3 hover:shadow-md transition-all duration-200 ${
                task.priority === 'high' ? 'priority-high' :
                task.priority === 'medium' ? 'priority-medium' :
                'priority-low'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-medium text-emphasis ${
                          task.status === 'completed' ? 'line-through opacity-60' : ''
                        }`}>
                          {task.title}
                        </h3>
                        
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        
                        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-subtle text-sm mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-subtle">
                        {task.project_id && (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getProjectColor(task.project_id) }}
                            />
                            <span>{getProjectName(task.project_id)}</span>
                          </div>
                        )}
                        
                        {task.deadline && (
                          <div className={`flex items-center gap-1 ${
                            isOverdue(task.deadline) ? 'text-rose-600 dark:text-rose-400' : ''
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(task.deadline).toLocaleDateString()}</span>
                            {isOverdue(task.deadline) && <span className="text-rose-600">(Overdue)</span>}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span>{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {task.status !== 'completed' && (
                        <>
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'in-progress')}
                              className="text-xs"
                            >
                              Start
                            </Button>
                          )}
                          
                          {task.status === 'in-progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                              className="text-xs"
                            >
                              Complete
                            </Button>
                          )}
                        </>
                      )}
                      
                      {task.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskStatus(task.id, 'in-progress')}
                          className="text-xs"
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// Export wrapped component with error boundary
export function TodoList() {
  return (
    <ErrorBoundary fallback={DashboardErrorFallback}>
      <TodoListContent />
    </ErrorBoundary>
  )
}
