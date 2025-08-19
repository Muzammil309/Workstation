// Notification utility functions
export const playNotificationSound = () => {
  try {
    // Try to play a notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume()
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

export const showNotification = (title: string, body: string) => {
  // Play sound
  playNotificationSound()
  
  // Show browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    })
  }
}
