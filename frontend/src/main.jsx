import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App.jsx'
import './index.css'

console.log('🚀 Starting application...');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

try {
  console.log('📦 Creating root element...');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('✅ Root element created');

  console.log('🎨 Rendering app...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Fatal error during app initialization:', error);
  document.getElementById('root').innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fee;">
      <div style="background: white; padding: 2rem; border-radius: 0.5rem; max-width: 500px; text-align: center;">
        <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">
          ⚠️ Application Error
        </h1>
        <p style="color: #666; margin-bottom: 1rem;">
          ${error.message || 'Failed to start application'}
        </p>
        <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; text-align: left; font-size: 0.875rem;">
${error.stack || String(error)}
        </pre>
        <button onclick="location.reload()" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
