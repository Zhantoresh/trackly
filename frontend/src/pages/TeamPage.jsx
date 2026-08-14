import Sidebar from '../components/Sidebar'
import { useLanguage } from '../i18n/LanguageContext'

const members = [
  { id: 1, name: 'Zhantore', role: 'owner', email: 'zhantore29@gmail.com', initials: 'ZH', color: '#E1F5EE', text: '#0F6E56' },
  { id: 2, name: 'Dastan', role: 'member', email: 'dastan@example.com', initials: 'DA', color: '#FAEEDA', text: '#854F0B' },
  { id: 3, name: 'Birzhan', role: 'member', email: 'birzhan@example.com', initials: 'BI', color: '#FAECE7', text: '#993C1D' },
  { id: 4, name: 'Alua', role: 'member', email: 'alua@example.com', initials: 'AL', color: '#EEEDFE', text: '#3C3489' },
]

const roleBg = { owner: '#D9E6DA', member: '#F1F0EB' }
const roleText = { owner: '#0D631B', member: '#5F5E5A' }

export default function TeamPage() {
  const { t } = useLanguage()
  const roleLabel = { owner: t('owner'), member: t('member') }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar active="Team" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('teamTitle')}</h1>
          <button className="text-white px-4 py-2 rounded-lg text-sm font-medium transition" style={{ backgroundColor: '#0D631B' }}>
            + {t('inviteMember')}
          </button>
        </div>

        <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--border-card)', color: 'var(--text-secondary)' }}>
                <th className="px-5 py-3 font-medium">{t('member')}</th>
                <th className="px-5 py-3 font-medium">{t('email')}</th>
                <th className="px-5 py-3 font-medium">{t('role')}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-black hover:bg-opacity-5" style={{ borderColor: 'var(--border-card)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: m.color, color: m.text }}
                      >
                        {m.initials}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-3 py-1 font-medium rounded"
                      style={{ backgroundColor: roleBg[m.role], color: roleText[m.role] }}
                    >
                      {roleLabel[m.role]}
                    </span>
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