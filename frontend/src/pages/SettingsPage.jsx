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
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
      <Sidebar active="Settings" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: '#F6FAF7' }}>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-green-700 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile */}
        {activeTab === 'Profile' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Profile</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
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
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Appearance</h2>

            <div className="mb-6">
              <label className="text-sm text-gray-600 mb-2 block">Theme</label>
              <div className="flex gap-2">
                {['light', 'dark', 'system'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => applyTheme(opt)}
                    className={`flex-1 border rounded-lg py-2 text-sm capitalize transition ${
                      theme === opt
                        ? 'border-green-600 text-green-700 bg-green-50'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-800 font-medium">Collapse sidebar</p>
                <p className="text-xs text-gray-500">Show icons only, more room for content</p>
              </div>
              <button
                onClick={() => applySidebarCollapsed(!sidebarCollapsed)}
                className={`w-11 h-6 rounded-full transition relative ${sidebarCollapsed ? 'bg-green-700' : 'bg-gray-300'}`}
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
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Language</h2>
            <div className="flex gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'ru', label: 'Русский' },
              ].map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => applyLanguage(opt.code)}
                  className={`flex-1 border rounded-lg py-2 text-sm transition ${
                    language === opt.code
                      ? 'border-green-600 text-green-700 bg-green-50'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-medium">Confirm before deleting</p>
                  <p className="text-xs text-gray-500">Ask for confirmation before deleting tasks or files</p>
                </div>
                <button
                  onClick={() => applyConfirmDelete(!confirmBeforeDelete)}
                  className={`w-11 h-6 rounded-full transition relative ${confirmBeforeDelete ? 'bg-green-700' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${confirmBeforeDelete ? 'left-5' : 'left-0.5'}`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-1">Sign out</h2>
              <p className="text-sm text-gray-500 mb-4">Sign out of your account on this device.</p>
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