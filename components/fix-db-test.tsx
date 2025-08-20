"use client"

import { useEffect } from 'react'

export function FixDBTest() {
  useEffect(() => {
    // Find and remove the database connection testing element
    const testElement = document.querySelector('[class*="Testing Database Connection"]')
    if (testElement) {
      testElement.remove()
    }
    
    // Also try to find it by text content
    const elements = document.querySelectorAll('div')
    elements.forEach(el => {
      if (el.textContent?.includes('Testing Database Connection')) {
        el.remove()
      }
    })
  }, [])
  
  return null
}
