// Service Worker for 心リハ指導士問題集
// 開発中: ネットワークファースト（常に最新を取得）
const CACHE_NAME = 'shinriha-v2';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 常にネットワークから取得（開発中はキャッシュしない）
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
