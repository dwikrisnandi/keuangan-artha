import { useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'

export function useNotificationEngine(metrics) {
  const { addNotification, isNotificationsEnabled } = useNotifications()

  useEffect(() => {
    if (!isNotificationsEnabled || !metrics) return

    // 1. Budget Alerts
    const income = metrics.total_income || 0
    const expense = metrics.total_expense || 0

    if (income > 0) {
      // 50/30/20 Rule: 50% Needs, 30% Wants, 20% Savings
      const needsLimit = income * 0.5
      const wantsLimit = income * 0.3
      
      // Calculate needs/wants usage (assuming proportional or specific categories)
      // Since we don't have category breakdown in metrics easily, we will do a global check:
      // If total expense > 80% of income (needs + wants combined limit)
      if (expense > (income * 0.8)) {
        addNotification({
          id: `budget_alert_critical_${new Date().getMonth()}`,
          type: 'warning',
          title: 'Critical Budget Alert',
          message: 'Your total expenses have exceeded 80% of this month\'s income. Consider reducing your expenses.'
        })
      } else if (expense > (income * 0.5)) {
        addNotification({
          id: `budget_alert_warning_${new Date().getMonth()}`,
          type: 'info',
          title: 'Budget Warning',
          message: 'Your expenses have exceeded 50% of this month\'s income.'
        })
      }
    }

    // 2. Inactivity Check
    // If no recent transactions, we can alert them.
    // For now, if metrics.balance == 0 and income == 0 and expense == 0
    if (metrics.balance === 0 && income === 0 && expense === 0) {
      addNotification({
        id: `welcome_or_empty_${new Date().getMonth()}`,
        type: 'success',
        title: 'Welcome to Artha!',
        message: 'Start recording your first income and expenses this month to track your financial health.'
      })
    }

  }, [metrics, addNotification, isNotificationsEnabled])
}
