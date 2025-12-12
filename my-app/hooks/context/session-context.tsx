'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatContextType {
  active: number | null
  setActive: (id: number | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <ChatContext.Provider value={{ active, setActive }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}