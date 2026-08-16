import { useState, useEffect } from 'react'
import { FileText, Image, Download, Trash2 } from 'lucide-react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../i18n/LanguageContext'

const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp']
const fileIcon = (fileName) => {
  const ext = (fileName || '').split('.').pop().toLowerCase()
  return imageExts.includes(ext)
    ? <Image size={16} style={{ color: 'var(--text-muted)' }} />
    : <FileText size={16} style={{ color: 'var(--text-muted)' }} />
}

export default function FilesPage() {
  const { t } = useLanguage()

  const [currentUser, setCurrentUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

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

      const filesLists = await Promise.all(
        projectsRes.data.map((p) => api.get(`/api/projects/${p.id}/files`))
      )
      const combined = []
      projectsRes.data.forEach((p, i) => {
        for (const f of filesLists[i].data) {
          combined.push({ ...f, project_title: p.title })
        }
      })
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setRows(combined)
    } catch (err) {
      setError('Could not load files.')
    } finally {
      setLoading(false)
    }
  }

  const canManage = currentUser?.role === 'mentor' || currentUser?.role === 'admin'

  const openUploadModal = () => {
    if (projects.length === 0) return
    setSelectedProjectId(projects.length === 1 ? projects[0].id : '')
    setSelectedFile(null)
    setShowUploadModal(true)
  }

  const handleUpload = async () => {
    if (!selectedProjectId || !selectedFile) return
    const formData = new FormData()
    formData.append('file', selectedFile)
    setUploading(true)
    try {
      await api.post(`/api/projects/${selectedProjectId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setShowUploadModal(false)
      setSelectedFile(null)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not upload file.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (projectId, fileId) => {
    if (!confirm('Delete this file?')) return
    try {
      await api.delete(`/api/projects/${projectId}/files/${fileId}`)
      setRows(rows.filter((f) => f.id !== fileId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not delete file.')
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
      <Sidebar active="Files" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('filesTitle')}</h1>
          {canManage && (
            <button
              onClick={openUploadModal}
              disabled={projects.length === 0}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              style={{ backgroundColor: '#0D631B' }}
            >
              + {t('uploadFile')}
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {rows.length === 0 ? (
          <div
            className="border rounded-lg p-8 text-center text-sm"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}
          >
            {canManage ? t('noProjectsCreateFromDashboard') : t('noFilesUploaded')}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
                  <th className="px-5 py-3 font-medium">{t('file')}</th>
                  <th className="px-5 py-3 font-medium">{t('project')}</th>
                  <th className="px-5 py-3 font-medium">{t('created')}</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((file) => (
                  <tr key={file.id} className="border-b last:border-0 hover:bg-black hover:bg-opacity-5" style={{ borderColor: 'var(--border-card)' }}>
                    <td className="px-5 py-3 font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      {fileIcon(file.file_name)}
                      {file.file_name}
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{file.project_title}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>{new Date(file.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-green-700 transition"
                          style={{ color: 'var(--text-muted)' }}
                          title={t('download')}
                        >
                          <Download size={16} />
                        </a>
                        {canManage && (
                          <button
                            onClick={() => handleDelete(file.project_id, file.id)}
                            className="hover:text-red-500 transition"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-md shadow-lg" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('uploadFileModalTitle')}</h2>
            <div className="flex flex-col gap-3">
              {projects.length > 1 && (
                <div>
                  <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>{t('project')}</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
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
              <div>
                <label className="text-sm mb-1 block" style={{ color: 'var(--text-secondary)' }}>{t('file')}</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border-card)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50 transition"
                style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedProjectId || !selectedFile || uploading}
                className="flex-1 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#0D631B' }}
              >
                {t('upload')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
