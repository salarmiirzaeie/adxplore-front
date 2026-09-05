import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | undefined
let messagingPromise: Promise<Messaging | null> | undefined

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return undefined
  if (!app) app = initializeApp(firebaseConfig)
  return app
}

export function getFirebaseMessaging() {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      const firebaseApp = getFirebaseApp()
      if (!firebaseApp) return null
      if (!(await isSupported())) return null
      return getMessaging(firebaseApp)
    })()
  }
  return messagingPromise
}
