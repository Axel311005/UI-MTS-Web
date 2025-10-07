import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './app.css';
import { ThemeProvider } from './shared/components/layouts/ThemeProvider';

import { TallerApp } from './TallerApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TallerApp />
    </ThemeProvider>
  </StrictMode>
);
