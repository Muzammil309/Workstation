"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { notificationService, Notification, NotificationEvent } from './notification-service'
import { useAuth } from '@/hooks/use-auth'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (event: NotificationEvent) => Promise<void>
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  deleteNotification: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  // Convenience methods for common notifications
  notifyTaskAssigned: (taskTitle: string, assignedBy: string) => Promise<void>
  notifyDeadlineApproaching: (taskTitle: string, hoursLeft: number) => Promise<void>
  notifyMessageReceived: (senderName: string, preview: string) => Promise<void>
  notifyTaskCompleted: (taskTitle: string, completedBy: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [soundEnabled, setSoundEnabledState] = useState(true)
  const { user } = useAuth()
  const isMountedRef = useRef(true)

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return

    try {
      const loadedNotifications = await notificationService.loadNotifications(user.id)
      setNotifications(loadedNotifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }, [user?.id])

  // Load initial notifications
  useEffect(() => {
    if (user?.id) {
      loadNotifications()

      // Subscribe to real-time notifications
      const unsubscribe = notificationService.subscribeToNotifications(
        user.id,
        (notification) => {
          // Only update state if component is still mounted
          if (isMountedRef.current) {
            setNotifications(prev => [notification, ...prev])
          }
        }
      )

      return unsubscribe
    }
  }, [user?.id, loadNotifications])

  // Cleanup effect to prevent state updates after unmounting
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const addNotification = async (event: NotificationEvent) => {
    if (!user?.id) return
    
    try {
      const notification = await notificationService.createNotification({
        ...event,
        userId: user.id
      })
      setNotifications(prev => [notification, ...prev])
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ))
    notificationService.markAsRead(id)
  }

  const markAsUnread = (id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, isRead: false } : notification
    ))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
    notificationService.deleteNotification(id)
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })))
    notifications.forEach(notification => {
      if (!notification.isRead) {
        notificationService.markAsRead(notification.id)
      }
    })
  }

  const clearAll = () => {
    notifications.forEach(notification => {
      notificationService.deleteNotification(notification.id)
    })
    setNotifications([])
  }

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled)
    notificationService.setSoundEnabled(enabled)
  }

  // Convenience methods
  const notifyTaskAssigned = async (taskTitle: string, assignedBy: string) => {
    if (!user?.id) return
    await notificationService.notifyTaskAssigned(user.id, taskTitle, assignedBy)
  }

  const notifyDeadlineApproaching = async (taskTitle: string, hoursLeft: number) => {
    if (!user?.id) return
    await notificationService.notifyDeadlineApproaching(user.id, taskTitle, hoursLeft)
  }

  const notifyMessageReceived = async (senderName: string, preview: string) => {
    if (!user?.id) return
    await notificationService.notifyMessageReceived(user.id, senderName, preview)
  }

  const notifyTaskCompleted = async (taskTitle: string, completedBy: string) => {
    if (!user?.id) return
    await notificationService.notifyTaskCompleted(user.id, taskTitle, completedBy)
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    clearAll,
    soundEnabled,
    setSoundEnabled,
    notifyTaskAssigned,
    notifyDeadlineApproaching,
    notifyMessageReceived,
    notifyTaskCompleted
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Hook for triggering notifications from components
export function useNotificationTriggers() {
  const { 
    notifyTaskAssigned, 
    notifyDeadlineApproaching, 
    notifyMessageReceived, 
    notifyTaskCompleted,
    addNotification 
  } = useNotifications()

  return {
    notifyTaskAssigned,
    notifyDeadlineApproaching,
    notifyMessageReceived,
    notifyTaskCompleted,
    addNotification
  }
}
