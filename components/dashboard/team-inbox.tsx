"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, Users, Bell, Search, MoreVertical, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { showNotification } from '@/lib/notifications'
import { ErrorBoundary, DashboardErrorFallback, useErrorHandler } from '@/components/error-boundary'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_email: string
  created_at: string
  is_read: boolean
  message_type: 'text' | 'system' | 'notification'
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

function TeamInboxContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { handleError } = useErrorHandler()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access the team inbox.</p>
      </div>
    )
  }

  useEffect(() => {
    loadMessages()
    loadUsers()
    
    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('team_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'team_messages' },
        (payload) => {
          const newMessage = payload.new as Message
          if (newMessage.sender_id !== user?.id) {
            setMessages(prev => [...prev, newMessage])
            setUnreadCount(prev => prev + 1)
            
            // Show notification and play sound
            showNotification(
              `New message from ${newMessage.sender_name}`,
              newMessage.content.substring(0, 100) + (newMessage.content.length > 100 ? '...' : '')
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('team_messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
      
      // Count unread messages
      const unread = data?.filter(msg => !msg.is_read && msg.sender_id !== user?.id).length || 0
      setUnreadCount(unread)
    } catch (error: any) {
      console.error('Error loading messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')

      if (error) throw error
      setUsers(data || [])
    } catch (error: any) {
      console.error('Error loading users:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const messageData = {
        content: newMessage.trim(),
        sender_id: user?.id || '',
        sender_name: user?.name || user?.email || 'Unknown',
        sender_email: user?.email || '',
        message_type: 'text',
        is_read: false
      }

      const { data, error } = await supabase
        .from('team_messages')
        .insert([messageData])
        .select()
        .single()

      if (error) throw error

      setMessages(prev => [...prev, data])
      setNewMessage('')
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the team",
      })
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('team_messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) throw error

      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error: any) {
      console.error('Error marking message as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('team_messages')
        .update({ is_read: true })
        .neq('sender_id', user?.id || '')

      if (error) throw error

      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })))
      setUnreadCount(0)
      
      toast({
        title: "All messages marked as read",
        description: "All messages have been marked as read",
      })
    } catch (error: any) {
      console.error('Error marking all messages as read:', error)
    }
  }

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-emphasis">Team Inbox</h1>
            <p className="text-subtle">Real-time team communication</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-2 py-1">
              {unreadCount} unread
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Bell className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="surface-3">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 surface-3">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {filteredMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex items-start space-x-3 ${
                    message.sender_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(message.sender_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-xs lg:max-w-md ${
                    message.sender_id === user.id ? 'text-right' : ''
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-emphasis">
                        {message.sender_id === user?.id ? 'You' : message.sender_name}
                      </span>
                      <span className="text-xs text-subtle">
                        {formatTime(message.created_at)}
                      </span>
                      {!message.is_read && message.sender_id !== user?.id && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    
                    <div
                      className={`p-3 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                      onClick={() => {
                        if (!message.is_read && message.sender_id !== user?.id) {
                          markAsRead(message.id)
                        }
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  className="min-h-[60px] resize-none"
                />
              </div>
              
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-subtle">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{users.length} team members online</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Export wrapped component with error boundary
export function TeamInbox() {
  return (
    <ErrorBoundary fallback={DashboardErrorFallback}>
      <TeamInboxContent />
    </ErrorBoundary>
  )
}
