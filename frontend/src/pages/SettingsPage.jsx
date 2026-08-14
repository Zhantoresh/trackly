import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../i18n/LanguageContext'

const TABS = ['Profile', 'Appearance', 'Language', 'Danger Zone']
const TAB_KEYS = { Profile: 'profile', Appearance: 'appearance', Language: 'language', 'Danger Zone': 'dangerZone' }

export default function SettingsPage() {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const [activeTab, setActiveTab] = useState('Profile')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [theme, setTheme] = useState(() => localStorage.getItem('trackly_theme') || 'system')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('trackly_sidebar_collapsed') === 'true')
  const [confirmBeforeDelete, setConfirmBeforeDelete] = useState(() => localStorage.getItem('trackly_confirm_delete') !== 'false')

  const applyTheme = (value) => {
    setTheme(value)
    localStorage.setItem('trackly_theme', value)
    const root = document.documentElement
    if (value === 'dark') {
      root.classList.add('dark')
    } else if (value === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    }
  }

  const applySidebarCollapsed = (value) => {
    setSidebarCollapsed(value)
    localStorage.setItem('trackly_sidebar_collapsed', String(value))
    window.dispatchEvent(new CustomEvent('trackly_sidebar_toggle', { detail: value }))
  }

  const applyConfirmDelete = (value) => {
    setConfirmBeforeDelete(value)
    localStorage.setItem('trackly_confirm_delete', String(value))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar active="Settings" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: 'var(--bg-page)' }}>
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>{t('settingsTitle')}</h1>

        <div className="flex gap-1 border-b mb-6" style={{ borderColor: 'var(--border-card)' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-sm font-medium border-b-2 transition"
              style={
                activeTab === tab
                  ? { borderColor: '#0D631B', color: '#0D631B' }
                  : { borderColor: 'transparent', color: 'var(--text-secondary)' }
              }
            >
              {t(TAB_KEYS[tab])}
            </button>
          ))}
        </div>

        {activeTab === 'Profile' && (
          <div className="border rounded-lg p-6 max-w-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('profile')}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>{t('fullName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
                  style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
                  style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <button className="mt-5 text-white px-4 py-2 rounded-lg text-sm font-medium transition" style={{ backgroundColor: '#0D631B' }}>
              {t('saveChanges')}
            </button>
          </div>
        )}

        {activeTab === 'Appearance' && (
          <div className="border rounded-lg p-6 max-w-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('appearance')}</h2>

            <div className="mb-6">
              <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>{t('theme')}</label>
              <div className="flex gap-2">
                {[
                  { code: 'light', label: t('light') },
                  { code: 'dark', label: t('dark') },
                  { code: 'system', label: t('system') },
                ].map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => applyTheme(opt.code)}
                    className="flex-1 border rounded-lg py-2 text-sm transition"
                    style={
                      theme === opt.code
                        ? { borderColor: '#16A34A', color: '#0D631B', backgroundColor: '#EAF3DE' }
                        : { borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-card)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('collapseSidebar')}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('collapseSidebarDesc')}</p>
              </div>
              <button
                onClick={() => applySidebarCollapsed(!sidebarCollapsed)}
                className="w-11 h-6 rounded-full transition relative"
                style={{ backgroundColor: sidebarCollapsed ? '#0D631B' : 'var(--border-card)' }}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${sidebarCollapsed ? 'left-5' : 'left-0.5'}`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Language' && (
          <div className="border rounded-lg p-6 max-w-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('language')}</h2>
            <div className="flex gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'ru', label: 'Русский' },
                { code: 'kk', label: 'Қазақша' },
              ].map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => setLanguage(opt.code)}
                  className="flex-1 border rounded-lg py-2 text-sm transition"
                  style={
                    language === opt.code
                      ? { borderColor: '#16A34A', color: '#0D631B', backgroundColor: '#EAF3DE' }
                      : { borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Danger Zone' && (
          <div className="flex flex-col gap-6 max-w-lg">
            <div className="border rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('confirmBeforeDeleting')}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('confirmBeforeDeletingDesc')}</p>
                </div>
                <button
                  onClick={() => applyConfirmDelete(!confirmBeforeDelete)}
                  className="w-11 h-6 rounded-full transition relative"
                  style={{ backgroundColor: confirmBeforeDelete ? '#0D631B' : 'var(--border-card)' }}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${confirmBeforeDelete ? 'left-5' : 'left-0.5'}`}
                  />
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
              <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('signOut')}</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('signOutDesc')}</p>
              <button
                onClick={handleLogout}
                className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}