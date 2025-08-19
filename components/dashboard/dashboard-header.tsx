"use client"

import { motion } from 'framer-motion'
import { Menu, Bell, Search, User, LogOut, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { showNotification } from '@/lib/notifications'

interface DashboardHeaderProps {
  user: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
  onMenuClick: () => void
  onToggleSidebar?: () => void
  isSidebarCollapsed?: boolean
}

export function DashboardHeader({ user, onMenuClick, onToggleSidebar, isSidebarCollapsed }: DashboardHeaderProps) {
  const { logout } = useAuth()
  const router = useRouter()



  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={onToggleSidebar}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          )}
          
                     <div className="hidden md:flex items-center space-x-2">
             <div className="flex items-center space-x-2">
               <div className="text-lg font-bold text-black dark:text-white">cm</div>
               <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
             </div>
             <span className="text-xl font-bold gradient-text">Change Mechanics</span>
           </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, projects..."
              className="pl-10 bg-muted/50 border-0 focus:bg-background"
            />
          </div>
        </div>
        
        {/* Pakistan Time Display */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-lg">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono font-medium">
            Pakistan: {new Date().toLocaleTimeString('en-US', { 
              timeZone: 'Asia/Karachi',
              hour12: true,
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => showNotification("Test Notification", "This is a test notification with sound!")}
            title="Test Notification Sound"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <ThemeToggle />
          
          <div className="flex items-center space-x-2">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            
                         <Button
               variant="ghost"
               size="icon"
               onClick={handleLogout}
               className="hover:bg-destructive/10 hover:text-destructive"
             >
               <LogOut className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
