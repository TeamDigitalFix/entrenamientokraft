
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Para evitar problemas con la recarga en producción
const basename = document.querySelector('base')?.getAttribute('href') || '/';

// Registrar service worker para ayudar con la navegación
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registrado:', registration);
    }).catch(error => {
      console.log('SW error:', error);
    });
  });
}

// Agregar evento para verificar que siempre haya una conexión a la aplicación
window.addEventListener('load', () => {
  console.log('Aplicación cargada correctamente en la ruta:', window.location.pathname);
  
  // Si estamos en una ruta válida, guardarla
  if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
    sessionStorage.setItem('lastPath', window.location.pathname);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
