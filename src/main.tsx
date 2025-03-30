
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Para evitar problemas con la recarga en producción
const basename = document.querySelector('base')?.getAttribute('href') || '/';

// Agregar evento para verificar que siempre haya una conexión a la aplicación
window.addEventListener('load', () => {
  console.log('Aplicación cargada correctamente en la ruta:', window.location.pathname);
});

createRoot(document.getElementById("root")!).render(<App />);
