import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('trackly_language') || 'en')

  useEffect(() => {
    const handler = (e) => setLanguageState(e.detail)
    window.addEventListener('trackly_language_change', handler)
    return () => window.removeEventListener('trackly_language_change', handler)
  }, [])

  const setLanguage = (value) => {
    setLanguageState(value)
    localStorage.setItem('trackly_language', value)
    window.dispatchEvent(new CustomEvent('trackly_language_change', { detail: value }))
  }

  const t = (key) => translations[language]?.[key] || translations.en[key] || key

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}