'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { Users, CheckSquare, Clock, TrendingUp, Target, Award, Calendar, Activity } from 'lucide-react'

interface Task {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  estimatedHours: number
  progress: number
  created_at: string
  deadline: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  onTime: number
  highPriority: number
  mediumPriority: number
  lowPriority: number
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    onTime: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role, department')
        .eq('status', 'active')

      if (usersError) throw usersError

      setTasks(tasksData || [])
      setUsers(usersData || [])
      
      // Calculate statistics
      calculateStats(tasksData || [])
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tasksData: Task[]) => {
    const now = new Date()
    const stats: TaskStats = {
      total: tasksData.length,
      pending: tasksData.filter(t => t.status === 'pending').length,
      inProgress: tasksData.filter(t => t.status === 'in-progress').length,
      completed: tasksData.filter(t => t.status === 'completed').length,
      overdue: tasksData.filter(t => new Date(t.deadline) < now && t.status !== 'completed').length,
      onTime: tasksData.filter(t => new Date(t.deadline) >= now || t.status === 'completed').length,
      highPriority: tasksData.filter(t => t.priority === 'high').length,
      mediumPriority: tasksData.filter(t => t.priority === 'medium').length,
      lowPriority: tasksData.filter(t => t.priority === 'low').length
    }
    setStats(stats)
  }

  const getStatusData = () => [
    { name: 'Pending', value: stats.pending, color: '#fbbf24' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Completed', value: stats.completed, color: '#10b981' }
  ]

  const getPriorityData = () => [
    { name: 'High', value: stats.highPriority, color: '#ef4444' },
    { name: 'Medium', value: stats.mediumPriority, color: '#f59e0b' },
    { name: 'Low', value: stats.lowPriority, color: '#10b981' }
  ]

  const getDepartmentPerformance = () => {
    const departmentStats = users.reduce((acc, user) => {
      if (user.department && user.role !== 'admin') {
        const userTasks = tasks.filter(t => t.assignee === user.id)
        const completedTasks = userTasks.filter(t => t.status === 'completed').length
        const totalTasks = userTasks.length
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        
        if (!acc[user.department]) {
          acc[user.department] = { total: 0, completed: 0, users: 0 }
        }
        acc[user.department].total += totalTasks
        acc[user.department].completed += completedTasks
        acc[user.department].users += 1
      }
      return acc
    }, {} as Record<string, { total: number; completed: number; users: number }>)

    return Object.entries(departmentStats).map(([dept, data]) => ({
      department: dept,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      totalTasks: data.total,
      users: data.users
    }))
  }

  const getWeeklyProgress = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map(date => {
      const dayTasks = tasks.filter(t => 
        new Date(t.created_at).toISOString().split('T')[0] === date
      )
      const completedTasks = dayTasks.filter(t => t.status === 'completed').length
      const totalTasks = dayTasks.length

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: completedTasks,
        total: totalTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      }
    })
  }

  const getTopPerformers = () => {
    return users
      .filter(u => u.role !== 'admin')
      .map(user => {
        const userTasks = tasks.filter(t => t.assignee === user.id)
        const completedTasks = userTasks.filter(t => t.status === 'completed').length
        const totalTasks = userTasks.length
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        const avgProgress = userTasks.length > 0 
          ? userTasks.reduce((sum, t) => sum + t.progress, 0) / userTasks.length 
          : 0

        return {
          name: user.name,
          department: user.department,
          completedTasks,
          totalTasks,
          completionRate,
          avgProgress
        }
      })
      .filter(p => p.totalTasks > 0)
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time insights into team performance and task metrics
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role !== 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.onTime} of {stats.total} tasks on time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current breakdown of task statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
            <CardDescription>Breakdown by priority levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getPriorityData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Task Progress</CardTitle>
            <CardDescription>Task completion trends over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getWeeklyProgress()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Task completion rates by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDepartmentPerformance()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completionRate" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Team members with highest task completion rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getTopPerformers().map((performer, index) => (
              <div key={performer.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{performer.name}</div>
                    <div className="text-sm text-muted-foreground">{performer.department}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{performer.completionRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">
                    {performer.completedTasks}/{performer.totalTasks} tasks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Task Progress Overview</CardTitle>
          <CardDescription>Real-time progress tracking across all tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getWeeklyProgress()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="completionRate" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
