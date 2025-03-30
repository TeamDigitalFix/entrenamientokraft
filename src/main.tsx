
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Para evitar problemas con la recarga en producción
const basename = document.querySelector('base')?.getAttribute('href') || '/';

createRoot(document.getElementById("root")!).render(<App />);
