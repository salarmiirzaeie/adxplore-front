importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyD9K3i0epqijMTUhEJj51Xbv08O2LTSxX0',
  authDomain: 'adxplore.firebaseapp.com',
  projectId: 'adxplore',
  storageBucket: 'adxplore.firebasestorage.app',
  messagingSenderId: '910368391580',
  appId: '1:910368391580:web:243a5a0f4eb9a2d17c0859',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return

  const title = payload.data?.title || 'ادکسپلور'
  const body = payload.data?.body || ''
  const url = payload.data?.url || '/app/notifications'

  return self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url },
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url || '/app/notifications'
  const origin = self.location.origin
  const href = target.startsWith('http') ? target : `${origin}${target}`

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          void client.navigate(href)
          return client.focus()
        }
      }
      return self.clients.openWindow(href)
    }),
  )
})

const CACHE = 'adxplore-shell-v2'

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/.well-known/')) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone()
          void caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        return cached || caches.match('/index.html')
      }),
  )
})
