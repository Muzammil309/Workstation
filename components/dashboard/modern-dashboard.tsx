"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  Users, 
  Calendar,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DashboardStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  teamMembers: number
  productivity: number
}

interface RecentActivity {
  id: string
  type: 'task_completed' | 'task_created' | 'comment_added' | 'file_uploaded'
  title: string
  user: {
    name: string
    avatar?: string
  }
  timestamp: string
}

interface ProjectProgress {
  id: string
  name: string
  progress: number
  status: 'on-track' | 'at-risk' | 'delayed'
  dueDate: string
  team: Array<{ name: string; avatar?: string }>
}

const mockStats: DashboardStats = {
  totalTasks: 156,
  completedTasks: 89,
  inProgressTasks: 34,
  overdueTasks: 8,
  teamMembers: 12,
  productivity: 87
}

const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'task_completed',
    title: 'Completed "Design System Documentation"',
    user: { name: 'Sarah Chen', avatar: '/api/placeholder/32/32' },
    timestamp: '2 minutes ago'
  },
  {
    id: '2',
    type: 'task_created',
    title: 'Created "API Integration Testing"',
    user: { name: 'Mike Johnson', avatar: '/api/placeholder/32/32' },
    timestamp: '15 minutes ago'
  },
  {
    id: '3',
    type: 'comment_added',
    title: 'Added comment to "User Authentication"',
    user: { name: 'Emily Davis', avatar: '/api/placeholder/32/32' },
    timestamp: '1 hour ago'
  }
]

const mockProjects: ProjectProgress[] = [
  {
    id: '1',
    name: 'Mobile App Redesign',
    progress: 78,
    status: 'on-track',
    dueDate: '2024-02-15',
    team: [
      { name: 'John', avatar: '/api/placeholder/32/32' },
      { name: 'Sarah', avatar: '/api/placeholder/32/32' },
      { name: 'Mike', avatar: '/api/placeholder/32/32' }
    ]
  },
  {
    id: '2',
    name: 'API Documentation',
    progress: 45,
    status: 'at-risk',
    dueDate: '2024-02-10',
    team: [
      { name: 'Emily', avatar: '/api/placeholder/32/32' },
      { name: 'David', avatar: '/api/placeholder/32/32' }
    ]
  },
  {
    id: '3',
    name: 'Security Audit',
    progress: 92,
    status: 'on-track',
    dueDate: '2024-02-08',
    team: [
      { name: 'Alex', avatar: '/api/placeholder/32/32' }
    ]
  }
]

export const ModernDashboard: React.FC = () => {
  const completionRate = Math.round((mockStats.completedTasks / mockStats.totalTasks) * 100)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 bg-dark-bg-primary min-h-screen"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
        <p className="text-text-muted">Welcome back! Here's what's happening with your projects.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Tasks"
          value={mockStats.totalTasks}
          change={{ value: 12, type: 'increase' }}
          icon={<Target className="w-6 h-6" />}
          gradient="gradient-primary"
        />
        <StatsCard
          title="Completed"
          value={mockStats.completedTasks}
          change={{ value: 8, type: 'increase' }}
          icon={<CheckCircle2 className="w-6 h-6" />}
          gradient="gradient-accent"
        />
        <StatsCard
          title="In Progress"
          value={mockStats.inProgressTasks}
          change={{ value: 3, type: 'decrease' }}
          icon={<Clock className="w-6 h-6" />}
          gradient="gradient-warm"
        />
        <StatsCard
          title="Team Members"
          value={mockStats.teamMembers}
          icon={<Users className="w-6 h-6" />}
          gradient="gradient-cool"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-accent-blue" />
                <span>Productivity Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Completion Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Task Completion Rate</span>
                    <span className="text-2xl font-bold text-text-primary">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-3" />
                </div>

                {/* Weekly Progress */}
                <div className="space-y-4">
                  <h4 className="font-medium text-text-primary">This Week's Progress</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-xs text-text-muted mb-2">{day}</div>
                        <div 
                          className={cn(
                            'h-16 rounded-lg flex items-end justify-center',
                            index < 5 ? 'bg-gradient-primary' : 'bg-glass-bg'
                          )}
                        >
                          <div 
                            className="w-full bg-white/20 rounded-lg"
                            style={{ height: `${Math.random() * 80 + 20}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-accent-yellow" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-glass-bg transition-colors"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">{activity.title}</p>
                      <p className="text-xs text-text-muted">{activity.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Project Progress */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-accent-purple" />
              <span>Project Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-glass-bg hover:bg-glass-bg/80 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-text-primary">{project.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs',
                          project.status === 'on-track' && 'border-accent-green text-accent-green',
                          project.status === 'at-risk' && 'border-accent-yellow text-accent-yellow',
                          project.status === 'delayed' && 'border-accent-red text-accent-red'
                        )}
                      >
                        {project.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex -space-x-2">
                      {project.team.map((member, idx) => (
                        <Avatar key={idx} className="w-6 h-6 border-2 border-dark-bg-secondary">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Progress</span>
                      <span className="text-text-primary font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                      <span>{project.team.length} member{project.team.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: React.ReactNode
  gradient: string
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, gradient }) => {
  return (
    <Card className="glass-card border-glass-border hover-lift group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-muted">{title}</p>
            <motion.p 
              className="text-3xl font-bold text-text-primary"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {value}
            </motion.p>
            {change && (
              <motion.div 
                className={cn(
                  "flex items-center text-xs",
                  change.type === 'increase' ? "text-accent-green" : "text-accent-red"
                )}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                {change.type === 'increase' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(change.value)}%
              </motion.div>
            )}
          </div>
          <motion.div 
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-white',
              gradient,
              'group-hover:scale-110 transition-transform duration-200'
            )}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
