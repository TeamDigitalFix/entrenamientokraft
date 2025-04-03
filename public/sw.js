
// Service Worker básico para gestionar la navegación
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Este service worker intercepta las solicitudes de navegación
// y devuelve la página principal para todas las rutas
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isNavigationRequest = event.request.mode === 'navigate';
  
  // Si es una solicitud de navegación y no es a un archivo o API
  if (isNavigationRequest && 
      !url.pathname.includes('.') && 
      !url.pathname.startsWith('/api/')) {
    
    event.respondWith(
      fetch('/index.html').catch(() => {
        return new Response('Fallback page', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
  }
});
