// Enhanced notification utility functions with alarming sounds
export const playNotificationSound = (type: 'default' | 'urgent' | 'alert' | 'bell' | 'chime' | 'ding' | 'pop' | 'swoosh' = 'default') => {
  try {
    // Try to play a notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    switch (type) {
      case 'bell':
        // Gentle bell sound
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.3)
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.4)
        break
        
      case 'chime':
        // Pleasant chime sound
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
        
      case 'ding':
        // Short ding sound
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
        break
        
      case 'pop':
        // Quick pop sound
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.05)
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
        break
        
      case 'swoosh':
        // Smooth swoosh sound
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.4)
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        break
        
      case 'urgent':
        // High-pitched, rapid beeping for urgent notifications
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3)
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.4)
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        break
        
      case 'alert':
        // Siren-like sound for high-alert notifications
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.4)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.6)
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.8)
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 1.0)
        break
        
      default:
        // Standard notification sound
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
        break
    }
  } catch (error) {
    console.log('Web Audio API not supported, using fallback')
    // Fallback: try to use browser's built-in notification
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('TaskFlow', {
          body: 'New notification',
          icon: '/favicon.ico'
        })
      }
    } catch (fallbackError) {
      console.log('Fallback notification failed')
    }
  }
}

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

export const showNotification = (title: string, body: string, type: 'default' | 'urgent' | 'alert' = 'default') => {
  // Play sound based on notification type
  playNotificationSound(type)
  
  // Show browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: type, // Group notifications by type
      requireInteraction: type === 'alert' // High-alert notifications require user interaction
    })
  }
}

// Convenience functions for different notification types
export const showUrgentNotification = (title: string, body: string) => {
  showNotification(title, body, 'urgent')
}

export const showAlertNotification = (title: string, body: string) => {
  showNotification(title, body, 'alert')
}

// Function to play custom notification sound based on user preferences
export const playCustomNotificationSound = (soundType: string, userPreferences?: any) => {
  // If user has custom sound preferences, use them
  if (userPreferences?.notificationSounds?.[soundType]) {
    const customSound = userPreferences.notificationSounds[soundType]
    playNotificationSound(customSound as any)
  } else {
    // Fall back to default sound for the type
    playNotificationSound(soundType as any)
  }
}

// Function to get user's preferred sound for a notification type
export const getUserPreferredSound = (soundType: string, userPreferences?: any): string => {
  return userPreferences?.notificationSounds?.[soundType] || soundType
}
