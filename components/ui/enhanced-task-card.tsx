"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  Users, 
  Flag, 
  CheckCircle2, 
  Circle, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { FuturisticCard } from './futuristic-card'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline?: string
  progress: number
  assignees?: Array<{
    id: string
    name: string
    avatar?: string
  }>
  tags?: string[]
  created_at: string
}

interface EnhancedTaskCardProps {
  task: Task
  onView?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStatusChange?: (task: Task, status: Task['status']) => void
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

const priorityConfig = {
  low: {
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: '🔵',
    gradient: 'from-blue-500/20 to-blue-600/20'
  },
  medium: {
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: '🟡',
    gradient: 'from-yellow-500/20 to-orange-500/20'
  },
  high: {
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: '🔴',
    gradient: 'from-red-500/20 to-pink-500/20'
  },
  urgent: {
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: '🚨',
    gradient: 'from-purple-500/20 to-red-500/20'
  }
}

const statusConfig = {
  pending: {
    color: 'bg-gray-500/20 text-gray-400',
    icon: Circle,
    label: 'Pending'
  },
  'in-progress': {
    color: 'bg-blue-500/20 text-blue-400',
    icon: Clock,
    label: 'In Progress'
  },
  completed: {
    color: 'bg-green-500/20 text-green-400',
    icon: CheckCircle2,
    label: 'Completed'
  }
}

export const EnhancedTaskCard: React.FC<EnhancedTaskCardProps> = ({
  task,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  className,
  variant = 'default'
}) => {
  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]
  const StatusIcon = status.icon

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed'
  const daysUntilDeadline = task.deadline 
    ? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hover: { 
      y: -4,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={cn("group", className)}
    >
      <FuturisticCard 
        variant="glass" 
        hover={false}
        className={cn(
          "relative overflow-hidden border transition-all duration-300",
          task.status === 'completed' && "opacity-75",
          isOverdue && "border-red-500/50 bg-red-500/5"
        )}
      >
        {/* Priority Gradient Bar */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          priority.gradient
        )} />

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStatusChange?.(task, 
                  task.status === 'completed' ? 'pending' : 
                  task.status === 'pending' ? 'in-progress' : 'completed'
                )}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <StatusIcon className="w-5 h-5" />
              </motion.button>
              
              <Badge variant="outline" className={cn("text-xs", priority.color)}>
                {priority.icon} {task.priority}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect">
                <DropdownMenuItem onClick={() => onView?.(task)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(task)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(task)}
                  className="text-red-400 focus:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h3 className={cn(
              "font-semibold text-sm leading-tight",
              task.status === 'completed' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {task.description && variant !== 'compact' && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {task.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{task.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent-purple rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && variant !== 'compact' && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            {/* Assignees */}
            <div className="flex items-center space-x-1">
              {task.assignees && task.assignees.length > 0 ? (
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((assignee, index) => (
                    <Avatar key={assignee.id} className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={assignee.avatar} />
                      <AvatarFallback className="text-xs">
                        {assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium">+{task.assignees.length - 3}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Deadline */}
            {task.deadline && (
              <div className={cn(
                "flex items-center space-x-1 text-xs",
                isOverdue ? "text-red-400" : 
                daysUntilDeadline !== null && daysUntilDeadline <= 3 ? "text-yellow-400" : 
                "text-muted-foreground"
              )}>
                <Calendar className="w-3 h-3" />
                <span>
                  {isOverdue ? 'Overdue' : 
                   daysUntilDeadline === 0 ? 'Today' :
                   daysUntilDeadline === 1 ? 'Tomorrow' :
                   `${daysUntilDeadline}d`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </FuturisticCard>
    </motion.div>
  )
}
