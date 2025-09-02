"use client"

import { supabase } from './supabase'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  isRead: boolean
  userId: string
  actionUrl?: string
  eventType?: string
  eventData?: any
}

export interface NotificationEvent {
  type: 'task_assigned' | 'task_completed' | 'deadline_approaching' | 'message_received' | 'team_update' | 'system_alert'
  userId: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  data?: any
}

class NotificationService {
  private listeners: ((notification: Notification) => void)[] = []
  private soundEnabled = true

  // Play notification sound
  private playNotificationSound(type: Notification['type']) {
    if (!this.soundEnabled) return

    try {
      // Create audio context for different notification types
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      const frequencies = {
        info: [800, 600],
        success: [600, 800, 1000],
        warning: [400, 600, 400],
        error: [300, 200, 300]
      }

      const freq = frequencies[type] || frequencies.info
      
      freq.forEach((frequency, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
          oscillator.type = 'sine'
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.2)
        }, index * 100)
      })
    } catch (error) {
      console.log('Audio not supported:', error)
    }
  }

  // Create notification from event
  async createNotification(event: NotificationEvent): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: event.title,
      message: event.message,
      type: event.priority === 'high' ? 'error' : event.priority === 'medium' ? 'warning' : 'info',
      timestamp: new Date().toISOString(),
      isRead: false,
      userId: event.userId,
      actionUrl: event.actionUrl,
      eventType: event.type,
      eventData: event.data
    }

    // Try to save to database
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notification])

      if (error) {
        console.log('Failed to save notification to database:', error)
      }
    } catch (dbError) {
      console.log('Database not available, notification will be local only:', dbError)
    }

    // Play sound
    this.playNotificationSound(notification.type)

    // Notify listeners
    this.listeners.forEach(listener => listener(notification))

    return notification
  }

  // Load notifications from database
  async loadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.log('Failed to load notifications from database:', error)
      return this.getDefaultNotifications(userId)
    }
  }

  // Get default notifications for demo
  private getDefaultNotifications(userId: string): Notification[] {
    return [
      {
        id: '1',
        title: 'Welcome to Change Mechanics',
        message: 'Your task management dashboard is ready to use',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false,
        userId,
        eventType: 'system_alert'
      },
      {
        id: '2',
        title: 'Task Board Updated',
        message: 'New features have been added to the task board',
        type: 'info',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: false,
        userId,
        eventType: 'system_alert'
      }
    ]
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ isRead: true })
        .eq('id', notificationId)
    } catch (error) {
      console.log('Failed to update notification in database:', error)
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
    } catch (error) {
      console.log('Failed to delete notification from database:', error)
    }
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    this.listeners.push(callback)

    // Set up real-time subscription if Supabase is available
    try {
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `userId=eq.${userId}`
          }, 
          (payload) => {
            const notification = payload.new as Notification
            this.playNotificationSound(notification.type)
            callback(notification)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
        this.listeners = this.listeners.filter(l => l !== callback)
      }
    } catch (error) {
      console.log('Real-time notifications not available:', error)
      return () => {
        this.listeners = this.listeners.filter(l => l !== callback)
      }
    }
  }

  // Trigger specific notification events
  async notifyTaskAssigned(userId: string, taskTitle: string, assignedBy: string) {
    return this.createNotification({
      type: 'task_assigned',
      userId,
      title: 'Task Assigned',
      message: `You have been assigned to "${taskTitle}" by ${assignedBy}`,
      priority: 'medium',
      actionUrl: '/dashboard?tab=tasks'
    })
  }

  async notifyDeadlineApproaching(userId: string, taskTitle: string, hoursLeft: number) {
    return this.createNotification({
      type: 'deadline_approaching',
      userId,
      title: 'Deadline Approaching',
      message: `Task "${taskTitle}" is due in ${hoursLeft} hours`,
      priority: 'high',
      actionUrl: '/dashboard?tab=tasks'
    })
  }

  async notifyMessageReceived(userId: string, senderName: string, preview: string) {
    return this.createNotification({
      type: 'message_received',
      userId,
      title: 'New Message',
      message: `${senderName}: ${preview}`,
      priority: 'medium',
      actionUrl: '/dashboard?tab=inbox'
    })
  }

  async notifyTaskCompleted(userId: string, taskTitle: string, completedBy: string) {
    return this.createNotification({
      type: 'task_completed',
      userId,
      title: 'Task Completed',
      message: `"${taskTitle}" has been completed by ${completedBy}`,
      priority: 'low',
      actionUrl: '/dashboard?tab=tasks'
    })
  }

  // Sound settings
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled
  }
}

export const notificationService = new NotificationService()
