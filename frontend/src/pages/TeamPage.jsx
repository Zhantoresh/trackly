import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../i18n/LanguageContext'

const roleBg = { owner: '#D9E6DA', member: '#F1F0EB' }
const roleText = { owner: '#0D631B', member: '#5F5E5A' }
const avatarPalette = [
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FAEEDA', text: '#854F0B' },
  { bg: '#FAECE7', text: '#993C1D' },
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#E6F1FB', text: '#185FA5' },
]

const initials = (name) => (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
const avatarColor = (name) => avatarPalette[(name || '').charCodeAt(0) % avatarPalette.length || 0]

export default function TeamPage() {
  const { t } = useLanguage()
  const roleLabel = { owner: t('owner'), member: t('member') }

  const [currentUser, setCurrentUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [availableStudents, setAvailableStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [meRes, projectsRes] = await Promise.all([
        api.get('/api/auth/me'),
        api.get('/api/projects'),
      ])
      setCurrentUser(meRes.data)
      setProjects(projectsRes.data)

      const membersLists = await Promise.all(
        projectsRes.data.map((p) => api.get(`/api/projects/${p.id}/members`))
      )
      const combined = []
      projectsRes.data.forEach((p, i) => {
        for (const m of membersLists[i].data) {
          combined.push({ ...m, project_id: p.id, project_title: p.title })
        }
      })
      setRows(combined)
    } catch (err) {
      setError('Could not load the team.')
    } finally {
      setLoading(false)
    }
  }

  const canManage = currentUser?.role === 'mentor' || currentUser?.role === 'admin'

  const loadAvailableStudents = async (projectId) => {
    setLoadingStudents(true)
    try {
      const res = await api.get(`/api/projects/${projectId}/available-students`)
      setAvailableStudents(res.data)
    } catch (err) {
      setAvailableStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  const openAddModal = () => {
    if (projects.length === 0) return
    const defaultProjectId = projects.length === 1 ? projects[0].id : ''
    setSelectedProjectId(defaultProjectId)
    setSelectedStudentId('')
    setAvailableStudents([])
    setShowAddModal(true)
    if (defaultProjectId) loadAvailableStudents(defaultProjectId)
  }

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId)
    setSelectedStudentId('')
    if (projectId) loadAvailableStudents(projectId)
    else setAvailableStudents([])
  }

  const handleAddMember = async () => {
    if (!selectedProjectId || !selectedStudentId) return
    try {
      await api.post(`/api/projects/${selectedProjectId}/members`, { user_id: selectedStudentId })
      setShowAddModal(false)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not add member.')
    }
  }

  const handleRemoveMember = async (projectId, userId) => {
    if (!confirm(t('confirmRemoveMember'))) return
    try {
      await api.delete(`/api/projects/${projectId}/members/${userId}`)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not remove member.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)' }}>
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar active="Team" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('teamTitle')}</h1>
          {canManage && (
            <button
              onClick={openAddModal}
              disabled={projects.length === 0}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              style={{ backgroundColor: '#0D631B' }}
            >
              + {t('inviteMember')}
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {rows.length === 0 ? (
          <div
            className="border rounded-lg p-8 text-center text-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}
          >
            {canManage ? t('noProjectsCreateFromDashboard') : t('noTeamYet')}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
                  <th className="px-5 py-3 font-medium">{t('member')}</th>
                  <th className="px-5 py-3 font-medium">{t('email')}</th>
                  <th className="px-5 py-3 font-medium">{t('project')}</th>
                  <th className="px-5 py-3 font-medium">{t('role')}</th>
                  {canManage && <th className="px-5 py-3 font-medium"></th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr
                    key={`${m.project_id}-${m.user_id}`}
                    className="border-b last:border-0 hover:bg-black hover:bg-opacity-5"
                    style={{ borderColor: 'var(--border-card)' }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                          style={{ backgroundColor: avatarColor(m.name).bg, color: avatarColor(m.name).text }}
                        >
                          {initials(m.name)}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{m.project_title}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs px-3 py-1 font-medium rounded"
                        style={{ backgroundColor: roleBg[m.role], color: roleText[m.role] }}
                      >
                        {roleLabel[m.role]}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-5 py-3 text-right">
                        {m.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(m.project_id, m.user_id)}
                            className="text-gray-400 hover:text-red-500 transition"
                            title={t('removeMember')}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-md shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('addStudentModalTitle')}</h2>

            {projects.length > 1 && (
              <div className="mb-4">
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>{t('project')}</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                >
                  <option value="">{t('selectProject')}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedProjectId && (
              loadingStudents ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('loading')}</p>
              ) : availableStudents.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('noStudentsAvailable')}</p>
              ) : (
                <div>
                  <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>{t('student')}</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    style={{ borderColor: 'var(--border-card)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                  >
                    <option value="">{t('selectStudent')}</option>
                    {availableStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
              )
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50 transition"
                style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedProjectId || !selectedStudentId}
                className="flex-1 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#0D631B' }}
              >
                {t('add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
