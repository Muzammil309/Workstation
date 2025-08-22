"use client"

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="
        w-9 h-9 
        border-2 
        transition-all duration-200 
        hover:scale-110
        dark:border-gray-600 dark:hover:border-gray-400
        dark:bg-gray-800 dark:hover:bg-gray-700
        dark:text-gray-200 dark:hover:text-white
        border-gray-300 hover:border-gray-400
        bg-white hover:bg-gray-50
        text-gray-900 hover:text-gray-700
        shadow-sm hover:shadow-md
      "
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
