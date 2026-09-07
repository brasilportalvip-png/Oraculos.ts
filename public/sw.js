// ==============================================================================
// ORACULOS.TS — Service Worker PWA de Produção
// Versão: 2.7.1
// ==============================================================================

const CACHE_NAME = 'oraculos-ts-v2.7.1';
const OFFLINE_URL = '/index.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/brand/logo-oraculos.png',
  '/consultants/mestra-jurema-terra.webp',
  '/consultants/mestre-zahir-oriente.webp',
  '/consultants/guardia-morgana-lua.webp',
  '/consultants/guardiao-rowan-mata.webp',
  '/consultants/mestre-dante-sete-chaves.webp',
  '/image/logo-oraculo.ts.png',
  '/favicon.ico',
  '/favicon.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
];

// URLs que NUNCA devem ser cacheadas (dados privados, sessões, finanças, tokens e APIs de IA)
const NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /\/admin/,
  /\/painel/,
  /\/auth\//,
  /\/user\//,
  /\/finance\//,
  /mercadoPago/,
  /firestore/,
  /identitytoolkit/,
  /securetoken/,
  /token=/,
  /session=/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ORACULOS.TS SW] Precache parcial:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ORACULOS.TS SW] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora requisições não GET ou requisições para outros domínios
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Verifica se a URL é proibida de cachear
  const isPrivateOrApi = NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname + url.search));
  if (isPrivateOrApi) {
    // Busca sempre direto da rede e nunca devolve dados privados armazenados.
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        return (await caches.match(event.request)) || (await caches.match(OFFLINE_URL)) || Response.error();
      })
    );
    return;
  }

  // Stale-While-Revalidate somente para assets públicos. Um asset inexistente
  // nunca pode receber index.html, pois isso mascara 404 e quebra MIME types.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || fetchPromise;
    })
  );
});
