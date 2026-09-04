import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { z } from 'zod'
import App from './App'
import './index.css'
import { registerServiceWorker } from './lib/register-service-worker'
import { applyTheme, getStoredTheme } from './lib/theme'

z.config(z.locales.fa())
applyTheme(getStoredTheme())
registerServiceWorker()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
