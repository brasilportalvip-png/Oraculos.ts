// ==============================================================================
// ORACULOS.TS — Service Worker PWA de Produção
// Versão: 2.4.0
// ==============================================================================

const CACHE_NAME = 'oraculos-ts-v2.4.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/brand/logo-oraculos.png',
  '/image/logo-oraculo.ts.png',
  '/favicon.ico',
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
    // Busca sempre direto da rede
    event.respondWith(fetch(event.request));
    return;
  }

  // Estratégia Stale-While-Revalidate para páginas e assets estáticos
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
        .catch(() => {
          // Se falhar a rede e não houver cache, se for navegação, retorna o cache da home
          if (event.request.mode === 'navigate' && cachedResponse) {
            return cachedResponse;
          }
          return caches.match('/index.html');
        });

      return cachedResponse || fetchPromise;
    })
  );
});
