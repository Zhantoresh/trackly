import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, CheckSquare, File, Users, Settings, HelpCircle, LogOut } from 'lucide-react'
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
  Files: '/files', Team: '/team', Settings: '/settings',
}[name])

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/projects')
      .then((res) => setProjects(res.data))
      .catch(() => setError('Could not load projects.'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col py-6 px-4 fixed h-full">
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
            <button
              key={item.name}
              onClick={() => navigate(routeFor(item.name))}
              className={`text-left px-3 py-2 text-sm font-medium transition flex items-center gap-3 ${
                item.name === 'Projects' ? 'border-l-4 rounded-r-lg' : 'border-l-4 border-transparent rounded-lg hover:bg-gray-100 text-gray-600'
              }`}
              style={item.name === 'Projects' ? { backgroundColor: '#D9E6DA', borderColor: '#0D631B', color: '#0D631B' } : {}}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-200 pt-4 flex flex-col gap-1">
          <button className="text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-3">
            <HelpCircle size={16} /> Support
          </button>
          <button onClick={handleLogout} className="text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 transition flex items-center gap-3 rounded-lg">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: '#F6FAF7' }}>
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">Projects</h1>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="text-sm text-gray-500">No projects yet. Create one from the Dashboard.</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-green-300 transition"
            >
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{project.title}</h3>
              <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
