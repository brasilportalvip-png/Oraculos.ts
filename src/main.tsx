import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Register Service Worker in production
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js?v=2.8.0', { updateViaCache: 'none' })
      .then(async (reg) => {
        await reg.update();
        reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
        console.log('[ORACULOS.TS] Service Worker registrado:', reg.scope);
      })
      .catch((err) => {
        console.warn('[ORACULOS.TS] Falha ao registrar Service Worker:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
