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
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar active="Dashboard" />

      <main className="ml-60 flex-1 min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="px-8 py-3 flex items-center justify-between border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
          <input
            type="text"
            placeholder="Search projects, tasks, or files..."
            className="border rounded-lg px-4 py-2 text-sm w-72 focus:outline-none"
            style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
          />
          <button onClick={() => setShowCreateModal(true)} className="text-white px-4 py-2 rounded-lg text-sm font-medium transition" style={{ backgroundColor: '#0D631B' }}>
            + New Project
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
            <span className="text-sm border rounded-lg px-3 py-1.5 flex items-center gap-2" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-card)' }}>
              <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="border rounded-lg p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                <p className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {isMentorOrAdmin && (
            <div className="mb-8">
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Mentor Overview</h2>
              {overviewLoading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading overview...</p>}
              {!overviewLoading && overview.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No projects yet.</p>
              )}
              <div className="flex flex-col gap-4">
                {overview.map((proj) => (
                  <div key={proj.project_id} className="border rounded-lg p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => navigate(`/project/${proj.project_id}`)}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: 'var(--text-primary)' }}
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
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{proj.done_tasks}/{proj.total_tasks} done</span>
                      </div>
                    </div>

                    <div className="w-full rounded-full h-2 mb-4" style={{ backgroundColor: 'var(--border-card)' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${proj.completion_rate}%`, backgroundColor: '#0D631B' }}
                      />
                    </div>

                    {proj.students.length === 0 ? (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No students assigned yet.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-card)' }}>
                            <th className="py-1.5 font-medium">Student</th>
                            <th className="py-1.5 font-medium">Tasks</th>
                            <th className="py-1.5 font-medium">Done</th>
                            <th className="py-1.5 font-medium">Overdue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proj.students.map((s) => (
                            <tr key={s.user_id} className="border-b last:border-0" style={{ borderColor: 'var(--border-card)' }}>
                              <td className="py-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>{s.name}</td>
                              <td className="py-1.5" style={{ color: 'var(--text-secondary)' }}>{s.total_tasks}</td>
                              <td className="py-1.5" style={{ color: 'var(--text-secondary)' }}>{s.done_tasks}</td>
                              <td className="py-1.5">
                                {s.overdue_tasks > 0 ? (
                                  <span className="font-medium" style={{ color: '#993C1D' }}>{s.overdue_tasks}</span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>0</span>
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
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Current Projects</h2>
            <button onClick={() => navigate('/projects')} className="text-sm hover:underline" style={{ color: '#0D631B' }}>View All</button>
          </div>

          {loading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading projects...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && projects.length === 0 && (
            <div className="border rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>No projects yet.</p>
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
                className="border rounded-lg p-5 cursor-pointer hover:border-green-300 transition"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                    className="text-xs hover:text-red-500 transition"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{project.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-md shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Project</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>Project name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none"
                  style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50 transition" style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
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