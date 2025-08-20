"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TaskBoard } from '@/components/dashboard/task-board'
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard'
import { AdminPanel } from '@/components/dashboard/admin-panel'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ProjectsPanel } from '@/components/dashboard/projects-panel'
import { CalendarView } from '@/components/dashboard/calendar-view'
import { TeamManagement } from '@/components/dashboard/team-management'
import { ReportsPanel } from '@/components/dashboard/reports-panel'
import { TemplatesPanel } from '@/components/dashboard/templates-panel'
import { IntegrationsPanel } from '@/components/dashboard/integrations-panel'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Set to true by default for desktop
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false) // New state for collapsed sidebar
  const { user, isLoading } = useAuth()

  console.log('🔍 DashboardPage: Render with user:', user, 'isLoading:', isLoading)

  if (isLoading) {
    console.log('🔍 DashboardPage: Showing loading spinner')
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  if (!user) {
    console.log('🔍 DashboardPage: No user, returning null')
    // Redirect to login would happen here
    return null
  }

  console.log('🔍 DashboardPage: User authenticated, rendering dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <div>
            <TaskBoard />
          </div>
        )
      case 'projects':
        return <ProjectsPanel />
      case 'calendar':
        return <CalendarView />
      case 'team':
        return <TeamManagement />
      case 'analytics':
        return <AnalyticsDashboard />
      case 'reports':
        return <ReportsPanel />
      case 'templates':
        return <TemplatesPanel />
      case 'integrations':
        return <IntegrationsPanel />
      case 'admin':
        return user.role === 'admin' ? <AdminPanel /> : <div>Access Denied</div>
      default:
        return <TaskBoard />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRole={user.role}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "ml-16" : "ml-80"
      )}>
        <DashboardHeader
          user={{
            firstName: user.firstName || user.name?.split(' ')[0] || 'User',
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            role: user.role
          }}
          onMenuClick={() => setIsSidebarOpen(true)}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
