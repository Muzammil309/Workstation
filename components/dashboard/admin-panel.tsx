"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Settings, Shield, Activity, UserPlus, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { UserManagement } from '@/components/dashboard/user-management'
import { useAuth } from '@/hooks/use-auth'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive'
  lastLogin: string
  tasksAssigned: number
  tasksCompleted: number
}

const sampleUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@taskflow.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-20',
    tasksAssigned: 15,
    tasksCompleted: 12
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@taskflow.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-19',
    tasksAssigned: 8,
    tasksCompleted: 6
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@taskflow.com',
    role: 'user',
    status: 'inactive',
    lastLogin: '2024-01-15',
    tasksAssigned: 5,
    tasksCompleted: 3
  }
]

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const { toast } = useToast()
  const { user: currentUser } = useAuth()

  // Only admins can access this panel
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
        <p className="text-gray-300">You don't have permission to access the admin panel.</p>
      </div>
    )
  }

  const stats = [
    {
      title: 'System Status',
      value: 'Healthy',
      icon: Settings,
      color: 'text-green-600'
    },
    {
      title: 'Database',
      value: 'Connected',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Security',
      value: 'Enabled',
      icon: Shield,
      color: 'text-purple-600'
    },
    {
      title: 'Last Backup',
      value: new Date().toLocaleDateString(),
      icon: Activity,
      color: 'text-blue-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, system settings, and monitor performance</p>
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
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'settings', label: 'System Settings', icon: Settings },
            { id: 'logs', label: 'Activity Logs', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <UserManagement />
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send email notifications for task updates</p>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Real-time Updates</p>
                  <p className="text-sm text-muted-foreground">Enable real-time task synchronization</p>
                </div>
                <input type="checkbox" className="w-4 h-4" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-backup</p>
                  <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'logs' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'User login', user: 'john@taskflow.com', time: '2 minutes ago', type: 'info' },
                { action: 'Task created', user: 'jane@taskflow.com', time: '5 minutes ago', type: 'success' },
                { action: 'User role updated', user: 'admin@taskflow.com', time: '10 minutes ago', type: 'warning' },
                { action: 'System backup', user: 'system', time: '1 hour ago', type: 'info' }
              ].map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">by {log.user}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
