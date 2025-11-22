import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './app.css';
import { ThemeProvider } from './shared/components/layouts/ThemeProvider';
import { initDevToolsProtection, initDevToolsProtectionAdvanced } from './shared/utils/devtools-protection';
import { showConsoleWarning } from './consoleWarning';

import { TallerApp } from './TallerApp';

// 🚨 Mostrar advertencia de consola siempre (desarrollo y producción)
// Esto disuade a usuarios de copiar/pegar código malicioso
showConsoleWarning();

// Inicializar protección avanzada contra DevTools y código malicioso (solo en producción)
// Esto debe ejecutarse antes que cualquier otro código para prevenir que scripts externos usen la consola
if (import.meta.env.PROD) {
  // Ejecutar inmediatamente, antes de cualquier otro código
  initDevToolsProtection();
  
  // También ejecutar después de un pequeño delay para asegurar que se mantenga
  // (algunos scripts pueden intentar restaurar console después de la carga)
  setTimeout(() => {
    initDevToolsProtection();
  }, 100);
  
  // Usar la versión avanzada que usa MutationObserver en lugar de setInterval constante
  // Esto es más eficiente y consume menos recursos
  setTimeout(() => {
    initDevToolsProtectionAdvanced();
  }, 500);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TallerApp />
    </ThemeProvider>
  </StrictMode>
);
