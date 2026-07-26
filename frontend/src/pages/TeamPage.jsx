import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, CheckSquare, File, Users, Settings, HelpCircle, LogOut } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { name: 'Projects', icon: <FolderOpen size={16} /> },
  { name: 'Tasks', icon: <CheckSquare size={16} /> },
  { name: 'Files', icon: <File size={16} /> },
  { name: 'Team', icon: <Users size={16} /> },
  { name: 'Settings', icon: <Settings size={16} /> },
]

const members = [
  { id: 1, name: 'Zhantore', role: 'owner', email: 'zhantore29@gmail.com', initials: 'ZH', color: '#E1F5EE', text: '#0F6E56' },
  { id: 2, name: 'Dastan', role: 'member', email: 'dastan@example.com', initials: 'DA', color: '#FAEEDA', text: '#854F0B' },
  { id: 3, name: 'Birzhan', role: 'member', email: 'birzhan@example.com', initials: 'BI', color: '#FAECE7', text: '#993C1D' },
  { id: 4, name: 'Alua', role: 'member', email: 'alua@example.com', initials: 'AL', color: '#EEEDFE', text: '#3C3489' },
]

const roleBg = { owner: '#D9E6DA', member: '#F1F0EB' }
const roleText = { owner: '#0D631B', member: '#5F5E5A' }

export default function TeamPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const routeFor = (name) => ({
    Dashboard: '/dashboard',
    Projects: '/projects',
    Tasks: '/tasks',
    Files: '/files',
    Team: '/team',
    Settings: '/settings',
  }[name])

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
              onClick={() => navigate(routeFor(item.name))}
              className={`text-left px-3 py-2 text-sm font-medium transition flex items-center gap-3 ${
                item.name === 'Team'
                  ? 'border-l-4 rounded-r-lg'
                  : 'border-l-4 border-transparent rounded-lg hover:bg-gray-100 text-gray-600'
              }`}
              style={item.name === 'Team' ? { backgroundColor: '#D9E6DA', borderColor: '#0D631B', color: '#0D631B' } : {}}
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
