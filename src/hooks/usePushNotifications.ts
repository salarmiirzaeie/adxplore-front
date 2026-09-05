import { useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { registerPushToken } from '../api/push'
import { getFirebaseMessaging, isFirebaseConfigured } from '../lib/firebase'
import { registerServiceWorker } from '../lib/register-service-worker'

const TOKEN_KEY = 'adxplore-fcm-token'

export function usePushNotifications(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !isFirebaseConfigured()) return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    let unsubscribe: (() => void) | undefined
    let cancelled = false

    void (async () => {
      const permission =
        Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission
      if (permission !== 'granted' || cancelled) return

      const registration = await registerServiceWorker()
      const messaging = await getFirebaseMessaging()
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
      if (!registration || !messaging || !vapidKey || cancelled) return

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      })
      if (!token || cancelled) return

      await registerPushToken(token)
      localStorage.setItem(TOKEN_KEY, token)

      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || 'ادکسپلور'
        const body = payload.notification?.body || payload.data?.body || ''
        if (document.visibilityState === 'visible') return
        void registration.showNotification(title, {
          body,
          icon: '/icons/icon-192.png',
          data: { url: payload.data?.url || '/app/notifications' },
        })
      })
    })().catch(() => undefined)

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [enabled])
}
