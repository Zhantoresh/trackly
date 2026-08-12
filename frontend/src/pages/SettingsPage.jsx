import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const TABS = ['Profile', 'Appearance', 'Language', 'Danger Zone']

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Profile')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [theme, setTheme] = useState(() => localStorage.getItem('trackly_theme') || 'system')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('trackly_sidebar_collapsed') === 'true')
  const [language, setLanguage] = useState(() => localStorage.getItem('trackly_language') || 'en')
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
  }

  const applyLanguage = (value) => {
    setLanguage(value)
    localStorage.setItem('trackly_language', value)
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
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h1>

        {/* Tabs */}
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
              {tab}
            </button>
          ))}
        </div>

        {/* Profile */}
        {activeTab === 'Profile' && (
          <div className="border rounded-lg p-6 max-w-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Profile</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>Full name</label>
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
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
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
              Save changes
            </button>
          </div>
        )}

        {/* Appearance */}
        {activeTab === 'Appearance' && (
          <div className="border rounded-lg p-6 max-w-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Appearance</h2>

            <div className="mb-6">
              <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Theme</label>
              <div className="flex gap-2">
                {['light', 'dark', 'system'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => applyTheme(opt)}
                    className="flex-1 border rounded-lg py-2 text-sm capitalize transition"
                    style={
                      theme === opt
                        ? { borderColor: '#16A34A', color: '#0D631B', backgroundColor: '#EAF3DE' }
                        : { borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-card)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Collapse sidebar</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Show icons only, more room for content</p>
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

        {/* Language */}
        {activeTab === 'Language' && (
          <div className="border rounded-lg p-6 max-w-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Language</h2>
            <div className="flex gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'ru', label: 'Русский' },
              ].map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => applyLanguage(opt.code)}
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

        {/* Danger Zone */}
        {activeTab === 'Danger Zone' && (
          <div className="flex flex-col gap-6 max-w-lg">
            <div className="border rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Confirm before deleting</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ask for confirmation before deleting tasks or files</p>
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
              <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Sign out</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Sign out of your account on this device.</p>
              <button
                onClick={handleLogout}
                className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}