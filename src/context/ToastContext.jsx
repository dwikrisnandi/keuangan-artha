import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast])
  const error = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast])
  const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast])

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 w-full bg-bg-secondary border border-glass-border shadow-glass rounded-xl p-4 animate-slide-up pointer-events-auto"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-primary shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-primary shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-primary shrink-0" />}
            
            <p className="flex-1 text-sm font-medium text-text-primary">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-glass rounded-lg transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
