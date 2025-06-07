import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { HeroUIProvider } from '@heroui/react'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";


import App from './App'

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false
        }
    }
});

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <App />
      </HeroUIProvider>
    </QueryClientProvider>
  </StrictMode>,
)
