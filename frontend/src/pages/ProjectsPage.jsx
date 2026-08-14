import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../i18n/LanguageContext'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
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
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar active="Projects" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: 'var(--bg-page)' }}>
        <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>{t('projectsTitle')}</h1>

        {loading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('loading')}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('noProjectsCreateFromDashboard')}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="border rounded-lg p-5 cursor-pointer hover:border-green-300 transition"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            >
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{project.description || t('noDescription')}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}