import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

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

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
      <Sidebar active="Projects" />

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
