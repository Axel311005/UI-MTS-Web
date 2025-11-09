import { appRouter } from './router/app.router';
import { RouterProvider } from 'react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
import { Toaster } from 'sonner';
import { useEffect, useRef } from 'react';
import { useAuthStore } from './auth/store/auth.store';
export const TallerApp = () => {
  const checkAuthStatus = useAuthStore((s) => s.checkAuthStatus);
  const authStatus = useAuthStore((s) => s.authStatus);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Verificar solo una vez al inicio si está en checking
    if (!hasCheckedRef.current && authStatus === 'checking') {
      hasCheckedRef.current = true;
      checkAuthStatus();
    }
  }, [authStatus, checkAuthStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <RouterProvider router={appRouter} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
