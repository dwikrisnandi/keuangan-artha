import { useState, useEffect } from 'react'
import { LogOut, KeyRound, Shield, Bell, Moon, Smartphone, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import BentoCard from '../components/ui/BentoCard'

export default function Settings() {
  const { user, logout } = useAuth()
  const { isNotificationsEnabled, toggleNotifications } = useNotifications()
  const [isDark, setIsDark] = useState(false)

  // Initialize theme from documentElement (set by index.html script)
  useEffect(() => {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark'
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    const newTheme = newIsDark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0 max-w-4xl">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-text-primary text-xl font-bold tracking-tight">Settings</h2>
        <p className="text-text-secondary text-sm">Manage your profile and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Info */}
        <BentoCard colSpan={1} md:colSpan={2} title="Account Information">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center shrink-0 border border-glass-border">
              <span className="text-2xl font-bold text-text-primary">
                {user?.access_code?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-1">Artha User</h3>
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
                <KeyRound className="w-4 h-4" />
                <span className="font-mono bg-bg-primary px-2 py-0.5 rounded border border-glass-border">
                  {user?.access_code}
                </span>
              </div>
              <p className="text-text-muted text-xs leading-relaxed max-w-md">
                This is your unique access code. Keep this code safe as it serves as your identity to log into the application.
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Security / Logout */}
        <BentoCard colSpan={1} title="Security">
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Shield className="w-5 h-5 text-emerald-primary" />
                <span>Active Encryption</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Smartphone className="w-5 h-5 text-text-primary" />
                <span>Current Device Session</span>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-primary/10 text-rose-primary font-semibold text-sm hover:bg-rose-primary hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </BentoCard>

        {/* Preferences */}
        <BentoCard colSpan={1} md:colSpan={3} title="App Preferences">
          <div className="divide-y divide-glass-border">
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center">
                  {isDark ? <Moon className="w-5 h-5 text-text-primary" /> : <Sun className="w-5 h-5 text-text-primary" />}
                </div>
                <div>
                  <h4 className="text-text-primary font-medium text-sm">Dark Mode</h4>
                  <p className="text-text-muted text-xs">Change the app theme for eye comfort</p>
                </div>
              </div>
              {/* Toggle switch */}
              <button 
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${isDark ? 'bg-emerald-primary' : 'bg-glass-border'}`}
                aria-label="Toggle Dark Mode"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isDark ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Notification Toggle */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center">
                  <Bell className="w-5 h-5 text-text-primary" />
                </div>
                <div>
                  <h4 className="text-text-primary font-medium text-sm">Reminders & Notifications</h4>
                  <p className="text-text-muted text-xs">Budget & activity alerts</p>
                </div>
              </div>
              <button 
                onClick={toggleNotifications}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${isNotificationsEnabled ? 'bg-emerald-primary' : 'bg-glass-border'}`}
                aria-label="Toggle Notifications"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isNotificationsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

          </div>
        </BentoCard>

      </div>
    </div>
  )
}
