import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { setCurrency as apiSetCurrency } from '../utils/api'
import { useToast } from './ToastContext'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  
  const [currencyCode, setCurrencyCode] = useState(user?.currency_code || '')
  
  useEffect(() => {
    if (user && user.currency_code) {
      setCurrencyCode(user.currency_code)
    }
  }, [user])

  const changeCurrency = async (newCode) => {
    try {
      if (!user) return
      
      setCurrencyCode(newCode)
      
      const res = await apiSetCurrency(user.id, newCode)
      if (res.success) {
        const raw = localStorage.getItem('artha_user')
        if (raw) {
          const parsed = JSON.parse(raw)
          parsed.currency_code = newCode
          localStorage.setItem('artha_user', JSON.stringify(parsed))
        }
      } else {
        throw new Error(res.message || 'Failed to save currency preference')
      }
    } catch (err) {
      setCurrencyCode(user?.currency_code || '')
      addToast(err.message, 'error')
    }
  }

  const value = useMemo(() => ({
    currencyCode,
    changeCurrency,
  }), [currencyCode])

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return ctx
}
