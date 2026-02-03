'use client'

import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { removeNotification } from '@/lib/redux/slices/ui-slice'
import { useEffect } from 'react'

export function Toaster() {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector((state) => state.ui.notifications)

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 max-w-sm pointer-events-none">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => dispatch(removeNotification(notification.id))}
        />
      ))}
    </div>
  )
}

function Toast({
  notification,
  onClose,
}: {
  notification: (typeof notifications)[0]
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: 'bg-success',
    error: 'bg-destructive',
    info: 'bg-primary',
    warning: 'bg-accent',
  }[notification.type]

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg pointer-events-auto animate-fade-in`}
      role="alert"
    >
      {notification.message}
    </div>
  )
}
