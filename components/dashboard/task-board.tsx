"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { TasksService, Task, CreateTaskData } from '@/lib/tasks-service'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { CreateTaskModal } from './create-task-modal'

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()

  // Load tasks from database
  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

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
      const updatedTask = await TasksService.updateTask(taskId, updates)
      console.log('✅ Task updated successfully:', updatedTask)
      
      // Reload tasks from database
      await loadTasks()
      
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
      await TasksService.deleteTask(taskId)
      console.log('✅ Task deleted successfully')
      
      // Reload tasks from database
      await loadTasks()
      
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
            <h2 className="text-2xl font-bold text-white">Task Board</h2>
            <p className="text-gray-400 text-sm mt-1">
              Manage your tasks with a visual Kanban board
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadTasks}
              disabled={isLoading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-neon-blue text-white px-4 py-2 rounded-lg hover:bg-neon-blue/90 flex items-center gap-2"
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
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{tasks.length}</p>
              </div>
              <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-400">{tasks.filter(t => t.status === 'pending').length}</p>
              </div>
              <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-blue-400">{tasks.filter(t => t.status === 'in-progress').length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-400">{tasks.filter(t => t.status === 'completed').length}</p>
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

      {/* Debug Info */}
      <div className="bg-gray-800/50 p-4 rounded-lg text-sm">
        <div className="text-gray-300 mb-2">Debug Info:</div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400">User ID:</span> {user?.id || 'Not logged in'}
          </div>
          <div>
            <span className="text-gray-400">Tasks Count:</span> {tasks.length}
          </div>
          <div>
            <span className="text-gray-400">Loading:</span> {isLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="text-gray-400">Last Updated:</span> {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <button
            onClick={async () => {
              console.log('🧪 Testing database connection...')
              try {
                const { data, error } = await supabase.from('tasks').select('*').limit(5)
                console.log('🧪 Direct Supabase query result:', { data, error })
                if (error) throw error
                alert(`Database test successful! Found ${data?.length || 0} tasks.`)
              } catch (err: any) {
                console.error('🧪 Database test failed:', err)
                alert(`Database test failed: ${err.message}`)
              }
            }}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 mr-2"
          >
            Test DB Connection
          </button>
          <button
            onClick={async () => {
              console.log('🔍 Checking if tasks table exists...')
              try {
                // Try to get table info
                const { data, error } = await supabase
                  .from('tasks')
                  .select('*')
                  .limit(1)
                
                if (error) {
                  if (error.message.includes('does not exist')) {
                    alert('❌ Tasks table does not exist! You need to create it in Supabase.')
                  } else {
                    alert(`❌ Table access error: ${error.message}`)
                  }
                } else {
                  alert(`✅ Tasks table exists and accessible!`)
                }
                
                console.log('🔍 Table check result:', { data, error })
              } catch (err: any) {
                console.error('🔍 Table check failed:', err)
                alert(`Table check failed: ${err.message}`)
              }
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 mr-2"
          >
            Check Table
          </button>
          <button
            onClick={async () => {
              console.log('📊 Checking database schema...')
              try {
                // Try to get all tables
                const { data, error } = await supabase
                  .from('information_schema.tables')
                  .select('table_name')
                  .eq('table_schema', 'public')
                
                if (error) {
                  alert(`❌ Schema check failed: ${error.message}`)
                } else {
                  const tableNames = data?.map(t => t.table_name).join(', ')
                  alert(`📊 Available tables: ${tableNames || 'None'}`)
                }
                
                console.log('📊 Schema check result:', { data, error })
              } catch (err: any) {
                console.error('📊 Schema check failed:', err)
                alert(`Schema check failed: ${err.message}`)
              }
            }}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 mr-2"
          >
            Check Schema
          </button>
          <button
            onClick={async () => {
              if (!user) {
                alert('❌ You must be logged in to create test tasks')
                return
              }
              
              console.log('🧪 Creating test task...')
              try {
                const testTask = {
                  title: 'Test Task - ' + new Date().toLocaleTimeString(),
                  description: 'This is a test task to verify database connection',
                  priority: 'medium' as const,
                  status: 'pending' as const,
                  progress: 0
                }
                
                console.log('🧪 Test task data:', testTask)
                console.log('🧪 User ID:', user.id)
                
                // Try direct Supabase insert first
                const { data, error } = await supabase
                  .from('tasks')
                  .insert({
                    title: testTask.title,
                    description: testTask.description,
                    priority: testTask.priority,
                    status: testTask.status,
                    progress: testTask.progress,
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  .select()
                  .single()
                
                if (error) {
                  console.error('🧪 Test task creation failed:', error)
                  alert(`❌ Test task creation failed: ${error.message}`)
                  
                  // Try to get more details about the error
                  if (error.message.includes('RLS')) {
                    alert('🔒 This looks like a Row Level Security (RLS) policy issue. You may need to create RLS policies for the tasks table.')
                  }
                } else {
                  console.log('🧪 Test task created successfully:', data)
                  alert(`✅ Test task created successfully! ID: ${data.id}`)
                  // Reload tasks
                  await loadTasks()
                }
              } catch (err: any) {
                console.error('🧪 Test task creation failed:', err)
                alert(`Test task creation failed: ${err.message}`)
              }
            }}
            className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
          >
            Create Test Task
          </button>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              Pending
            </h3>
            <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs">
              {tasks.filter(task => task.status === 'pending').length}
            </span>
          </div>
          <div className="min-h-[400px] bg-white/5 rounded-lg p-4 space-y-3">
            {tasks.filter(task => task.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No pending tasks
              </div>
            ) : (
              tasks.filter(task => task.status === 'pending').map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={handleUpdateTask} 
                  onDelete={handleDeleteTask} 
                />
              ))
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              In Progress
            </h3>
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
              {tasks.filter(task => task.status === 'in-progress').length}
            </span>
          </div>
          <div className="min-h-[400px] bg-white/5 rounded-lg p-4 space-y-3">
            {tasks.filter(task => task.status === 'in-progress').length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No tasks in progress
              </div>
            ) : (
              tasks.filter(task => task.status === 'in-progress').map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={handleUpdateTask} 
                  onDelete={handleDeleteTask} 
                />
              ))
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Completed
            </h3>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
              {tasks.filter(task => task.status === 'completed').length}
            </span>
          </div>
          <div className="min-h-[400px] bg-white/5 rounded-lg p-4 space-y-3">
            {tasks.filter(task => task.status === 'completed').length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No completed tasks
              </div>
            ) : (
              tasks.filter(task => task.status === 'completed').map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={handleUpdateTask} 
                  onDelete={handleDeleteTask} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Task Card Component for Kanban View
interface TaskCardProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<CreateTaskData>) => void
  onDelete: (taskId: string) => void
}

function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  return (
    <div className="bg-white/10 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
      <div className="space-y-3">
        {/* Task Title */}
        <h4 className="font-medium text-white text-sm leading-tight">{task.title}</h4>
        
        {/* Task Description */}
        {task.description && (
          <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}
        
        {/* Priority Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            task.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neon-blue rounded-full transition-all"
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{task.progress || 0}%</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onUpdate(task.id, { 
              status: task.status === 'pending' ? 'in-progress' : 
                      task.status === 'in-progress' ? 'completed' : 'pending'
            })}
            className="text-neon-blue hover:text-neon-blue/80 text-xs font-medium"
          >
            {task.status === 'pending' ? '→ Start' :
             task.status === 'in-progress' ? '→ Complete' : '↶ Reopen'}
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-400 hover:text-red-300 text-xs font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}