"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface InboxContextType {
  unreadMessageCount: number
  setUnreadMessageCount: (count: number) => void
  incrementUnreadCount: () => void
  resetUnreadCount: () => void
}

const InboxContext = createContext<InboxContextType | undefined>(undefined)

interface InboxProviderProps {
  children: ReactNode
}

export function InboxProvider({ children }: InboxProviderProps) {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  const incrementUnreadCount = () => {
    setUnreadMessageCount(prev => prev + 1)
  }

  const resetUnreadCount = () => {
    setUnreadMessageCount(0)
  }

  const value: InboxContextType = {
    unreadMessageCount,
    setUnreadMessageCount,
    incrementUnreadCount,
    resetUnreadCount
  }

  return (
    <InboxContext.Provider value={value}>
      {children}
    </InboxContext.Provider>
  )
}

export function useInbox() {
  const context = useContext(InboxContext)
  if (context === undefined) {
    throw new Error('useInbox must be used within an InboxProvider')
  }
  return context
}
