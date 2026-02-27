'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid #333',
          },
          success: {
            iconTheme: {
              primary: '#ffd700',
              secondary: '#1a1a2e',
            },
          },
        }}
      />
    </>
  );
}