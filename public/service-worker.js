const STATIC_CACHE = 'vejr-static-v3'
const API_CACHE = 'vejr-api-v3'

const BASE = self.registration.scope

const ICONS = ['breeze', 'cloud', 'clouds', 'drizzle', 'drop', 'fog', 'moon-cloud', 'partly-cloudy', 'sleepy-moon', 'snow', 'sun', 'thunderstorm', 'wind']
  .map((name) => `${BASE}icons/weather/${name}.png`)

// Кладём в кэш всё, что нужно для работы без сети.
// Имена файлов от Vite содержат хеш, поэтому находим их в index.html и в CSS
async function precache() {
  const cache = await caches.open(STATIC_CACHE)
  await cache.addAll([BASE, `${BASE}index.html`, `${BASE}manifest.json`, `${BASE}icons/icon-192.png`, `${BASE}icons/icon-512.png`, ...ICONS])

  const html = await (await fetch(`${BASE}index.html`)).text()
  const assets = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)].map((m) => new URL(m[1], BASE).href)
  await cache.addAll(assets)

  for (const cssUrl of assets.filter((url) => url.endsWith('.css'))) {
    const css = await (await fetch(cssUrl)).text()
    const fonts = [...css.matchAll(/url\(([^)]+\.woff2)\)/g)].map((m) => new URL(m[1].replace(/['"]/g, ''), cssUrl).href)
    await cache.addAll(fonts)
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache())
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.hostname.endsWith('open-meteo.com') || url.hostname.endsWith('bigdatacloud.net')) {
    event.respondWith(networkFirst(request))
  } else if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request))
  }
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  const cache = await caches.open(STATIC_CACHE)
  cache.put(request, response.clone())
  return response
}

async function networkFirst(request) {
  const cache = await caches.open(API_CACHE)
  try {
    const response = await fetch(request)
    cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    throw new Error('Offline and no cached data')
  }
}