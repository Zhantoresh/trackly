import Sidebar from '../components/Sidebar'

const members = [
  { id: 1, name: 'Zhantore', role: 'owner', email: 'zhantore29@gmail.com', initials: 'ZH', color: '#E1F5EE', text: '#0F6E56' },
  { id: 2, name: 'Dastan', role: 'member', email: 'dastan@example.com', initials: 'DA', color: '#FAEEDA', text: '#854F0B' },
  { id: 3, name: 'Birzhan', role: 'member', email: 'birzhan@example.com', initials: 'BI', color: '#FAECE7', text: '#993C1D' },
  { id: 4, name: 'Alua', role: 'member', email: 'alua@example.com', initials: 'AL', color: '#EEEDFE', text: '#3C3489' },
]

const roleBg = { owner: '#D9E6DA', member: '#F1F0EB' }
const roleText = { owner: '#0D631B', member: '#5F5E5A' }

export default function TeamPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6FAF7' }}>
      <Sidebar active="Team" />

      <main className="ml-60 flex-1 min-h-screen p-8" style={{ backgroundColor: '#F6FAF7' }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Team</h1>
          <button className="text-white px-4 py-2 rounded-lg text-sm font-medium transition" style={{ backgroundColor: '#0D631B' }}>
            + Invite member
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: m.color, color: m.text }}
                      >
                        {m.initials}
                      </div>
                      <span className="text-gray-800 font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{m.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs px-3 py-1 font-medium rounded"
                      style={{ backgroundColor: roleBg[m.role], color: roleText[m.role] }}
                    >
                      {m.role}
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
