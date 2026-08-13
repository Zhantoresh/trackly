import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useLanguage } from '../i18n/LanguageContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(t('wrongCredentials'))
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="p-8 rounded-xl border w-full max-w-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
        <div className="flex items-center gap-2 mb-6">
          <img src="/src/assets/logo.png" alt="Trackly" className="w-7 h-7" />
          <span className="font-semibold text-green-700 text-base">Trackly</span>
        </div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('welcomeBack')}</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{t('signInToWorkspace')}</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{t('email')}</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
              style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{t('password')}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
              style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition"
          >
            {t('signIn')}
          </button>
        </form>
      </div>
      <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>© 2026 Trackly.</p>
    </div>
  )
}