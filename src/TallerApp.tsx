import { appRouter } from './router/app.router';
import { RouterProvider } from 'react-router';

export const TallerApp = () => {
  return <RouterProvider router={appRouter} />;
};
