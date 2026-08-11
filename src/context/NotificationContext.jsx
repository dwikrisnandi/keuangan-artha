import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  // Notifications list: { id, type, title, message, date, isRead }
  const [notifications, setNotifications] = useState([])
  
  // Settings toggle
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notifications_enabled')
    return saved !== 'false' // default true
  })

  // Load notifications from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('artha_notifications')
      if (saved) {
        setNotifications(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load notifications", e)
    }
  }, [])

  // Save to local storage whenever notifications change
  useEffect(() => {
    localStorage.setItem('artha_notifications', JSON.stringify(notifications))
  }, [notifications])

  // Save toggle preference
  useEffect(() => {
    localStorage.setItem('notifications_enabled', isNotificationsEnabled.toString())
  }, [isNotificationsEnabled])

  // Add a new notification
  const addNotification = useCallback((notification) => {
    if (!isNotificationsEnabled) return // Ignore if disabled

    setNotifications(prev => {
      // Prevent exact duplicates (by ID)
      if (prev.some(n => n.id === notification.id)) return prev
      
      const newNotif = {
        ...notification,
        isRead: false,
        date: new Date().toISOString()
      }
      return [newNotif, ...prev].slice(0, 50) // Keep last 50
    })
  }, [isNotificationsEnabled])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])
  
  // Mark single as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }, [])
  
  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const toggleNotifications = useCallback(() => {
    setIsNotificationsEnabled(prev => !prev)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isNotificationsEnabled,
      addNotification,
      markAllAsRead,
      markAsRead,
      clearAll,
      toggleNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
