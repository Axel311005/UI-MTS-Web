import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './app.css';
import { ThemeProvider } from './shared/components/layouts/ThemeProvider';

const TallerApp = lazy(() =>
  import('./TallerApp').then((m) => ({ default: m.TallerApp }))
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-bg-main to-bg-accent">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-accent mb-4"></div>
            <span className="text-base font-medium text">
              Cargando aplicación…
            </span>
          </div>
        }
      >
        <TallerApp />
      </Suspense>
    </ThemeProvider>
  </StrictMode>
);
