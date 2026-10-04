import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
// Self-hosted fonts (no third-party requests)
import '@fontsource/anton/latin-400.css';
import '@fontsource/inter-tight/latin-400.css';
import '@fontsource/inter-tight/latin-500.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import './styles/index.css';

// The offline preview runs inside a sandboxed frame, so it keeps routes in memory.
const Router = import.meta.env.VITE_DEMO === 'true' ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <SettingsProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SettingsProvider>
    </Router>
  </StrictMode>
);
