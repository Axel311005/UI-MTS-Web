import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './app.css';
import { ThemeProvider } from './shared/components/layouts/ThemeProvider';
import { showConsoleWarning } from './consoleWarning';

import { TallerApp } from './TallerApp';

// 🚨 Mostrar advertencia de consola siempre (desarrollo y producción)
// Esto disuade a usuarios de copiar/pegar código malicioso
showConsoleWarning();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TallerApp />
    </ThemeProvider>
  </StrictMode>
);
