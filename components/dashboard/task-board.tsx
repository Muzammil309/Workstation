"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { TasksService, Task, CreateTaskData } from '@/lib/tasks-service'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTask, setNewTask] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending'
  })
  
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
      
      const tasksData = await TasksService.getTasks()
      console.log('✅ Tasks loaded:', tasksData)
      console.log('📊 Tasks count:', tasksData?.length || 0)
      
      setTasks(tasksData || [])
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create tasks.',
        variant: 'destructive',
      })
      return
    }

    try {
      console.log('🔄 Creating task:', newTask, 'for user:', user.id)
      const createdTask = await TasksService.createTask(newTask, user.id)
      console.log('✅ Task created successfully:', createdTask)
      
      // Reload tasks from database instead of just adding to local state
      await loadTasks()
      
      setNewTask({ title: '', description: '', priority: 'medium', status: 'pending' })
      setShowCreateForm(false)
      
      toast({
        title: 'Success',
        description: 'Task created successfully!',
      })
    } catch (error) {
      console.error('❌ Failed to create task:', error)
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Task Board</h2>
        <div className="flex gap-2">
          <button
            onClick={loadTasks}
            disabled={isLoading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-neon-blue text-white px-4 py-2 rounded-lg hover:bg-neon-blue/90"
          >
            {showCreateForm ? 'Cancel' : 'Create Task'}
          </button>
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

      {/* Create Task Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateTask} className="bg-white/5 p-6 rounded-lg space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-white text-sm font-medium mb-2">
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="task-description" className="block text-white text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="block text-white text-sm font-medium mb-2">
                Priority
              </label>
              <select
                id="task-priority"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="task-status" className="block text-white text-sm font-medium mb-2">
                Status
              </label>
              <select
                id="task-status"
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as any })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-neon-blue text-white py-3 rounded-lg hover:bg-neon-blue/90"
          >
            Create Task
          </button>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No tasks found. Create your first task!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white/5 p-6 rounded-lg border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-300 mt-2">{task.description}</p>
                  )}
                  <div className="flex gap-4 mt-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {task.status}
                    </span>
                    <span className="text-gray-400 text-xs">
                      Progress: {task.progress}%
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateTask(task.id, { 
                      status: task.status === 'pending' ? 'in-progress' : 
                              task.status === 'in-progress' ? 'completed' : 'pending'
                    })}
                    className="text-neon-blue hover:text-neon-blue/80 text-sm"
                  >
                    {task.status === 'pending' ? 'Start' :
                     task.status === 'in-progress' ? 'Complete' : 'Reset'}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}