import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { login as apiLogin } from '../utils/api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'artha_user'

/**
 * Read user from localStorage
 */
function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * AuthProvider — Wraps app with auth state
 * Provides: user, login(), logout(), isAuthenticated
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  const login = useCallback(async (accessCode) => {
    const res = await apiLogin(accessCode)
    const userData = res.data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated: !!user,
  }), [user, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth hook — access auth context
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
