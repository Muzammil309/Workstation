"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  Flag, 
  User,
  MessageSquare,
  Paperclip,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

interface Task {
  id: string
  title: string
  description?: string
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignees: Array<{
    id: string
    name: string
    avatar?: string
  }>
  dueDate?: string
  progress?: number
  comments: number
  attachments: number
  tags: string[]
}

interface Column {
  id: string
  title: string
  status: Task['status']
  color: string
  tasks: Task[]
  limit?: number
}

const priorityConfig = {
  low: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🔵' },
  medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '🟡' },
  high: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '🟠' },
  urgent: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔴' }
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design System Documentation',
    description: 'Create comprehensive documentation for the design system components',
    status: 'in-progress',
    priority: 'high',
    assignees: [
      { id: '1', name: 'Sarah Chen', avatar: '/api/placeholder/32/32' },
      { id: '2', name: 'Mike Johnson', avatar: '/api/placeholder/32/32' }
    ],
    dueDate: '2024-02-15',
    progress: 65,
    comments: 8,
    attachments: 3,
    tags: ['documentation', 'design']
  },
  {
    id: '2',
    title: 'API Integration Testing',
    description: 'Test all API endpoints for the new authentication system',
    status: 'todo',
    priority: 'medium',
    assignees: [
      { id: '3', name: 'Emily Davis', avatar: '/api/placeholder/32/32' }
    ],
    dueDate: '2024-02-20',
    comments: 3,
    attachments: 1,
    tags: ['testing', 'api']
  },
  {
    id: '3',
    title: 'User Dashboard Redesign',
    description: 'Redesign the user dashboard with modern UI components',
    status: 'review',
    priority: 'urgent',
    assignees: [
      { id: '4', name: 'David Wilson', avatar: '/api/placeholder/32/32' },
      { id: '5', name: 'Lisa Anderson', avatar: '/api/placeholder/32/32' }
    ],
    dueDate: '2024-02-12',
    progress: 90,
    comments: 12,
    attachments: 5,
    tags: ['ui', 'redesign']
  },
  {
    id: '4',
    title: 'Database Migration',
    description: 'Migrate user data to the new database schema',
    status: 'done',
    priority: 'high',
    assignees: [
      { id: '6', name: 'Alex Thompson', avatar: '/api/placeholder/32/32' }
    ],
    progress: 100,
    comments: 5,
    attachments: 2,
    tags: ['database', 'migration']
  }
]

const columns: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    status: 'backlog',
    color: 'border-gray-500/30',
    tasks: mockTasks.filter(task => task.status === 'backlog')
  },
  {
    id: 'todo',
    title: 'To Do',
    status: 'todo',
    color: 'border-blue-500/30',
    tasks: mockTasks.filter(task => task.status === 'todo'),
    limit: 5
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in-progress',
    color: 'border-yellow-500/30',
    tasks: mockTasks.filter(task => task.status === 'in-progress'),
    limit: 3
  },
  {
    id: 'review',
    title: 'Review',
    status: 'review',
    color: 'border-purple-500/30',
    tasks: mockTasks.filter(task => task.status === 'review'),
    limit: 2
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
    color: 'border-green-500/30',
    tasks: mockTasks.filter(task => task.status === 'done')
  }
]

export const ModernTaskBoard: React.FC = () => {
  const [boardColumns, setBoardColumns] = useState(columns)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 bg-dark-bg-primary min-h-screen"
    >
      {/* Header */}
      <motion.div variants={columnVariants} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Task Board</h1>
            <p className="text-text-muted mt-1">Manage your team's workflow efficiently</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </motion.div>

      {/* Board */}
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {boardColumns.map((column, index) => (
          <motion.div
            key={column.id}
            variants={columnVariants}
            className="flex-shrink-0 w-80"
          >
            <TaskColumn column={column} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

interface TaskColumnProps {
  column: Column
}

const TaskColumn: React.FC<TaskColumnProps> = ({ column }) => {
  const isOverLimit = column.limit && column.tasks.length > column.limit

  return (
    <div className="space-y-4">
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between p-4 rounded-xl glass-card border-l-4',
        column.color
      )}>
        <div className="flex items-center space-x-3">
          <h3 className="font-semibold text-text-primary">{column.title}</h3>
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              isOverLimit ? 'border-red-500 text-red-400' : 'border-glass-border text-text-muted'
            )}
          >
            {column.tasks.length}
            {column.limit && ` / ${column.limit}`}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Tasks */}
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        <AnimatePresence>
          {column.tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <TaskCard task={task} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: Task
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const priority = priorityConfig[task.priority]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'glass-card border-glass-border hover:border-brand-primary/50 transition-all duration-200 group cursor-pointer',
        isOverdue && 'border-red-500/50'
      )}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={cn('text-xs', priority.color)}>
                {priority.icon} {task.priority}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-morphism">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h4 className="font-semibold text-text-primary leading-tight">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-text-muted line-clamp-2">{task.description}</p>
            )}
          </div>

          {/* Progress */}
          {task.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Progress</span>
                <span className="font-medium text-text-primary">{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-2" />
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-glass-bg"
                >
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-glass-bg">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-glass-border">
            {/* Assignees */}
            <div className="flex -space-x-2">
              {task.assignees.slice(0, 3).map((assignee) => (
                <Avatar key={assignee.id} className="w-6 h-6 border-2 border-dark-bg-secondary">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-xs">{assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              {task.assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-glass-bg border-2 border-dark-bg-secondary flex items-center justify-center">
                  <span className="text-xs font-medium">+{task.assignees.length - 3}</span>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-3 text-xs text-text-muted">
              {task.comments > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{task.comments}</span>
                </div>
              )}
              {task.attachments > 0 && (
                <div className="flex items-center space-x-1">
                  <Paperclip className="w-3 h-3" />
                  <span>{task.attachments}</span>
                </div>
              )}
              {task.dueDate && (
                <div className={cn(
                  "flex items-center space-x-1",
                  isOverdue ? "text-red-400" : "text-text-muted"
                )}>
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
