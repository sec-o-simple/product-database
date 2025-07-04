import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import './index.css'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import deLocales from './locales/de.json'
import enLocales from './locales/en.json'

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function getBrowserLanguage(): string {
  // Get browser language (returns full code like 'en-US' or 'de-DE')
  const browserLang = navigator.language
  // Get the primary language part (en, de, etc)
  const primaryLang = browserLang.split('-')[0]

  // Only return if it's one of our supported languages
  const supportedLanguages = ['en', 'de']
  return supportedLanguages.includes(primaryLang) ? primaryLang : 'en'
}

const savedLang = localStorage.getItem('i18nextLng')
const defaultLang = savedLang || getBrowserLanguage()

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      de: deLocales,
      en: enLocales,
    },
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <ToastProvider />

        <Router>
          <App />
        </Router>
      </HeroUIProvider>
    </QueryClientProvider>
  </StrictMode>,
)
