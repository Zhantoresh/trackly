import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, CheckSquare, File, Users, Settings, HelpCircle, LogOut, Calendar } from 'lucide-react'

const stats = [
  { label: 'Active Projects', value: 8 },
  { label: 'Tasks In Progress', value: 24 },
  { label: 'Upcoming Deadlines', value: 5 },
  { label: 'Uploaded Files', value: 132 },
]

const statusBg = {
  'In Progress': '#D9E6DA',
  'Done': '#007F35',
  'Review': '#FFDAD6',
}

const statusText = {
  'In Progress': '#556158',
  'Done': '#006327',
  'Review': '#BA1A1A',
}

const navItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { name: 'Projects', icon: <FolderOpen size={16} /> },
  { name: 'Tasks', icon: <CheckSquare size={16} /> },
  { name: 'Files', icon: <File size={16} /> },
  { name: 'Team', icon: <Users size={16} /> },
  { name: 'Settings', icon: <Settings size={16} /> },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [projects, setProjects] = useState([
    { id: 1, name: 'Trackly', description: 'Internal project management platform.', status: 'In Progress', percent: 40 },
    { id: 2, name: 'ESG Bot', description: 'Telegram bot for ESG regulatory updates.', status: 'In Progress', percent: 68 },
    { id: 3, name: 'Bookify', description: 'Book management REST API with Go.', status: 'Done', percent: 100 },
    { id: 4, name: 'Fitness App', description: 'Cross-platform fitness tracking app.', status: 'Review', percent: 72 },
  ])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleDeleteProject = (id) => {
    if (confirm('Delete this project?')) {
      setProjects(projects.filter(p => p.id !== id))
    }
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
              onClick={() => {
                if (item.name === 'Tasks') navigate('/tasks')
                if (item.name === 'Dashboard') navigate('/dashboard')
              }}
              className={`text-left px-3 py-2 text-sm font-medium transition flex items-center gap-3 ${
                item.name === 'Dashboard'
                  ? 'border-l-4 rounded-r-lg'
                  : 'border-l-4 border-transparent rounded-lg hover:bg-gray-100 text-gray-600'
              }`}
              style={item.name === 'Dashboard' ? { backgroundColor: '#D9E6DA', borderColor: '#0D631B', color: '#0D631B' } : {}}
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

      <main className="ml-60 flex-1 min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
        <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
          <input type="text" placeholder="Search projects, tasks, or files..." className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 w-72 focus:outline-none bg-gray-50" />
          <button onClick={() => setShowCreateModal(true)} className="text-white px-4 py-2 rounded-lg text-sm font-medium transition" style={{ backgroundColor: '#0D631B' }}>
            + New Project
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
            <span className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 bg-white flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-5">
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-semibold text-gray-800">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Current Projects</h2>
            <button className="text-sm hover:underline" style={{ color: '#0D631B' }}>View All</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-green-300 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-800">{project.name}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                    className="text-gray-400 hover:text-red-500 text-xs transition"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">{project.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-3 py-1 font-medium" style={{ backgroundColor: statusBg[project.status], color: statusText[project.status], borderRadius: '4px' }}>
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-400">{project.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New Project</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Project name</label>
                <input type="text" placeholder="Enter project name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Description</label>
                <textarea placeholder="Enter project description" rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Deadline</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 text-white rounded-lg py-2 text-sm font-medium transition" style={{ backgroundColor: '#0D631B' }}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}