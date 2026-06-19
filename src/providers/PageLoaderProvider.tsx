'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

interface PageLoaderContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  navigate: (href: string) => void
}

const PageLoaderContext = createContext<PageLoaderContextType | undefined>(undefined)

export const PageLoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Whenever pathname changes (successful navigation), stop loading animation
    setIsLoading(false)
  }, [pathname])

  const navigate = (href: string) => {
    setIsLoading(true)
    router.push(href)
  }

  return (
    <PageLoaderContext.Provider 
      value={{ 
        isLoading, 
        startLoading: () => setIsLoading(true), 
        stopLoading: () => setIsLoading(false), 
        navigate 
      }}
    >
      {children}
      {isLoading && <LoadingScreen />}
    </PageLoaderContext.Provider>
  )
}

export const usePageLoader = () => {
  const context = useContext(PageLoaderContext)
  if (!context) {
    throw new Error('usePageLoader must be used within a PageLoaderProvider')
  }
  return context
}
