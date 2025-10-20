import { appRouter } from './router/app.router';
import { RouterProvider } from 'react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useAuthStore } from './auth/store/auth.store';
export const TallerApp = () => {
  const checkAuthStatus = useAuthStore((s) => s.checkAuthStatus);
  useEffect(() => {
    // Attempt to validate/refresh auth on app start (loads roles)
    checkAuthStatus();
  }, [checkAuthStatus]);
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <RouterProvider router={appRouter} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
