import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, CheckSquare, File, Users, Settings, HelpCircle, LogOut, ShieldCheck } from 'lucide-react'
import api from '../services/api'

const navItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { name: 'Projects', icon: <FolderOpen size={16} /> },
  { name: 'Tasks', icon: <CheckSquare size={16} /> },
  { name: 'Files', icon: <File size={16} /> },
  { name: 'Team', icon: <Users size={16} /> },
  { name: 'Settings', icon: <Settings size={16} /> },
]

const routeFor = (name) => ({
  Dashboard: '/dashboard', Projects: '/projects', Tasks: '/tasks',
  Files: '/files', Team: '/team', Admin: '/admin', Settings: '/settings',
}[name])

export default function Sidebar({ active }) {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    api.get('/api/auth/me').then((res) => setIsAdmin(res.data.role === 'admin')).catch(() => {})
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const itemClass = (name) =>
    `text-left px-3 py-2 text-sm font-medium transition flex items-center gap-3 rounded-lg ${
      name === active ? 'border-l-4' : 'border-l-4 border-transparent hover:bg-black hover:bg-opacity-5'
    }`
  const itemStyle = (name) =>
    name === active
      ? { backgroundColor: '#D9E6DA', borderColor: '#0D631B', color: '#0D631B' }
      : { color: 'var(--text-secondary)' }

  return (
    <aside
      className="w-60 border-r flex flex-col py-6 px-4 fixed h-full"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
    >
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0D631B' }}>
          <div className="grid grid-cols-2 gap-0.5 p-1.5">
            <div className="bg-white rounded-sm w-2.5 h-2.5"></div>
            <div className="bg-white rounded-sm w-2.5 h-2.5"></div>
            <div className="bg-white rounded-sm w-2.5 h-2.5"></div>
            <div className="bg-white rounded-sm w-2.5 h-2.5"></div>
          </div>
        </div>
        <span className="font-semibold text-lg" style={{ color: '#0D631B' }}>Trackly</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button key={item.name} onClick={() => navigate(routeFor(item.name))} className={itemClass(item.name)} style={itemStyle(item.name)}>
            {item.icon}
            {item.name}
          </button>
        ))}
        {isAdmin && (
          <button onClick={() => navigate('/admin')} className={itemClass('Admin')} style={itemStyle('Admin')}>
            <ShieldCheck size={16} />
            Admin
          </button>
        )}
      </nav>
      <div className="border-t pt-4 flex flex-col gap-1" style={{ borderColor: 'var(--border-card)' }}>
        <button className="text-left px-3 py-2 text-sm hover:bg-black hover:bg-opacity-5 rounded-lg flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
          <HelpCircle size={16} /> Support
        </button>
        <button onClick={handleLogout} className="text-left px-3 py-2 text-sm hover:text-red-500 transition flex items-center gap-3 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )
}