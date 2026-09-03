type InstagramOpenTarget = {
  url: string
  appUrl: string
  androidIntent: string
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent)
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as { standalone?: boolean }).standalone)
  )
}

function navigateTo(href: string) {
  if (isStandaloneDisplay() || isAndroid() || isIOS()) {
    window.location.href = href
    return
  }
  const opened = window.open(href, '_blank', 'noopener,noreferrer')
  if (!opened) {
    window.location.href = href
  }
}

/** Opens Instagram app when possible (PWA / TWA / iOS), else the https fallback. */
export function openInstagram(target: InstagramOpenTarget) {
  if (isAndroid() && target.androidIntent) {
    navigateTo(target.androidIntent)
    return
  }

  if (isIOS() && target.appUrl && target.appUrl !== target.url) {
    const started = Date.now()
    navigateTo(target.appUrl)
    window.setTimeout(() => {
      if (document.hidden) return
      if (Date.now() - started < 2500) navigateTo(target.url)
    }, 900)
    return
  }

  navigateTo(target.url)
}
