import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#1a1e28',
          color: '#c9d1d9',
          border: '1px solid #2a3042',
          borderRadius: '10px',
          fontSize: '0.83rem',
          padding: '10px 14px',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#0b0d12' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#0b0d12' },
        },
      }}
    />
  );
}
