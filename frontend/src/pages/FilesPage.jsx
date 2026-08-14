import { FileText, Image, Download } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useLanguage } from '../i18n/LanguageContext'

const files = [
  { id: 1, name: 'dashboard-wireframe.fig', project: 'Trackly', task: 'Design dashboard page', size: '2.4 MB', type: 'design' },
  { id: 2, name: 'project-requirements.pdf', project: 'Trackly', task: 'Design dashboard page', size: '1.1 MB', type: 'doc' },
  { id: 3, name: 'login-wireframe-v2.fig', project: 'Trackly', task: 'Design login page', size: '2.4 MB', type: 'design' },
  { id: 4, name: 'api-contract.md', project: 'Trackly', task: 'Write API documentation', size: '0.3 MB', type: 'doc' },
  { id: 5, name: 'db-schema.png', project: 'Trackly', task: 'DB schema design', size: '0.8 MB', type: 'image' },
]

const typeIcon = {
  design: <FileText size={16} style={{ color: 'var(--text-muted)' }} />,
  doc: <FileText size={16} style={{ color: 'var(--text-muted)' }} />,
  image: <Image size={16} style={{ color: 'var(--text-muted)' }} />,
}

export default function FilesPage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar active="Files" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: 'var(--bg-page)' }}>
        <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>{t('filesTitle')}</h1>

        <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
                <th className="px-5 py-3 font-medium">{t('file')}</th>
                <th className="px-5 py-3 font-medium">{t('project')}</th>
                <th className="px-5 py-3 font-medium">{t('task')}</th>
                <th className="px-5 py-3 font-medium">{t('size')}</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b last:border-0 hover:bg-black hover:bg-opacity-5" style={{ borderColor: 'var(--border-card)' }}>
                  <td className="px-5 py-3 font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {typeIcon[file.type]}
                    {file.name}
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{file.project}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{file.task}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>{file.size}</td>
                  <td className="px-5 py-3">
                    <button className="hover:text-green-700 transition" style={{ color: 'var(--text-muted)' }}>
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}