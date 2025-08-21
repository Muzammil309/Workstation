"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { X, LayoutDashboard, CheckSquare, BarChart3, Settings, Users, Plus, FolderOpen, Calendar, FileText, Copy, Link, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isOpen: boolean
  onClose: () => void
  userRole: string
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const navigationItems = [
  {
    id: 'tasks',
    label: 'Task Board',
    icon: CheckSquare,
    description: 'Manage and track tasks'
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    description: 'Organize tasks by projects'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    description: 'Schedule and deadlines'
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    description: 'Manage team members'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'View performance metrics'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    description: 'Generate detailed reports'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Manage your profile'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: Copy,
    description: 'Task and project templates'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Link,
    description: 'Connect external tools'
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    icon: Settings,
    description: 'System administration',
    adminOnly: true
  }
]

export function Sidebar({ activeTab, onTabChange, isOpen, onClose, userRole, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { theme } = useTheme()
  const filteredItems = navigationItems.filter(item => 
    !item.adminOnly || userRole === 'admin'
  )

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 20 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-background border-r shadow-lg transform transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-16" : "w-80"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "text-lg font-bold transition-colors duration-200",
                  theme === 'dark' ? "text-white" : "text-black"
                )}>cm</div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold gradient-text">Change Mechanics</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden md:flex"
                onClick={onToggleCollapse}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    if (window.innerWidth < 768) onClose()
                  }}
                  className={cn(
                    "w-full flex items-center rounded-lg text-left transition-all duration-200 hover:bg-accent",
                    isCollapsed 
                      ? "justify-center px-2 py-3" 
                      : "space-x-3 px-4 py-3",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="border-t p-4 space-y-2">
            <Button 
              className={cn("w-full", isCollapsed ? "px-2" : "")} 
              variant="neon"
              title={isCollapsed ? "New Task" : undefined}
            >
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">New Task</span>}
            </Button>
            
            <Button 
              className={cn("w-full", isCollapsed ? "px-2" : "")} 
              variant="outline"
              title={isCollapsed ? "New Project" : undefined}
            >
              <FolderOpen className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">New Project</span>}
            </Button>
            
            <Button 
              className={cn("w-full", isCollapsed ? "px-2" : "")} 
              variant="outline"
              title={isCollapsed ? "Schedule Event" : undefined}
            >
              <Calendar className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Schedule Event</span>}
            </Button>
            
            {userRole === 'admin' && (
              <Button 
                className={cn("w-full", isCollapsed ? "px-2" : "")} 
                variant="outline"
                title={isCollapsed ? "Add Team Member" : undefined}
              >
                <Users className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">Add Team Member</span>}
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className={cn(
              "text-xs text-muted-foreground",
              isCollapsed ? "text-center" : "text-center"
            )}>
              {!isCollapsed ? "Change Mechanics v1.0.0" : "v1.0.0"}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
