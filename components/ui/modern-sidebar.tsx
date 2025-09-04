"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  MessageSquare, 
  PenTool, 
  Settings, 
  Search,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  Calendar,
  BarChart3,
  Zap,
  FileText,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href: string
  badge?: number
  isActive?: boolean
  children?: SidebarItem[]
}

interface ModernSidebarProps {
  className?: string
  defaultCollapsed?: boolean
  onNavigate?: (href: string) => void
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    isActive: true
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    href: '/tasks',
    badge: 12
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    href: '/calendar'
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    href: '/team',
    badge: 3
  },
  {
    id: 'inbox',
    label: 'Team Inbox',
    icon: MessageSquare,
    href: '/inbox',
    badge: 8
  },
  {
    id: 'whiteboard',
    label: 'Whiteboard',
    icon: PenTool,
    href: '/whiteboard'
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Zap,
    href: '/automation'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics'
  },
  {
    id: 'files',
    label: 'Files',
    icon: FileText,
    href: '/files'
  }
]

const bottomItems: SidebarItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings'
  }
]

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  className,
  defaultCollapsed = false,
  onNavigate
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [activeItem, setActiveItem] = useState('dashboard')

  const handleItemClick = (item: SidebarItem) => {
    setActiveItem(item.id)
    onNavigate?.(item.href)
  }

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  }

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  }

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'relative h-screen bg-dark-bg-secondary border-r border-glass-border flex flex-col',
        'glass-morphism',
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">TaskFlow</h2>
                  <p className="text-xs text-text-muted">Workspace</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 hover:bg-glass-bg"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <motion.div
          variants={contentVariants}
          initial="collapsed"
          animate="expanded"
          className="p-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-glass-bg border-glass-border focus:border-brand-primary"
            />
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <motion.div
          variants={contentVariants}
          initial="collapsed"
          animate="expanded"
          className="px-4 pb-4"
        >
          <Button className="w-full bg-gradient-primary hover:opacity-90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </motion.div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              isCollapsed={isCollapsed}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-glass-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/api/placeholder/32/32" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-text-primary truncate">John Doe</p>
                <p className="text-xs text-text-muted truncate">john@company.com</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Items */}
      <div className="px-3 pb-4">
        {bottomItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            isCollapsed={isCollapsed}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>
    </motion.div>
  )
}

interface SidebarNavItemProps {
  item: SidebarItem
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive,
  isCollapsed,
  onClick
}) => {
  const Icon = item.icon

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        'hover:bg-glass-bg group relative',
        isActive && 'bg-gradient-primary text-white shadow-glow'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-5 h-5',
        isActive ? 'text-white' : 'text-text-muted group-hover:text-text-primary'
      )}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Label and Badge */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            variants={{
              expanded: { opacity: 1, x: 0 },
              collapsed: { opacity: 0, x: -20 }
            }}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="flex-1 flex items-center justify-between min-w-0"
          >
            <span className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'
            )}>
              {item.label}
            </span>
            
            {item.badge && item.badge > 0 && (
              <Badge 
                variant="secondary" 
                className={cn(
                  'ml-2 h-5 min-w-[20px] text-xs',
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-accent-blue/20 text-accent-blue'
                )}
              >
                {item.badge}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-dark-surface text-text-primary text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.label}
          {item.badge && item.badge > 0 && (
            <Badge variant="secondary" className="ml-2 h-4 text-xs bg-accent-blue/20 text-accent-blue">
              {item.badge}
            </Badge>
          )}
        </div>
      )}

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  )
}
