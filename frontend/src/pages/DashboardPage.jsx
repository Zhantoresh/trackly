import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, AlertTriangle } from 'lucide-react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [isMentorOrAdmin, setIsMentorOrAdmin] = useState(false)
  const [overview, setOverview] = useState([])
  const [overviewLoading, setOverviewLoading] = useState(false)

  useEffect(() => {
    loadProjects()
    api.get('/api/auth/me').then((res) => {
      const role = res.data.role
      if (role === 'admin' || role === 'mentor') {
        setIsMentorOrAdmin(true)
        loadOverview()
      }
    }).catch(() => {})
  }, [])

  const loadOverview = async () => {
    setOverviewLoading(true)
    try {
      const res = await api.get('/api/dashboard/overview')
      setOverview(res.data)
    } catch (err) {
      console.error('Could not load overview')
    } finally {
      setOverviewLoading(false)
    }
  }

  const loadProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/projects')
      setProjects(res.data)
    } catch (err) {
      setError('Не удалось загрузить проекты.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await api.delete(`/api/projects/${id}`)
      setProjects(projects.filter((p) => p.id !== id))
    } catch (err) {
      alert('Could not delete project.')
    }
  }

  const handleCreateProject = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/api/projects', { title: newTitle, description: newDescription })
      setProjects([...projects, res.data])
      setShowCreateModal(false)
      setNewTitle('')
      setNewDescription('')
    } catch (err) {
      alert('Could not create project.')
    } finally {
      setCreating(false)
    }
  }

  const stats = [
    { label: 'Active Projects', value: projects.length },
    { label: 'Tasks In Progress', value: '—' },
    { label: 'Upcoming Deadlines', value: '—' },
    { label: 'Uploaded Files', value: '—' },
  ]

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
      <Sidebar active="Dashboard" />

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

          {isMentorOrAdmin && (
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Mentor Overview</h2>
              {overviewLoading && <p className="text-sm text-gray-500">Loading overview...</p>}
              {!overviewLoading && overview.length === 0 && (
                <p className="text-sm text-gray-400">No projects yet.</p>
              )}
              <div className="flex flex-col gap-4">
                {overview.map((proj) => (
                  <div key={proj.project_id} className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => navigate(`/project/${proj.project_id}`)}
                        className="text-sm font-semibold text-gray-800 hover:underline"
                      >
                        {proj.project_title}
                      </button>
                      <div className="flex items-center gap-3">
                        {proj.overdue_tasks > 0 && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: '#FAECE7', color: '#993C1D' }}>
                            <AlertTriangle size={12} />
                            {proj.overdue_tasks} overdue
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{proj.done_tasks}/{proj.total_tasks} done</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${proj.completion_rate}%`, backgroundColor: '#0D631B' }}
                      />
                    </div>

                    {proj.students.length === 0 ? (
                      <p className="text-xs text-gray-400">No students assigned yet.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-gray-100">
                            <th className="py-1.5 font-medium">Student</th>
                            <th className="py-1.5 font-medium">Tasks</th>
                            <th className="py-1.5 font-medium">Done</th>
                            <th className="py-1.5 font-medium">Overdue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proj.students.map((s) => (
                            <tr key={s.user_id} className="border-b border-gray-50 last:border-0">
                              <td className="py-1.5 text-gray-700 font-medium">{s.name}</td>
                              <td className="py-1.5 text-gray-500">{s.total_tasks}</td>
                              <td className="py-1.5 text-gray-500">{s.done_tasks}</td>
                              <td className="py-1.5">
                                {s.overdue_tasks > 0 ? (
                                  <span className="font-medium" style={{ color: '#993C1D' }}>{s.overdue_tasks}</span>
                                ) : (
                                  <span className="text-gray-400">0</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Current Projects</h2>
            <button onClick={() => navigate('/projects')} className="text-sm hover:underline" style={{ color: '#0D631B' }}>View All</button>
          </div>

          {loading && <p className="text-sm text-gray-500">Loading projects...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && projects.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-sm text-gray-500 mb-3">No projects yet.</p>
              <button onClick={() => setShowCreateModal(true)} className="text-white px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#0D631B' }}>
                Create your first project
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-green-300 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-800">{project.title}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                    className="text-gray-400 hover:text-red-500 text-xs transition"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">{project.description || 'No description'}</p>
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
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={creating || !newTitle.trim()}
                className="flex-1 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
                style={{ backgroundColor: '#0D631B' }}
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
