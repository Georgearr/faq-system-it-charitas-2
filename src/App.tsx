import React, { useEffect } from 'react';
import { AppRouter } from '@/app/AppRouter';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useAuthStore } from '@/store/authStore';

export const App: React.FC = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
};

export default App;
