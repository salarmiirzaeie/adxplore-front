let registrationPromise: Promise<ServiceWorkerRegistration | undefined> | undefined

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return Promise.resolve(undefined)
  if (!('serviceWorker' in navigator)) return Promise.resolve(undefined)

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => registration)
      .catch(() => undefined)
  }

  return registrationPromise
}
