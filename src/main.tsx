import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

const isTauri = '__TAURI_INTERNALS__' in window;

if ('serviceWorker' in navigator && import.meta.env.PROD && !isTauri) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/french-website/sw.js').catch(() => {
      // SW registration is best-effort; silently ignore failures
    });
  });
}
