"use client"

/**
 * IMPORTANT: AUTO-DELETE FEATURE IS OPT-IN ONLY
 * 
 * Tasks will NEVER be automatically deleted unless:
 * 1. User explicitly checks the "Auto-delete" checkbox during task creation
 * 2. User sets a valid duration (greater than 0 hours)
 * 3. User confirms the auto-delete setting
 * 
 * By default, ALL tasks are permanent and will remain until manually deleted.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Plus, MoreVertical, Clock, User, Tag, Timer, Filter, Search, SortAsc, SortDesc, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TaskCard } from './task-card'
import { CreateTaskModal } from './create-task-modal'
import { TaskExport } from './task-export'
import { useToast } from '@/hooks/use-toast'
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
  autoDelete?: {
    enabled: boolean
    duration: number // in hours
    createdAt?: string
  }
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design User Interface',
    description: 'Create modern UI components for the dashboard',
    project: 'Frontend Development',
    duration: '8 hours',
    assignedOn: '2024-01-15',
    status: 'in-progress',
    deadline: '2024-01-20',
    actualTime: '4 hours',
    notes: 'Focus on accessibility and responsive design',
    assignee: 'John Doe',
    priority: 'high'
    // No autoDelete - tasks should only auto-delete when explicitly enabled by user
  },
  {
    id: '2',
    title: 'API Integration',
    description: 'Integrate backend APIs with frontend',
    project: 'Backend Development',
    duration: '6 hours',
    assignedOn: '2024-01-16',
    status: 'pending',
    deadline: '2024-01-22',
    assignee: 'Jane Smith',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Database Schema Design',
    description: 'Design and implement database structure',
    project: 'Database',
    duration: '4 hours',
    assignedOn: '2024-01-14',
    status: 'completed',
    deadline: '2024-01-18',
    actualTime: '3.5 hours',
    assignee: 'Mike Johnson',
    priority: 'high'
  }
]

const columns = [
  { id: 'pending', title: 'Pending', color: 'bg-yellow-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'completed', title: 'Completed', color: 'bg-green-500' }
]

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'assignee' | 'created'>('deadline')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { toast } = useToast()



  // Auto-delete effect - ONLY for tasks explicitly enabled by user during creation
  useEffect(() => {
    const checkAutoDelete = () => {
      const now = new Date()
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.filter(task => {
          // CRITICAL: Only auto-delete if ALL conditions are met:
          // 1. User explicitly enabled autoDelete during task creation
          // 2. Task has autoDelete configuration with createdAt timestamp
          // 3. The duration has actually passed
          if (task.autoDelete?.enabled === true && 
              task.autoDelete.createdAt && 
              task.autoDelete.duration > 0) {
            
            const createdAt = new Date(task.autoDelete.createdAt)
            const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
            
            if (hoursSinceCreation >= task.autoDelete.duration) {
              // Show toast notification for auto-deleted task
              toast({
                title: "Task Auto-Deleted",
                description: `"${task.title}" was automatically removed after ${task.autoDelete.duration} hours`,
              })
              return false // Remove the task
            }
          }
          return true // Keep the task - this is the default behavior
        })
        return updatedTasks
      })
    }

    // Check every hour
    const interval = setInterval(checkAutoDelete, 60 * 60 * 1000)
    
    // Initial check
    checkAutoDelete()

    return () => clearInterval(interval)
  }, [toast])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceColumn = source.droppableId
    const destColumn = destination.droppableId

    if (sourceColumn === destColumn) {
      // Reorder within same column
      const columnTasks = tasks.filter(task => task.status === sourceColumn)
      const [removed] = columnTasks.splice(source.index, 1)
      const newTasks = tasks.filter(task => task.status !== sourceColumn)
      
      const updatedColumnTasks = [...columnTasks]
      updatedColumnTasks.splice(destination.index, 0, removed)
      
      setTasks([...newTasks, ...updatedColumnTasks])
    } else {
      // Move to different column
      const taskToMove = tasks.find(task => task.id === result.draggableId)
      if (taskToMove) {
        const updatedTask = { ...taskToMove, status: destColumn as Task['status'] }
        setTasks(tasks.map(task => 
          task.id === taskToMove.id ? updatedTask : task
        ))
        
        toast({
          title: "Task Updated",
          description: `Task moved to ${destColumn}`,
        })
      }
    }
  }

  const addTask = (newTask: Omit<Task, 'id' | 'assignedOn'> & { assignedOn?: string; autoDelete?: { enabled: boolean; duration: number } }) => {
    // SAFETY CHECK: Ensure auto-delete is only enabled when user explicitly chooses it
    const autoDeleteEnabled = newTask.autoDelete?.enabled === true && 
                             newTask.autoDelete?.duration && 
                             newTask.autoDelete.duration > 0
    
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      assignedOn: newTask.assignedOn || new Date().toISOString().split('T')[0],
      // IMPORTANT: autoDelete is ONLY set if user explicitly enables it during task creation
      // By default, tasks will NEVER auto-delete unless user checks the auto-delete option
      autoDelete: autoDeleteEnabled ? {
        enabled: true,
        duration: newTask.autoDelete!.duration,
        createdAt: new Date().toISOString()
      } : undefined
    }
    setTasks([...tasks, task])
    setIsCreateModalOpen(false)
    
    // Show notification with sound
    showNotification("Task Created", `"${task.title}" has been assigned to ${task.assignee}`)
    
    if (task.autoDelete?.enabled) {
      toast({
        title: "Task Created",
        description: `New task will be automatically deleted after ${task.autoDelete.duration} hours`,
      })
    } else {
      toast({
        title: "Task Created",
        description: "New task has been added successfully",
      })
    }
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    toast({
      title: "Task Deleted",
      description: "Task has been removed",
    })
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ))
    toast({
      title: "Task Updated",
      description: "Task has been updated successfully",
    })
  }

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.project.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || task.project === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'assignee':
          comparison = a.assignee.localeCompare(b.assignee)
          break
        case 'created':
          comparison = new Date(a.assignedOn).getTime() - new Date(b.assignedOn).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Get unique categories from tasks
  const categories = ['all', ...Array.from(new Set(tasks.map(task => task.project)))]

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex items-center justify-between mb-6">
         <div>
           <h1 className="text-3xl font-bold">Task Board</h1>
           <p className="text-muted-foreground">Manage and track your team's tasks</p>
         </div>
         <div className="flex items-center space-x-3">
           <Button onClick={() => setIsExportModalOpen(true)} variant="outline">
             <Download className="h-4 w-4 mr-2" />
             Export
           </Button>
           <Button onClick={() => setIsCreateModalOpen(true)} variant="neon">
             <Plus className="h-4 w-4 mr-2" />
             New Task
           </Button>
         </div>
       </div>

       {/* Search, Filter, and Sort Controls */}
       <div className="bg-card border rounded-lg p-4 mb-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {/* Search */}
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search tasks..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10"
             />
           </div>

           {/* Category Filter */}
           <select
             value={selectedCategory}
             onChange={(e) => setSelectedCategory(e.target.value)}
             className="px-3 py-2 border rounded-md bg-background text-sm"
           >
             {categories.map(category => (
               <option key={category} value={category}>
                 {category === 'all' ? 'All Categories' : category}
               </option>
             ))}
           </select>

           {/* Sort By */}
           <select
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value as any)}
             className="px-3 py-2 border rounded-md bg-background text-sm"
           >
             <option value="deadline">Sort by Deadline</option>
             <option value="priority">Sort by Priority</option>
             <option value="assignee">Sort by Assignee</option>
             <option value="created">Sort by Created Date</option>
           </select>

           {/* Sort Order */}
           <Button
             variant="outline"
             size="sm"
             onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
             className="flex items-center space-x-2"
           >
             {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
             <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
           </Button>
         </div>
       </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.id)
          const count = columnTasks.length
          
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <span className="text-sm font-medium text-muted-foreground">
                  {column.title}
                </span>
              </div>
              <div className="text-2xl font-bold mt-2">{count}</div>
            </motion.div>
          )
        })}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </span>
          </div>
          <div className="text-2xl font-bold mt-2">{tasks.length}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Active Timers
            </span>
          </div>
          <div className="text-2xl font-bold mt-2 text-green-600">
            {tasks.filter(task => task.status === 'in-progress').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Auto-Delete Tasks
            </span>
          </div>
          <div className="text-2xl font-bold mt-2 text-orange-600">
            {tasks.filter(task => task.autoDelete?.enabled).length}
          </div>
        </motion.div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold">{column.title}</h3>
                <span className="text-sm text-muted-foreground">
                  ({tasks.filter(task => task.status === column.id).length})
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted bg-muted/20'
                    }`}
                  >
                                         {filteredAndSortedTasks
                       .filter(task => task.status === column.id)
                       .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided: any, snapshot: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging 
                                  ? provided.draggableProps.style?.transform 
                                  : 'none'
                              }}
                            >
                              <TaskCard
                                task={task}
                                onDelete={deleteTask}
                                onUpdate={updateTask}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

                     {/* Create Task Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <CreateTaskModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={addTask}
              existingTasks={tasks}
            />
          )}
        </AnimatePresence>

               {/* Export Modal */}
        <AnimatePresence>
          {isExportModalOpen && (
            <TaskExport
              tasks={tasks}
              onClose={() => setIsExportModalOpen(false)}
            />
          )}
        </AnimatePresence>
    </div>
  )
}
