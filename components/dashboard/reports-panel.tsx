"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Filter, Calendar, TrendingUp, Users, Target, BarChart3, PieChart, Activity, Clock, CheckCircle, X, ChevronDown, ChevronUp, Eye, Settings, RefreshCw, LineChart, BarChart, PieChart as PieChartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface Task {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  project: string
  deadline: string
  assignedOn: string
  actualTime?: string
  estimatedHours?: number
}

interface Project {
  id: string
  name: string
  status: 'planning' | 'active' | 'completed' | 'on-hold'
  progress: number
  startDate: string
  endDate: string
  teamSize: number
  totalTasks: number
  completedTasks: number
}

interface TeamMember {
  id: string
  name: string
  role: string
  totalTasks: number
  completedTasks: number
  avgCompletionTime: number
  productivity: number
}

export function ReportsPanel() {
  const { toast } = useToast()
  const [activeReport, setActiveReport] = useState<'task' | 'project' | 'team' | null>(null)
  const [dateRange, setDateRange] = useState('30')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [realTasks, setRealTasks] = useState<Task[]>([])
  const [realProjects, setRealProjects] = useState<Project[]>([])
  const [realTeamMembers, setRealTeamMembers] = useState<TeamMember[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Load real data from Supabase
  useEffect(() => {
    loadRealData()
  }, [])

  const loadRealData = async () => {
    try {
      setIsDataLoading(true)
      
      // Load tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
      
      if (tasksError) throw tasksError
      setRealTasks(tasks || [])

      // Load team members
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'active')
      
      if (usersError) throw usersError

      // Process team members data
      const teamMembersData = users?.map(user => {
        const userTasks = tasks?.filter(task => task.assignee === user.name) || []
        const completedTasks = userTasks.filter(task => task.status === 'completed').length
        const totalTasks = userTasks.length
        const productivity = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        
        return {
          id: user.id,
          name: user.name,
          role: user.role,
          totalTasks,
          completedTasks,
          avgCompletionTime: 6.5, // Placeholder
          productivity
        }
      }) || []
      
      setRealTeamMembers(teamMembersData)

      // Generate project data from tasks
      const projectData = [
        {
          id: '1',
          name: 'Development',
          status: 'active' as const,
          progress: 65,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          teamSize: users?.length || 0,
          totalTasks: tasks?.length || 0,
          completedTasks: tasks?.filter(t => t.status === 'completed').length || 0
        }
      ]
      setRealProjects(projectData)

    } catch (error) {
      console.error('Error loading real data:', error)
    } finally {
      setIsDataLoading(false)
    }
  }

  // Use real data instead of sample data
  const sampleTasks = realTasks
  const sampleProjects = realProjects
  const sampleTeamMembers = realTeamMembers

  const generateTaskPerformanceReport = () => {
    const filteredTasks = sampleTasks.filter(task => {
      const taskDate = new Date(task.assignedOn)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange))
      return taskDate >= cutoffDate
    })

    const totalTasks = filteredTasks.length
    const completedTasks = filteredTasks.filter(t => t.status === 'completed').length
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress').length
    const pendingTasks = filteredTasks.filter(t => t.status === 'pending').length

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const avgCompletionTime = filteredTasks
      .filter(t => t.actualTime && t.estimatedHours)
      .reduce((acc, t) => acc + (parseFloat(t.actualTime!.split(' ')[0]) - t.estimatedHours!), 0) / 
      filteredTasks.filter(t => t.actualTime && t.estimatedHours).length

    const priorityBreakdown = {
      high: filteredTasks.filter(t => t.priority === 'high').length,
      medium: filteredTasks.filter(t => t.priority === 'medium').length,
      low: filteredTasks.filter(t => t.priority === 'low').length
    }

    const projectBreakdown = filteredTasks.reduce((acc, task) => {
      acc[task.project] = (acc[task.project] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      type: 'Task Performance',
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionRate: Math.round(completionRate * 100) / 100,
        avgCompletionTime: Math.round(avgCompletionTime * 100) / 100
      },
      breakdowns: {
        priority: priorityBreakdown,
        project: projectBreakdown,
        status: { completed: completedTasks, 'in-progress': inProgressTasks, pending: pendingTasks }
      },
      tasks: filteredTasks
    }
  }

  const generateProjectAnalyticsReport = () => {
    const filteredProjects = sampleProjects.filter(project => {
      if (selectedProjects.length > 0 && !selectedProjects.includes(project.id)) return false
      return true
    })

    const totalProjects = filteredProjects.length
    const activeProjects = filteredProjects.filter(p => p.status === 'active').length
    const completedProjects = filteredProjects.filter(p => p.status === 'completed').length
    const avgProgress = filteredProjects.reduce((acc, p) => acc + p.progress, 0) / totalProjects

    const projectMetrics = filteredProjects.map(project => ({
      name: project.name,
      progress: project.progress,
      teamSize: project.teamSize,
      totalTasks: project.totalTasks,
      completedTasks: project.completedTasks,
      efficiency: project.totalTasks > 0 ? (project.completedTasks / project.totalTasks) * 100 : 0
    }))

    return {
      type: 'Project Analytics',
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        avgProgress: Math.round(avgProgress * 100) / 100
      },
      projects: projectMetrics,
      timeline: filteredProjects.map(p => ({
        name: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status
      }))
    }
  }

  const generateTeamInsightsReport = () => {
    const filteredMembers = sampleTeamMembers.filter(member => {
      if (selectedTeamMembers.length > 0 && !selectedTeamMembers.includes(member.id)) return false
      return true
    })

    const totalMembers = filteredMembers.length
    const avgProductivity = filteredMembers.reduce((acc, m) => acc + m.productivity, 0) / totalMembers
    const avgCompletionTime = filteredMembers.reduce((acc, m) => acc + m.avgCompletionTime, 0) / totalMembers

    const topPerformers = filteredMembers
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 3)

    const roleBreakdown = filteredMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      type: 'Team Insights',
      summary: {
        totalMembers,
        avgProductivity: Math.round(avgProductivity * 100) / 100,
        avgCompletionTime: Math.round(avgCompletionTime * 100) / 100
      },
      topPerformers,
      roleBreakdown,
      members: filteredMembers
    }
  }

  const generateReport = async (reportType: 'task' | 'project' | 'team') => {
    setIsGenerating(true)
    setActiveReport(reportType)

    // Simulate report generation
    setTimeout(() => {
      let data
      switch (reportType) {
        case 'task':
          data = generateTaskPerformanceReport()
          break
        case 'project':
          data = generateProjectAnalyticsReport()
          break
        case 'team':
          data = generateTeamInsightsReport()
          break
      }
      setReportData(data)
      setIsGenerating(false)
      toast({
        title: "Report Generated",
        description: `${data.type} report has been generated successfully`,
      })
    }, 2000)
  }

  const exportReport = (format: 'pdf' | 'csv' | 'json') => {
    if (!reportData) return

    let content = ''
    let filename = `${reportData.type.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}`

    switch (format) {
      case 'csv':
        content = generateCSV(reportData)
        filename += '.csv'
        break
      case 'json':
        content = JSON.stringify(reportData, null, 2)
        filename += '.json'
        break
      case 'pdf':
        // PDF generation would require a library like jsPDF
        toast({
          title: "PDF Export",
          description: "PDF export feature coming soon!",
        })
        return
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Report Exported",
      description: `Report exported as ${format.toUpperCase()} successfully`,
    })
  }

  const generateCSV = (data: any): string => {
    // Simple CSV generation for demonstration
    let csv = 'Report Type,Value\n'
    csv += `${data.type},Generated on ${new Date().toLocaleDateString()}\n\n`
    
    if (data.summary) {
      csv += 'Summary\n'
      Object.entries(data.summary).forEach(([key, value]) => {
        csv += `${key},${value}\n`
      })
    }
    
    return csv
  }

  const resetReport = () => {
    setActiveReport(null)
    setReportData(null)
    setSelectedProjects([])
    setSelectedTeamMembers([])
  }

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and insights for better decision making</p>
        </div>
        <div className="flex items-center space-x-3">
          {reportData && (
            <Button onClick={resetReport} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              New Report
            </Button>
          )}
          {reportData && (
            <div className="flex items-center space-x-2">
              <Button onClick={() => exportReport('pdf')} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => exportReport('csv')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportReport('json')} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Report Generation Cards */}
      {!activeReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => generateReport('task')}
          >
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">Task Performance</h3>
            <p className="text-muted-foreground mb-4">Detailed analysis of task completion rates, time tracking, and team performance metrics</p>
            <Button variant="outline" className="w-full">
              <Activity className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => generateReport('project')}
          >
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Project Analytics</h3>
            <p className="text-muted-foreground mb-4">Comprehensive project metrics, progress tracking, and timeline analysis</p>
            <Button variant="outline" className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => generateReport('team')}
          >
            <Users className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-semibold mb-2">Team Insights</h3>
            <p className="text-muted-foreground mb-4">Team productivity, collaboration metrics, and individual performance analysis</p>
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </motion.div>
        </div>
      )}

      {/* Report Configuration */}
      {activeReport && !reportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Configure Report Settings</h3>
            <Button onClick={resetReport} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            {activeReport === 'project' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Projects</label>
                <select
                  multiple
                  value={selectedProjects}
                  onChange={(e) => setSelectedProjects(Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm min-h-[100px]"
                >
                  {sampleProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple</p>
              </div>
            )}

            {activeReport === 'team' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Members</label>
                <select
                  multiple
                  value={selectedTeamMembers}
                  onChange={(e) => setSelectedTeamMembers(Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm min-h-[100px]"
                >
                  {sampleTeamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => generateReport(activeReport!)} 
              variant="neon"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Generated Report Display */}
      <AnimatePresence>
        {reportData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">{reportData.type} Report</h3>
                <p className="text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => exportReport('pdf')} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={() => exportReport('csv')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button onClick={() => exportReport('json')} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  JSON
                </Button>
              </div>
            </div>

                         {/* Report Summary */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
               {Object.entries(reportData.summary).map(([key, value]) => (
                 <div key={key} className="bg-muted/20 rounded-lg p-4 text-center">
                   <div className="text-2xl font-bold text-primary">{String(value)}</div>
                   <div className="text-sm text-muted-foreground capitalize">
                     {key.replace(/([A-Z])/g, ' $1').trim()}
                   </div>
                 </div>
               ))}
             </div>

            {/* Report Details */}
            <div className="space-y-6">
              {reportData.type === 'Task Performance' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Task Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                         <div className="bg-muted/20 rounded-lg p-4">
                       <h5 className="font-medium mb-2">Priority Distribution</h5>
                       {Object.entries(reportData.breakdowns.priority).map(([priority, count]) => (
                         <div key={priority} className="flex justify-between text-sm">
                           <span className="capitalize">{priority}</span>
                           <span className="font-medium">{String(count)}</span>
                         </div>
                       ))}
                     </div>
                                         <div className="bg-muted/20 rounded-lg p-4">
                       <h5 className="font-medium mb-2">Status Distribution</h5>
                       {Object.entries(reportData.breakdowns.status).map(([status, count]) => (
                         <div key={status} className="flex justify-between text-sm">
                           <span className="capitalize">{status}</span>
                           <span className="font-medium">{String(count)}</span>
                         </div>
                       ))}
                     </div>
                                         <div className="bg-muted/20 rounded-lg p-4">
                       <h5 className="font-medium mb-2">Project Distribution</h5>
                       {Object.entries(reportData.breakdowns.project).slice(0, 5).map(([project, count]) => (
                         <div key={project} className="flex justify-between text-sm">
                           <span className="truncate">{project}</span>
                           <span className="font-medium">{String(count)}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              )}

              {reportData.type === 'Project Analytics' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Project Metrics</h4>
                  <div className="space-y-3">
                    {reportData.projects.map((project: any) => (
                      <div key={project.name} className="bg-muted/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{project.name}</h5>
                          <span className="text-sm text-muted-foreground">{project.progress}% complete</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>Team: {project.teamSize}</div>
                          <div>Tasks: {project.completedTasks}/{project.totalTasks}</div>
                          <div>Efficiency: {Math.round(project.efficiency)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportData.type === 'Team Insights' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Team Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/20 rounded-lg p-4">
                      <h5 className="font-medium mb-3">Top Performers</h5>
                      {reportData.topPerformers.map((member: any, index: number) => (
                        <div key={member.id} className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span className="text-sm">{member.name}</span>
                          </div>
                          <span className="text-sm font-medium">{member.productivity}%</span>
                        </div>
                      ))}
                    </div>
                                         <div className="bg-muted/20 rounded-lg p-4">
                       <h5 className="font-medium mb-3">Role Distribution</h5>
                       {Object.entries(reportData.roleBreakdown).map(([role, count]) => (
                         <div key={role} className="flex justify-between text-sm mb-1">
                           <span>{role}</span>
                           <span className="font-medium">{String(count)}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
