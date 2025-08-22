"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TaskBoard } from '@/components/dashboard/task-board'
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard'
import AdminPanel from '@/components/dashboard/admin-panel'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ProjectsPanel } from '@/components/dashboard/projects-panel'
import { CalendarView } from '@/components/dashboard/calendar-view'
import { TeamManagement } from '@/components/dashboard/team-management'
import { ReportsPanel } from '@/components/dashboard/reports-panel'

import { IntegrationsPanel } from '@/components/dashboard/integrations-panel'
import { ProfilePanel } from '@/components/dashboard/profile-panel'
import { useAuth } from '@/hooks/use-auth'
import { LanguageProvider } from '@/lib/language-context'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Set to true by default for desktop
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false) // New state for collapsed sidebar
  const { user, isLoading, debugAuth } = useAuth()

  console.log('🔍 DashboardPage: Render with user:', user, 'isLoading:', isLoading)

  if (isLoading) {
    console.log('🔍 DashboardPage: Showing loading spinner')
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-blue mx-auto"></div>
          <div className="text-white">Loading dashboard...</div>
          <div className="text-gray-400 text-sm">
            Debug: isLoading = {isLoading ? 'true' : 'false'}, user = {user ? 'exists' : 'null'}
          </div>
          <div className="text-gray-400 text-xs">
            If this takes more than 5 seconds, there may be an authentication issue
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-colors"
          >
            Go to Login
          </button>
          <button 
            onClick={async () => {
              const debugInfo = await debugAuth()
              console.log('🔍 Dashboard Debug Info:', debugInfo)
              alert('Check console for debug info')
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Debug Auth
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('🔍 DashboardPage: No user, redirecting to login')
    // Force redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    )
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
      case 'profile':
        return <ProfilePanel />

      case 'integrations':
        return <IntegrationsPanel />
      case 'admin':
        return user.role === 'admin' ? <AdminPanel /> : <div>Access Denied</div>
      default:
        return (
          <div>
            <TaskBoard />
          </div>
        )
    }
  }

  return (
    <LanguageProvider>
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
    </LanguageProvider>
  )
}
