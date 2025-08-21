"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts'
import { TrendingUp, Users, Clock, Target, CheckCircle, AlertCircle, Calendar, Filter, Download, RefreshCw, User, Award, Zap, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

// Real team data structure for analytics
interface UserTaskData {
  userId: string
  name: string
  role: string
  department: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  avgCompletionTime: number
  productivity: number
  weeklyProgress: Array<{ week: string; completed: number; total: number }>
  projectBreakdown: Array<{ project: string; tasks: number; completed: number }>
}

// Initialize empty array - will be populated with real data
// Note: useState can only be used inside React components

// Task status data will be calculated dynamically from userTaskData
const getTaskStatusData = (userData: UserTaskData[]) => [
  { 
    name: 'Pending', 
    value: userData.reduce((sum, user) => sum + user.pendingTasks, 0), 
    color: '#f59e0b' 
  },
  { 
    name: 'In Progress', 
    value: userData.reduce((sum, user) => sum + user.inProgressTasks, 0), 
    color: '#3b82f6' 
  },
  { 
    name: 'Completed', 
    value: userData.reduce((sum, user) => sum + user.completedTasks, 0), 
    color: '#10b981' 
  }
]

const weeklyProgressData = [
  { week: 'Week 1', planned: 20, actual: 18, efficiency: 90 },
  { week: 'Week 2', planned: 25, actual: 22, efficiency: 88 },
  { week: 'Week 3', planned: 30, actual: 28, efficiency: 93 },
  { week: 'Week 4', planned: 35, actual: 32, efficiency: 91 },
  { week: 'Week 5', planned: 40, actual: 38, efficiency: 95 },
  { week: 'Week 6', planned: 45, actual: 42, efficiency: 93 }
]

const projectPerformanceData = [
  { project: 'Frontend', completion: 85, efficiency: 92, teamSize: 4, avgTime: 6.2 },
  { project: 'Backend', completion: 78, efficiency: 88, teamSize: 3, avgTime: 7.8 },
  { project: 'Database', completion: 95, efficiency: 96, teamSize: 2, avgTime: 4.5 },
  { project: 'Testing', completion: 70, efficiency: 85, teamSize: 2, avgTime: 8.1 },
  { project: 'Deployment', completion: 60, efficiency: 75, teamSize: 3, avgTime: 9.2 }
]

const timeTrackingData = [
  { day: 'Mon', estimated: 8, actual: 7.5, efficiency: 94 },
  { day: 'Tue', estimated: 8, actual: 8.2, efficiency: 98 },
  { day: 'Wed', estimated: 8, actual: 7.8, efficiency: 98 },
  { day: 'Thu', estimated: 8, actual: 8.5, efficiency: 94 },
  { day: 'Fri', estimated: 6, actual: 6.0, efficiency: 100 }
]

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [dateRange, setDateRange] = useState('30')
  const [isLoading, setIsLoading] = useState(false)
  const [userTaskData, setUserTaskData] = useState<UserTaskData[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Load real data from Supabase
  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setIsDataLoading(true)
      
      // Load team members
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'active')
      
      if (usersError) throw usersError

      // Load tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
      
      if (tasksError) throw tasksError

      // Process data for analytics
      const analyticsData = users?.map(user => {
        const userTasks = tasks?.filter(task => task.assignee === user.name) || []
        const completedTasks = userTasks.filter(task => task.status === 'completed').length
        const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length
        const pendingTasks = userTasks.filter(task => task.status === 'pending').length
        const totalTasks = userTasks.length
        
        // Calculate productivity
        const productivity = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        
        // Calculate average completion time (placeholder for now)
        const avgCompletionTime = 6.5 // This would need actual time tracking data
        
        // Generate weekly progress (placeholder)
        const weeklyProgress = [
          { week: 'Week 1', completed: Math.floor(completedTasks * 0.3), total: Math.floor(totalTasks * 0.3) },
          { week: 'Week 2', completed: Math.floor(completedTasks * 0.4), total: Math.floor(totalTasks * 0.4) },
          { week: 'Week 3', completed: Math.floor(completedTasks * 0.2), total: Math.floor(totalTasks * 0.2) },
          { week: 'Week 4', completed: Math.floor(completedTasks * 0.1), total: Math.floor(totalTasks * 0.1) }
        ]
        
        // Generate project breakdown (placeholder)
        const projectBreakdown = [
          { project: 'Development', tasks: Math.floor(totalTasks * 0.6), completed: Math.floor(completedTasks * 0.6) },
          { project: 'Design', tasks: Math.floor(totalTasks * 0.3), completed: Math.floor(completedTasks * 0.3) },
          { project: 'Testing', tasks: Math.floor(totalTasks * 0.1), completed: Math.floor(completedTasks * 0.1) }
        ]

        return {
          userId: user.id,
          name: user.name,
          role: user.role,
          department: user.department,
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          avgCompletionTime,
          productivity,
          weeklyProgress,
          projectBreakdown
        }
      }) || []

      setUserTaskData(analyticsData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setIsDataLoading(false)
    }
  }

  const stats = [
    {
      title: 'Total Tasks',
      value: userTaskData.reduce((sum, user) => sum + user.totalTasks, 0).toString(),
      change: '+12%',
      changeType: 'positive',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Completed',
      value: userTaskData.reduce((sum, user) => sum + user.completedTasks, 0).toString(),
      change: '+8%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'In Progress',
      value: userTaskData.reduce((sum, user) => sum + user.inProgressTasks, 0).toString(),
      change: '-3%',
      changeType: 'negative',
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Team Members',
      value: userTaskData.length.toString(),
      change: '+2',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-600'
    }
  ]

  const filteredUserData = selectedUser === 'all' 
    ? userTaskData 
    : userTaskData.filter(user => user.userId === selectedUser)

  const overallStats = {
    totalTasks: filteredUserData.reduce((sum, user) => sum + user.totalTasks, 0),
    completedTasks: filteredUserData.reduce((sum, user) => sum + user.completedTasks, 0),
    avgProductivity: filteredUserData.reduce((sum, user) => sum + user.productivity, 0) / filteredUserData.length,
    avgCompletionTime: filteredUserData.reduce((sum, user) => sum + user.avgCompletionTime, 0) / filteredUserData.length
  }

  const generateUserProgressChart = (user: any) => {
    return user.weeklyProgress.map((week: any) => ({
      week: week.week,
      completed: week.completed,
      total: week.total,
      progress: (week.completed / week.total) * 100
    }))
  }

  const generateUserProjectChart = (user: any) => {
    return user.projectBreakdown.map((project: any) => ({
      project: project.project,
      completed: project.completed,
      total: project.tasks,
      progress: (project.completed / project.tasks) * 100
    }))
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track performance metrics and team productivity</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={refreshData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="all">All Users</option>
            {userTaskData.map(user => (
              <option key={user.userId} value={user.userId}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* User Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">User Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{overallStats.totalTasks}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{overallStats.completedTasks}</div>
            <div className="text-sm text-muted-foreground">Completed Tasks</div>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{Math.round(overallStats.avgProductivity)}%</div>
            <div className="text-sm text-muted-foreground">Avg Productivity</div>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{overallStats.avgCompletionTime.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">Avg Completion Time</div>
          </div>
        </div>

        {/* User Performance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Tasks</th>
                <th className="text-left p-2">Progress</th>
                <th className="text-left p-2">Productivity</th>
                <th className="text-left p-2">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredUserData.map((user) => (
                <tr key={user.userId} className="border-b hover:bg-muted/20">
                  <td className="p-2 font-medium">{user.name}</td>
                  <td className="p-2 text-muted-foreground">{user.role}</td>
                  <td className="p-2">{user.completedTasks}/{user.totalTasks}</td>
                  <td className="p-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(user.completedTasks / user.totalTasks) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.productivity >= 80 ? 'bg-green-100 text-green-800' :
                      user.productivity >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.productivity}%
                    </span>
                  </td>
                  <td className="p-2">{user.avgCompletionTime}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getTaskStatusData(userTaskData)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {getTaskStatusData(userTaskData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {getTaskStatusData(userTaskData).map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={weeklyProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="planned" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              <Area type="monotone" dataKey="actual" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
              <Line type="monotone" dataKey="efficiency" stroke="#ff7300" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Progress Charts */}
        {filteredUserData.length === 1 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Weekly Progress - {filteredUserData[0].name}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={generateUserProgressChart(filteredUserData[0])}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="total" fill="#3b82f6" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Project Breakdown - {filteredUserData[0].name}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={generateUserProjectChart(filteredUserData[0])}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="project" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="total" fill="#3b82f6" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}

        {/* Project Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Project Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completion" fill="#8884d8" name="Completion %" />
              <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency %" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Time Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Daily Time Tracking</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={timeTrackingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="estimated" stroke="#8884d8" name="Estimated Hours" />
              <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual Hours" />
              <Bar dataKey="efficiency" fill="#ff7300" fillOpacity={0.3} name="Efficiency %" />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">85%</div>
            <div className="text-sm text-muted-foreground">Overall Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">92%</div>
            <div className="text-sm text-muted-foreground">Team Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">78%</div>
            <div className="text-sm text-muted-foreground">On-Time Delivery</div>
          </div>
        </div>
      </motion.div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredUserData
            .sort((a, b) => b.productivity - a.productivity)
            .slice(0, 3)
            .map((user, index) => (
              <div key={user.userId} className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {index === 0 && <Award className="h-6 w-6 text-yellow-500 mr-2" />}
                  {index === 1 && <Award className="h-6 w-6 text-gray-400 mr-2" />}
                  {index === 2 && <Award className="h-6 w-6 text-orange-500 mr-2" />}
                  <span className="text-lg font-semibold">#{index + 1}</span>
                </div>
                <div className="text-xl font-bold">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.role}</div>
                <div className="text-2xl font-bold text-green-600 mt-2">{user.productivity}%</div>
                <div className="text-xs text-muted-foreground">Productivity</div>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  )
}
