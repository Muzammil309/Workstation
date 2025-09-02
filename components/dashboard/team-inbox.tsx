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
import { useNotificationTriggers } from '@/lib/notification-context'
import { useInbox } from '@/lib/inbox-context'
import { ErrorBoundary, DashboardErrorFallback } from '@/components/error-boundary'
import { useUsers } from '@/hooks/use-users'

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
  const { notifyMessageReceived } = useNotificationTriggers()
  const { setUnreadMessageCount, incrementUnreadCount, resetUnreadCount } = useInbox()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [chatMode, setChatMode] = useState<'team' | 'individual'>('team')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [individualMessages, setIndividualMessages] = useState<Record<string, Message[]>>({})
  const isMountedRef = useRef(true)

  // ✅ Load messages from cache immediately on mount
  useEffect(() => {
    const cachedMessages = localStorage.getItem('team_messages')
    if (cachedMessages) {
      try {
        const parsed = JSON.parse(cachedMessages)
        setMessages(parsed)
        console.log('🚀 Loaded', parsed.length, 'team messages from cache on mount')
      } catch (error) {
        console.error('Failed to parse cached team messages:', error)
      }
    }

    // Load individual chat cache
    const cachedIndividualChats = localStorage.getItem('individual_messages')
    if (cachedIndividualChats) {
      try {
        const parsed = JSON.parse(cachedIndividualChats)
        setIndividualMessages(parsed)
        console.log('🚀 Loaded individual chats from cache on mount')
      } catch (error) {
        console.error('Failed to parse cached individual messages:', error)
      }
    }
  }, [])

  // ✅ ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    if (!user?.id) return

    console.log('🔄 TeamInbox: Initializing for user:', user.id)
    loadMessages()
    loadUsers()

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('team_messages_realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_messages' },
        (payload) => {
          console.log('📨 New message received:', payload.new)
          const newMessage = payload.new as Message

          // Only update state if component is still mounted
          if (isMountedRef.current) {
            // Add message to state and cache
            setMessages(prev => {
              // Prevent duplicates
              if (prev.find(m => m.id === newMessage.id)) {
                return prev
              }
              const updated = [...prev, newMessage].sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
              // Immediately cache the updated messages
              localStorage.setItem('team_messages', JSON.stringify(updated))
              return updated
            })

            // If message is from another user, trigger notification
            if (newMessage.sender_id !== user?.id) {
              setUnreadCount(prev => {
                const newCount = prev + 1
                setUnreadMessageCount(newCount)
                return newCount
              })

              // Trigger notification through our notification system
              try {
                notifyMessageReceived(
                  newMessage.sender_name,
                  newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : '')
                )

                // Also show legacy notification
                showNotification(
                  `New message from ${newMessage.sender_name}`,
                  newMessage.content.substring(0, 100) + (newMessage.content.length > 100 ? '...' : '')
                )
              } catch (error) {
                console.error('Failed to trigger message notification:', error)
              }
            }
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'team_messages' },
        (payload) => {
          console.log('📝 Message updated:', payload.new)
          const updatedMessage = payload.new as Message
          // Only update state if component is still mounted
          if (isMountedRef.current) {
            setMessages(prev => {
              const updated = prev.map(msg =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
              // Cache the updated messages
              localStorage.setItem('team_messages', JSON.stringify(updated))
              return updated
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsConnected(status === 'SUBSCRIBED')
        }
      })

    return () => {
      console.log('🔌 Unsubscribing from team messages')
      supabase.removeChannel(subscription)
    }
  }, [user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Reset unread count when component is active
  useEffect(() => {
    resetUnreadCount()
    setUnreadCount(0)
  }, [])

  // Save messages to cache whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('team_messages', JSON.stringify(messages))
      console.log('💾 Cached', messages.length, 'messages to localStorage')
    }
  }, [messages])

  // Cleanup: Save messages on unmount and set mounted ref
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      // Use a ref to get the latest messages value
      const currentMessages = JSON.parse(localStorage.getItem('team_messages') || '[]')
      if (currentMessages.length > 0) {
        console.log('🔄 Messages already cached on unmount')
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      console.log('📥 Loading messages from database...')

      const { data, error } = await supabase
        .from('team_messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.log('⚠️ Database query failed:', error)
        // Try to load from localStorage as fallback
        const cachedMessages = localStorage.getItem('team_messages')
        if (cachedMessages) {
          const parsed = JSON.parse(cachedMessages)
          setMessages(parsed)
          console.log('📦 Loaded', parsed.length, 'messages from cache')
        } else {
          // Set demo messages if no cache
          const demoMessages: Message[] = [
            {
              id: 'demo-1',
              content: 'Welcome to the team inbox! This is where team communication happens.',
              sender_id: 'system',
              sender_name: 'System',
              sender_email: 'system@changeMechanics.com',
              created_at: new Date(Date.now() - 60000).toISOString(),
              is_read: false,
              message_type: 'system'
            }
          ]
          setMessages(demoMessages)
          console.log('📝 Set demo messages')
        }
      } else {
        setMessages(data || [])
        // Cache messages in localStorage
        localStorage.setItem('team_messages', JSON.stringify(data || []))
        console.log('✅ Loaded', data?.length || 0, 'messages from database')
      }

      // Count unread messages
      const currentMessages = data || JSON.parse(localStorage.getItem('team_messages') || '[]')
      const unread = currentMessages.filter((msg: Message) => !msg.is_read && msg.sender_id !== user?.id).length || 0
      setUnreadCount(unread)
      setUnreadMessageCount(unread)
      console.log('📊 Unread messages:', unread)

    } catch (error: any) {
      console.error('❌ Error loading messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages. Using cached data if available.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      // Use shared cache via useUsers to avoid duplicate queries
      const { users: cached } = useUsers()
      // Exclude current user and coerce to local type shape
      const filtered = (cached || [])
        .filter(u => u.id !== user?.id)
        .map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role || 'user' }))
      setUsers(filtered)
    } catch (error: any) {
      console.error('Error loading users:', error)
    }
  }

  const loadIndividualMessages = async (otherUserId: string) => {
    try {
      console.log('📥 Loading individual messages with user:', otherUserId)

      const { data, error } = await supabase
        .from('individual_messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user?.id})`)
        .order('created_at', { ascending: true })

      if (error) {
        console.log('⚠️ Database query failed for individual messages:', error)
        // Try to load from localStorage as fallback
        const cachedKey = `individual_messages_${otherUserId}`
        const cachedMessages = localStorage.getItem(cachedKey)
        if (cachedMessages) {
          const parsed = JSON.parse(cachedMessages)
          setIndividualMessages(prev => ({ ...prev, [otherUserId]: parsed }))
          console.log('📦 Loaded', parsed.length, 'individual messages from cache')
        }
        return
      }

      const messagesData = data || []
      setIndividualMessages(prev => ({ ...prev, [otherUserId]: messagesData }))

      // Cache individual messages
      const cachedKey = `individual_messages_${otherUserId}`
      localStorage.setItem(cachedKey, JSON.stringify(messagesData))
      localStorage.setItem('individual_messages', JSON.stringify({ ...individualMessages, [otherUserId]: messagesData }))

      console.log('📥 Loaded', messagesData.length, 'individual messages from database')
    } catch (error: any) {
      console.error('Error loading individual messages:', error)
    }
  }

  const sendIndividualMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    console.log('📤 Attempting to send individual message to:', selectedUser.name)

    try {
      const messageData = {
        content: newMessage.trim(),
        sender_id: user?.id,
        sender_name: user?.name || user?.email || 'Unknown',
        recipient_id: selectedUser.id,
        recipient_name: selectedUser.name,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('individual_messages')
        .insert([messageData])
        .select()
        .single()

      if (error) throw error

      // Update local state
      setIndividualMessages(prev => ({
        ...prev,
        [selectedUser.id]: [...(prev[selectedUser.id] || []), data]
      }))

      // Cache the updated messages
      const updatedMessages = [...(individualMessages[selectedUser.id] || []), data]
      const cachedKey = `individual_messages_${selectedUser.id}`
      localStorage.setItem(cachedKey, JSON.stringify(updatedMessages))
      localStorage.setItem('individual_messages', JSON.stringify({ ...individualMessages, [selectedUser.id]: updatedMessages }))

      setNewMessage('')
      console.log('✅ Individual message sent successfully')

    } catch (error: any) {
      console.error('❌ Error sending individual message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  const sendMessage = async () => {
    if (chatMode === 'individual') {
      return sendIndividualMessage()
    }

    if (!newMessage.trim()) return

    console.log('📤 Attempting to send team message:', newMessage.trim())

    try {
      const messageData = {
        content: newMessage.trim(),
        sender_id: user?.id || '',
        sender_name: user?.name || user?.email || 'Unknown',
        sender_email: user?.email || '',
        message_type: 'text' as const,
        is_read: false,
        created_at: new Date().toISOString()
      }

      console.log('📤 Message data:', messageData)

      // Try to insert into database
      try {
        const { data, error } = await supabase
          .from('team_messages')
          .insert([messageData])
          .select()
          .single()

        if (error) {
          console.error('Database insert error:', error)
          throw error
        }

        console.log('✅ Message saved to database:', data)
        setMessages(prev => {
          const updated = [...prev, data]
          // Update cache
          localStorage.setItem('team_messages', JSON.stringify(updated))
          return updated
        })
      } catch (dbError) {
        console.log('⚠️ Database save failed, adding to local state:', dbError)

        // Fallback: Add to local state with generated ID
        const localMessage: Message = {
          ...messageData,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
          message_type: 'text' as const
        }

        setMessages(prev => {
          const updated = [...prev, localMessage]
          // Update cache
          localStorage.setItem('team_messages', JSON.stringify(updated))
          return updated
        })
        console.log('📝 Message added to local state:', localMessage)
      }

      setNewMessage('')

      toast({
        title: "Message sent",
        description: "Your message has been sent to the team",
      })
    } catch (error: any) {
      console.error('❌ Error sending message:', error)
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message || 'Unknown error'}`,
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

  const getCurrentMessages = () => {
    if (chatMode === 'individual' && selectedUser) {
      return individualMessages[selectedUser.id] || []
    }
    return messages
  }

  const filteredMessages = getCurrentMessages().filter(message =>
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

  // ✅ Conditional return AFTER all hooks are declared
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access the team inbox.</p>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-emphasis">
              {chatMode === 'team' ? 'Team Inbox' : selectedUser ? `Chat with ${selectedUser.name}` : 'Individual Chat'}
            </h1>
            <p className="text-subtle">
              {chatMode === 'team' ? 'Real-time team communication' : 'Private conversation'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chat Mode Toggle */}
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={chatMode === 'team' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setChatMode('team')
                setSelectedUser(null)
              }}
              className="text-xs"
            >
              Team Chat
            </Button>
            <Button
              variant={chatMode === 'individual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChatMode('individual')}
              className="text-xs"
            >
              Individual Chat
            </Button>
          </div>

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

      {/* User Selection for Individual Chat */}
      {chatMode === 'individual' && (
        <Card className="surface-3">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Select a team member to chat with:</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUser?.id === user.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user)
                    loadIndividualMessages(user.id)
                  }}
                  className="justify-start text-left"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                      {getUserInitials(user.name)}
                    </div>
                    <span className="truncate">{user.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            {chatMode === 'individual' && !selectedUser ? (
              <div className="text-center text-muted-foreground py-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select a team member to start chatting</p>
              </div>
            ) : (
              <>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder={
                        chatMode === 'individual' && selectedUser
                          ? `Message ${selectedUser.name}...`
                          : "Type your team message..."
                      }
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
                    disabled={!newMessage.trim() || (chatMode === 'individual' && !selectedUser)}
                    className="px-4 py-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-subtle">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>{users.length} team members online</span>
                </div>
              </>
            )}
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
